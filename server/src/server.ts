import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

interface Session {
  code: string;
  receiverWs: WebSocket | null;
  presenterWs: WebSocket | null;
  state: 'waiting' | 'pairing' | 'connected';
  createdAt: number;
  disconnectTimer?: NodeJS.Timeout | null;
  receiverToken?: string;
  presenterToken?: string;
}

interface SocketMeta {
  role: 'receiver' | 'presenter';
  code: string;
}

interface AliveWebSocket extends WebSocket {
  isAlive?: boolean;
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

  if (session.disconnectTimer) {
    clearTimeout(session.disconnectTimer);
    session.disconnectTimer = null;
  }

  sessions.delete(code);

  if (session.receiverWs) {
    socketMeta.delete(session.receiverWs);
  }
  if (session.presenterWs) {
    socketMeta.delete(session.presenterWs);
  }
  console.log(`[Session ${code}] Cleaned up (${reason}). Total active sessions: ${sessions.size}`);
}

// Periodic server-side WebSocket ping to keep connections alive through Render reverse-proxies
// and prune unresponsive dead sockets.
const HEARTBEAT_INTERVAL_MS = 25000;
const heartbeatTimer = setInterval(() => {
  wss.clients.forEach((client) => {
    const ws = client as AliveWebSocket;
    if (ws.isAlive === false) {
      console.log('[WebSocket] Terminating unresponsive/stale connection');
      return ws.terminate();
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (err) {
      console.warn('[WebSocket] Error sending ping:', err);
    }
  });
}, HEARTBEAT_INTERVAL_MS);

// Periodic cleanup of stale orphaned sessions (older than 30 minutes in waiting state)
const STALE_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const staleCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [code, session] of sessions.entries()) {
    if (session.state === 'waiting' && now - session.createdAt > STALE_SESSION_TIMEOUT_MS) {
      cleanupSession(code, 'Orphaned session expired (>30 minutes waiting)');
    }
  }
}, 5 * 60 * 1000);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    activeSessions: sessions.size,
    uptime: process.uptime()
  });
});

