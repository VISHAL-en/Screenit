import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

interface Session {
  code: string;
  receiverWs: WebSocket;
  presenterWs: WebSocket | null;
  state: 'waiting' | 'pairing' | 'connected';
  createdAt: number;
}

interface SocketMeta {
  role: 'receiver' | 'presenter';
  code: string;
}

// In-memory active sessions
const sessions = new Map<string, Session>();
// Quick lookup of socket metadata
const socketMeta = new Map<WebSocket, SocketMeta>();

function generateCode(): string {
  let code = '';
  let attempts = 0;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    attempts++;
  } while (sessions.has(code) && attempts < 10000);
  return code;
}

function safeSend(ws: WebSocket | null | undefined, data: unknown) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }
}

// Clean up a session completely
function cleanupSession(code: string, reason = 'Session ended') {
  const session = sessions.get(code);
  if (!session) return;

  sessions.delete(code);

  if (session.receiverWs) {
    socketMeta.delete(session.receiverWs);
  }
  if (session.presenterWs) {
    socketMeta.delete(session.presenterWs);
  }
  console.log(`[Session ${code}] Cleaned up (${reason}). Total active sessions: ${sessions.size}`);
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    activeSessions: sessions.size,
    uptime: process.uptime()
  });
});

wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Client connected');

  ws.on('message', (rawMessage: string | Buffer) => {
    let msg: any;
    try {
      msg = JSON.parse(rawMessage.toString());
    } catch {
      safeSend(ws, { type: 'ERROR', code: 'MALFORMED_MESSAGE', message: 'Invalid JSON payload' });
      return;
    }

    if (!msg || typeof msg.type !== 'string') {
      safeSend(ws, { type: 'ERROR', code: 'INVALID_TYPE', message: 'Missing or invalid message type' });
      return;
    }

    switch (msg.type) {
      // 1. RECEIVER REGISTRATION
      case 'REGISTER_RECEIVER': {
        // If this socket was already registered, clean up old session
        const existing = socketMeta.get(ws);
        if (existing) {
          cleanupSession(existing.code, 'Receiver re-registering');
        }

        const code = generateCode();
        const session: Session = {
          code,
          receiverWs: ws,
          presenterWs: null,
          state: 'waiting',
          createdAt: Date.now()
        };

        sessions.set(code, session);
        socketMeta.set(ws, { role: 'receiver', code });

        console.log(`[Receiver] Registered with code ${code}. Total sessions: ${sessions.size}`);
        safeSend(ws, { type: 'RECEIVER_REGISTERED', code });
        break;
      }

      // 2. PRESENTER JOIN
      case 'JOIN_AS_PRESENTER': {
        const code = typeof msg.code === 'string' ? msg.code.trim() : '';

        if (!/^\d{4}$/.test(code)) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'INVALID_CODE_FORMAT',
            message: 'Pairing code must be exactly 4 digits.'
          });
          return;
        }

        const session = sessions.get(code);

        if (!session) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'CODE_NOT_FOUND',
            message: 'Invalid code. Display session not found or has expired.'
          });
          return;
        }

        if (session.state !== 'waiting' || session.presenterWs !== null) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'ALREADY_CONNECTED',
            message: 'This display is already actively paired with another presenter.'
          });
          return;
        }

        // Pair the presenter
        session.presenterWs = ws;
        session.state = 'pairing';
        socketMeta.set(ws, { role: 'presenter', code });

        console.log(`[Presenter] Paired with display ${code}`);

        // Acknowledge presenter
        safeSend(ws, { type: 'PAIR_SUCCESS', code });
        // Notify receiver
        safeSend(session.receiverWs, { type: 'PRESENTER_JOINED' });
        break;
      }

      // 3. WEBRTC SIGNALING: OFFER
      case 'SIGNAL_OFFER': {
        const meta = socketMeta.get(ws);
        if (!meta || meta.role !== 'presenter') {
          safeSend(ws, { type: 'ERROR', code: 'UNAUTHORIZED_SIGNAL', message: 'Only presenter can send offer' });
          return;
        }

        const session = sessions.get(meta.code);
        if (!session || !msg.sdp) {
          safeSend(ws, { type: 'ERROR', code: 'INVALID_SIGNAL', message: 'Active session not found' });
          return;
        }

        safeSend(session.receiverWs, { type: 'SIGNAL_OFFER', sdp: msg.sdp });
        break;
      }

      // 4. WEBRTC SIGNALING: ANSWER
      case 'SIGNAL_ANSWER': {
        const meta = socketMeta.get(ws);
        if (!meta || meta.role !== 'receiver') {
          safeSend(ws, { type: 'ERROR', code: 'UNAUTHORIZED_SIGNAL', message: 'Only receiver can send answer' });
          return;
        }

        const session = sessions.get(meta.code);
        if (!session || !msg.sdp) {
          safeSend(ws, { type: 'ERROR', code: 'INVALID_SIGNAL', message: 'Active session not found' });
          return;
        }

        safeSend(session.presenterWs, { type: 'SIGNAL_ANSWER', sdp: msg.sdp });
        break;
      }

      // 5. WEBRTC SIGNALING: ICE CANDIDATE
      case 'SIGNAL_ICE': {
        const meta = socketMeta.get(ws);
        if (!meta || !msg.candidate) return;

        const session = sessions.get(meta.code);
        if (!session) return;

        if (meta.role === 'presenter') {
          safeSend(session.receiverWs, { type: 'SIGNAL_ICE', candidate: msg.candidate });
        } else if (meta.role === 'receiver') {
          safeSend(session.presenterWs, { type: 'SIGNAL_ICE', candidate: msg.candidate });
        }
        break;
      }

      // 6. CONNECTED STATE
      case 'STREAM_ACTIVE': {
        const meta = socketMeta.get(ws);
        if (meta) {
          const session = sessions.get(meta.code);
          if (session) {
            session.state = 'connected';
            console.log(`[Session ${meta.code}] Stream is active!`);
          }
        }
        break;
      }

      // 7. STOP SHARING (Presenter ended presentation intentionally)
      case 'STOP_SHARING': {
        const meta = socketMeta.get(ws);
        if (!meta || meta.role !== 'presenter') return;

        const session = sessions.get(meta.code);
        if (session) {
          console.log(`[Session ${meta.code}] Presenter stopped sharing`);
          safeSend(session.receiverWs, {
            type: 'PRESENTER_DISCONNECTED',
            reason: 'Presenter stopped sharing.'
          });
          cleanupSession(meta.code, 'Presenter stopped sharing');
        }
        break;
      }

      // 8. PING/PONG KEEP-ALIVE
      case 'PING': {
        safeSend(ws, { type: 'PONG' });
        break;
      }

      default:
        safeSend(ws, { type: 'ERROR', code: 'UNKNOWN_MESSAGE_TYPE', message: `Unknown type: ${msg.type}` });
        break;
    }
  });

  ws.on('close', () => {
    const meta = socketMeta.get(ws);
    if (!meta) return;

    const { role, code } = meta;
    const session = sessions.get(code);

    console.log(`[WebSocket] ${role} closed connection for code ${code}`);

    if (session) {
      if (role === 'receiver') {
        // Receiver disconnected
        if (session.presenterWs) {
          safeSend(session.presenterWs, {
            type: 'RECEIVER_DISCONNECTED',
            message: 'Display was disconnected.'
          });
        }
        cleanupSession(code, 'Receiver socket closed');
      } else if (role === 'presenter') {
        // Presenter disconnected
        safeSend(session.receiverWs, {
          type: 'PRESENTER_DISCONNECTED',
          reason: 'Presenter disconnected.'
        });
        cleanupSession(code, 'Presenter socket closed');
      }
    }
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Error:', err);
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`[Screenit Server] Signaling server running on http://${HOST}:${PORT}`);
});