wss.on('connection', (ws: WebSocket) => {
  const aliveWs = ws as AliveWebSocket;
  aliveWs.isAlive = true;

  aliveWs.on('pong', () => {
    aliveWs.isAlive = true;
  });

  console.log('[WebSocket] Client connected');

  ws.on('message', (rawMessage: string | Buffer) => {
    aliveWs.isAlive = true;
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
        const receiverToken = crypto.randomUUID();
        const session: Session = {
          code,
          receiverWs: ws,
          presenterWs: null,
          state: 'waiting',
          createdAt: Date.now(),
          receiverToken
        };

        sessions.set(code, session);
        socketMeta.set(ws, { role: 'receiver', code });

        console.log(`[Receiver] Registered with code ${code}. Total sessions: ${sessions.size}`);
        safeSend(ws, { type: 'RECEIVER_REGISTERED', code, token: receiverToken });
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
        const presenterToken = crypto.randomUUID();
        session.presenterWs = ws;
        session.presenterToken = presenterToken;
        session.state = 'pairing';
        socketMeta.set(ws, { role: 'presenter', code });

        console.log(`[Presenter] Paired with display ${code}`);

        // Acknowledge presenter
        safeSend(ws, { type: 'PAIR_SUCCESS', code, token: presenterToken });
        // Notify receiver
        safeSend(session.receiverWs, { type: 'PRESENTER_JOINED' });
        break;
      }

      // 3. RECONNECT PRESENTER (transient socket reconnect)
      case 'RECONNECT_PRESENTER': {
        const code = typeof msg.code === 'string' ? msg.code.trim() : '';
        const token = typeof msg.token === 'string' ? msg.token.trim() : '';
        const session = sessions.get(code);

        if (!session || (session.state !== 'connected' && session.state !== 'pairing')) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'SESSION_EXPIRED',
            message: 'Presentation session has expired or does not exist.'
          });
          return;
        }

        // Token verification to prevent session hijacking by unauthorized parties
        if (session.presenterToken && session.presenterToken !== token) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'UNAUTHORIZED',
            message: 'Invalid session token for this presentation session.'
          });
          return;
        }

        // Reject if another presenter socket is already actively open
        if (session.presenterWs && session.presenterWs !== ws && session.presenterWs.readyState === WebSocket.OPEN) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'ALREADY_CONNECTED',
            message: 'Presenter is already connected to this session.'
          });
          return;
        }

        if (session.disconnectTimer) {
          clearTimeout(session.disconnectTimer);
          session.disconnectTimer = null;
        }

        session.presenterWs = ws;
        socketMeta.set(ws, { role: 'presenter', code });
        console.log(`[Session ${code}] Presenter reconnected successfully to active session.`);

        safeSend(ws, { type: 'RECONNECT_SUCCESS', role: 'presenter', code });
        if (session.receiverWs) {
          safeSend(session.receiverWs, { type: 'PEER_RECONNECTED', role: 'presenter' });
        }
        break;
      }

      // 4. RECONNECT RECEIVER (transient socket reconnect)
      case 'RECONNECT_RECEIVER': {
        const code = typeof msg.code === 'string' ? msg.code.trim() : '';
        const token = typeof msg.token === 'string' ? msg.token.trim() : '';
        const session = sessions.get(code);

        if (!session) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'SESSION_EXPIRED',
            message: 'Display session has expired or does not exist.'
          });
          return;
        }

        // Token verification to prevent session hijacking
        if (session.receiverToken && session.receiverToken !== token) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'UNAUTHORIZED',
            message: 'Invalid session token for this display session.'
          });
          return;
        }

        // Reject if another receiver socket is already actively open
        if (session.receiverWs && session.receiverWs !== ws && session.receiverWs.readyState === WebSocket.OPEN) {
          safeSend(ws, {
            type: 'ERROR',
            code: 'ALREADY_CONNECTED',
            message: 'Display is already connected to this session.'
          });
          return;
        }

        if (session.disconnectTimer) {
          clearTimeout(session.disconnectTimer);
          session.disconnectTimer = null;
        }

        session.receiverWs = ws;
        socketMeta.set(ws, { role: 'receiver', code });
        console.log(`[Session ${code}] Receiver reconnected successfully to active session.`);

        safeSend(ws, { type: 'RECONNECT_SUCCESS', role: 'receiver', code });
        if (session.presenterWs) {
          safeSend(session.presenterWs, { type: 'PEER_RECONNECTED', role: 'receiver' });
        }
        break;
      }

      // 5. WEBRTC SIGNALING: OFFER
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

      // 6. WEBRTC SIGNALING: ANSWER
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

      // 7. WEBRTC SIGNALING: ICE CANDIDATE
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

      // 8. CONNECTED STATE
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

      // 9. STOP SHARING (Presenter ended presentation intentionally)
      case 'STOP_SHARING': {
        const meta = socketMeta.get(ws);
        if (!meta || meta.role !== 'presenter') return;

        const session = sessions.get(meta.code);
        if (session) {
          console.log(`[Session ${meta.code}] Presenter stopped sharing intentionally`);
          safeSend(session.receiverWs, {
            type: 'PRESENTER_DISCONNECTED',
            reason: 'Presenter stopped sharing.'
          });
          cleanupSession(meta.code, 'Presenter stopped sharing');
        }
        break;
      }

      // 10. PING/PONG KEEP-ALIVE (Application level)
      case 'PING': {
        safeSend(ws, { type: 'PONG', timestamp: Date.now() });
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
    socketMeta.delete(ws);
    const session = sessions.get(code);

    console.log(`[WebSocket] ${role} closed connection for code ${code}`);

    if (!session) return;

    // If stream was actively connected, provide a 15-second grace period for transient drops
    // WebRTC peer connection often continues transferring media directly peer-to-peer!
    if (session.state === 'connected') {
      console.log(`[Session ${code}] ${role} closed unexpectedly during active stream. Starting 15s grace period.`);

      if (role === 'presenter') {
        session.presenterWs = null;
        if (session.receiverWs) {
          safeSend(session.receiverWs, {
            type: 'PEER_TEMPORARILY_OFFLINE',
            role: 'presenter',
            gracePeriodMs: 15000
          });
        }
      } else if (role === 'receiver') {
        session.receiverWs = null;
        if (session.presenterWs) {
          safeSend(session.presenterWs, {
            type: 'PEER_TEMPORARILY_OFFLINE',
            role: 'receiver',
            gracePeriodMs: 15000
          });
        }
      }

      if (session.disconnectTimer) {
        clearTimeout(session.disconnectTimer);
      }

      session.disconnectTimer = setTimeout(() => {
        const currentSession = sessions.get(code);
        if (!currentSession) return;

        console.log(`[Session ${code}] Disconnect grace period expired for ${role}`);
        if (role === 'presenter' && currentSession.receiverWs) {
          safeSend(currentSession.receiverWs, {
            type: 'PRESENTER_DISCONNECTED',
            reason: 'Presenter disconnected and did not reconnect within grace period.'
          });
        } else if (role === 'receiver' && currentSession.presenterWs) {
          safeSend(currentSession.presenterWs, {
            type: 'RECEIVER_DISCONNECTED',
            message: 'Display disconnected and did not reconnect within grace period.'
          });
        }
        cleanupSession(code, `${role} disconnect grace period expired`);
      }, 15000);

      return;
    }

    // If session was waiting or pairing (not yet active stream)
    if (role === 'receiver') {
      if (session.presenterWs) {
        safeSend(session.presenterWs, {
          type: 'RECEIVER_DISCONNECTED',
          message: 'Display was disconnected.'
        });
      }
      cleanupSession(code, 'Receiver socket closed while not connected');
    } else if (role === 'presenter') {
      session.presenterWs = null;
      session.state = 'waiting';
      console.log(`[Session ${code}] Presenter closed during pairing. Resetting session to waiting.`);
      if (session.receiverWs) {
        safeSend(session.receiverWs, {
          type: 'PRESENTER_DISCONNECTED',
          reason: 'Presenter cancelled pairing.'
        });
      }
    }
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Error:', err);
  });
});

httpServer.on('close', () => {
  clearInterval(heartbeatTimer);
  clearInterval(staleCleanupTimer);
  for (const session of sessions.values()) {
    if (session.disconnectTimer) {
      clearTimeout(session.disconnectTimer);
    }
  }
  sessions.clear();
  socketMeta.clear();
});

httpServer.listen(PORT, HOST, () => {
  console.log(`[Screenit Server] Signaling server running on http://${HOST}:${PORT}`);
});
