import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { AppState, SignalingMessage, ConnectionDiagnostics } from './types';
import { useTheme } from './theme';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/HomeScreen';
import { ReceiverWaitingScreen } from './components/ReceiverWaitingScreen';
import { PresenterPairingScreen } from './components/PresenterPairingScreen';
import { ConnectingScreen } from './components/ConnectingScreen';
import { PresenterConnectedScreen } from './components/PresenterConnectedScreen';
import { ReceiverPresentationScreen } from './components/ReceiverPresentationScreen';
import { FaqScreen } from './components/FaqScreen';
import { PrivacyPolicyScreen } from './components/PrivacyPolicyScreen';
import { TermsOfUseScreen } from './components/TermsOfUseScreen';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const DEFAULT_PROD_SIGNALING_URL = 'wss://screenit-signaling.onrender.com';
const HEARTBEAT_PING_INTERVAL_MS = 20000;

function getInitialAppState(): AppState {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    if (path === '/faq') return 'FAQ';
    if (path === '/privacy') return 'PRIVACY';
    if (path === '/terms') return 'TERMS';
  }
  return 'HOME';
}

function isInfoPage(state: AppState | string): boolean {
  return state === 'FAQ' || state === 'PRIVACY' || state === 'TERMS';
}

function getSignalingUrl(): string {
  const envUrl = (import.meta.env.VITE_SIGNALING_URL as string | undefined)?.trim();
  if (envUrl) {
    if (envUrl.startsWith('https://')) {
      return envUrl.replace(/^https:\/\//i, 'wss://').replace(/\/+$/, '');
    }
    if (envUrl.startsWith('http://')) {
      return envUrl.replace(/^http:\/\//i, 'ws://').replace(/\/+$/, '');
    }
    if (envUrl.startsWith('wss://') || envUrl.startsWith('ws://')) {
      return envUrl.replace(/\/+$/, '');
    }
    return `wss://${envUrl}`.replace(/\/+$/, '');
  }

  // In production builds, ensure we fall back to the live Render signaling server
  if (import.meta.env.PROD) {
    return DEFAULT_PROD_SIGNALING_URL;
  }

  const host = window.location.hostname || 'localhost';
  return `ws://${host}:3001`;
}

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [appState, setAppState] = useState<AppState>(getInitialAppState);
  const [pairingCode, setPairingCode] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isReceiverConnecting, setIsReceiverConnecting] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  // Remembers the active state before navigating to informational pages (FAQ/Privacy/Terms)
  const [savedSessionState, setSavedSessionState] = useState<AppState | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const roleRef = useRef<'receiver' | 'presenter' | null>(null);

  const sessionCodeRef = useRef<string>('');
  const sessionTokenRef = useRef<string>('');
  const isIntentionalStopRef = useRef<boolean>(false);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const receiverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const webrtcGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatsRef = useRef<{ bytes: number; timestamp: number }>({ bytes: 0, timestamp: 0 });

  // Pre-warm the signaling server via HTTP /health on app mount to eliminate cold-start latency
  useEffect(() => {
    try {
      const signalingUrl = getSignalingUrl();
      const httpUrl = signalingUrl
        .replace(/^wss:\/\//i, 'https://')
        .replace(/^ws:\/\//i, 'http://');
      fetch(`${httpUrl}/health`, { mode: 'cors' }).catch(() => {});
    } catch {
      // Ignore pre-warm errors
    }
  }, []);

  const safeSend = (data: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
      } catch (err) {
        console.warn('[WS] Error sending message:', err);
      }
    }
  };

  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        safeSend({ type: 'PING' });
      }
    }, HEARTBEAT_PING_INTERVAL_MS);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const stopDiagnosticsLoop = useCallback(() => {
    if (statsTimerRef.current) {
      clearInterval(statsTimerRef.current);
      statsTimerRef.current = null;
    }
    setDiagnostics(null);
  }, []);

  const startDiagnosticsLoop = useCallback(() => {
    if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    prevStatsRef.current = { bytes: 0, timestamp: Date.now() };

    statsTimerRef.current = setInterval(async () => {
      const pc = pcRef.current;
      if (!pc) return;

      try {
        const stats = await pc.getStats();
        let resolution = 'N/A';
        let fps = 0;
        let bitrateKbps = 0;
        let packetLossPct = 0;
        let rttMs = 0;
        let jitterMs = 0;
        let candidateType = 'LAN (Direct)';
        const now = Date.now();
        const timeDiffSec = Math.max(0.1, (now - (prevStatsRef.current.timestamp || now)) / 1000);

        stats.forEach((report: any) => {
          if (report.type === 'outbound-rtp' && (report.kind === 'video' || !report.kind)) {
            if (report.frameWidth && report.frameHeight) {
              resolution = `${report.frameWidth}x${report.frameHeight}`;
            }
            if (typeof report.framesPerSecond === 'number') {
              fps = Math.round(report.framesPerSecond);
            }
            if (typeof report.bytesSent === 'number') {
              const bytesDiff = report.bytesSent - prevStatsRef.current.bytes;
              if (bytesDiff >= 0 && prevStatsRef.current.bytes > 0) {
                bitrateKbps = Math.round((bytesDiff * 8) / (timeDiffSec * 1000));
              }
              prevStatsRef.current = { bytes: report.bytesSent, timestamp: now };
            }
          } else if (report.type === 'inbound-rtp' && (report.kind === 'video' || !report.kind)) {
            if (report.frameWidth && report.frameHeight) {
              resolution = `${report.frameWidth}x${report.frameHeight}`;
            }
            if (typeof report.framesPerSecond === 'number') {
              fps = Math.round(report.framesPerSecond);
            }
            if (typeof report.bytesReceived === 'number') {
              const bytesDiff = report.bytesReceived - prevStatsRef.current.bytes;
              if (bytesDiff >= 0 && prevStatsRef.current.bytes > 0) {
                bitrateKbps = Math.round((bytesDiff * 8) / (timeDiffSec * 1000));
              }
              prevStatsRef.current = { bytes: report.bytesReceived, timestamp: now };
            }
            if (typeof report.packetsLost === 'number' && typeof report.packetsReceived === 'number') {
              const total = report.packetsLost + report.packetsReceived;
              if (total > 0) {
                packetLossPct = Math.min(100, Math.max(0, (report.packetsLost / total) * 100));
              }
            }
            if (typeof report.jitter === 'number') {
              jitterMs = Math.round(report.jitter * 1000);
            }
          } else if (report.type === 'candidate-pair' && (report.state === 'succeeded' || report.nominated)) {
            if (typeof report.currentRoundTripTime === 'number') {
              rttMs = Math.round(report.currentRoundTripTime * 1000);
            }
          } else if (report.type === 'remote-candidate' || report.type === 'local-candidate') {
            if (report.candidateType) {
              candidateType =
                report.candidateType === 'host'
                  ? 'LAN / Host'
                  : report.candidateType === 'srflx'
                  ? 'STUN / NAT'
                  : report.candidateType === 'relay'
                  ? 'Relay (TURN)'
                  : report.candidateType;
            }
          }
        });

        const wsState: 'connected' | 'connecting' | 'disconnected' | 'reconnecting' =
          !wsRef.current
            ? 'disconnected'
            : wsRef.current.readyState === WebSocket.OPEN
            ? 'connected'
            : wsRef.current.readyState === WebSocket.CONNECTING
            ? 'connecting'
            : 'disconnected';

        setDiagnostics({
          wsState,
          pcConnectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          resolution,
          fps,
          bitrateKbps,
          packetLossPct,
          rttMs,
          jitterMs,
          candidateType,
          recoveryState: wsState === 'disconnected' ? 'ws_reconnecting' : 'normal',
          lastUpdated: now,
        });
      } catch (err) {
        console.warn('[Diagnostics] Stats error:', err);
      }
    }, 1000);
  }, []);

  const cleanupConnections = useCallback(() => {
    stopHeartbeat();
    stopDiagnosticsLoop();

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (receiverTimeoutRef.current) {
      clearTimeout(receiverTimeoutRef.current);
      receiverTimeoutRef.current = null;
    }

    if (webrtcGraceTimerRef.current) {
      clearTimeout(webrtcGraceTimerRef.current);
      webrtcGraceTimerRef.current = null;
    }

    // Exit fullscreen if active
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn('[Screenit] Error exiting fullscreen:', err);
      });
    }

    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    streamRef.current = null;

    // Close PeerConnection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    pendingIceCandidatesRef.current = [];
    roleRef.current = null;
    sessionCodeRef.current = '';
    sessionTokenRef.current = '';
    reconnectAttemptsRef.current = 0;
    setStream(null);
    setIsConnecting(false);
    setIsReceiverConnecting(false);
    setRecoveryMessage(null);
  }, [stopHeartbeat, stopDiagnosticsLoop]);

  // Flush queued ICE candidates once remote description is set
  const processPendingIceCandidates = (pc: RTCPeerConnection) => {
    const queue = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];
    for (const cand of queue) {
      if (cand) {
        pc.addIceCandidate(new RTCIceCandidate(cand)).catch((err) => {
          console.warn('[WebRTC] Error adding queued ICE candidate:', err);
        });
      }
    }
  };

  // Presenter intentionally stops sharing
  const handleStopSharing = useCallback(() => {
    isIntentionalStopRef.current = true;
    safeSend({ type: 'STOP_SHARING' });
    cleanupConnections();
    setSavedSessionState(null);
    setAppState('HOME');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, [cleanupConnections]);

  const startReceiverSessionRef = useRef<() => void>(() => { });
  const attemptWsReconnectRef = useRef<() => void>(() => { });

  // ----------------------------------------------------
  // RESILIENT WEBSOCKET RECONNECTION
  // ----------------------------------------------------
  const attemptWsReconnect = useCallback(() => {
    if (isIntentionalStopRef.current) return;
    if (!sessionCodeRef.current || !roleRef.current) return;
    if (reconnectAttemptsRef.current >= 8) {
      console.warn('[WS] Maximum reconnect attempts reached.');
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = Math.min(8000, 1000 * Math.pow(1.5, reconnectAttemptsRef.current - 1));
    console.log(`[WS] Attempting reconnect in ${delay}ms (attempt #${reconnectAttemptsRef.current})`);
    setRecoveryMessage('Connection lost, attempting to reconnect...');

    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      if (isIntentionalStopRef.current) return;
      const ws = new WebSocket(getSignalingUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Reconnected successfully to signaling server');
        startHeartbeat();
        reconnectAttemptsRef.current = 0;
        if (roleRef.current === 'presenter') {
          safeSend({
            type: 'RECONNECT_PRESENTER',
            code: sessionCodeRef.current,
            token: sessionTokenRef.current,
          });
        } else if (roleRef.current === 'receiver') {
          safeSend({
            type: 'RECONNECT_RECEIVER',
            code: sessionCodeRef.current,
            token: sessionTokenRef.current,
          });
        }
      };

      ws.onmessage = async (event) => {
        let msg: SignalingMessage;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        switch (msg.type) {
          case 'RECONNECT_SUCCESS': {
            console.log('[WS] Session recovery confirmed by server');
            setRecoveryMessage(null);
            break;
          }

          case 'PEER_TEMPORARILY_OFFLINE': {
            setRecoveryMessage('Peer temporarily disconnected. Waiting for recovery...');
            break;
          }

          case 'PEER_RECONNECTED': {
            setRecoveryMessage(null);
            break;
          }

          case 'SIGNAL_OFFER': {
            const pc = pcRef.current;
            if (!pc || !msg.sdp) return;
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              safeSend({
                type: 'SIGNAL_ANSWER',
                sdp: { type: answer.type, sdp: answer.sdp },
              });
              processPendingIceCandidates(pc);
            } catch (err) {
              console.error('[WS Reconnect] Error handling offer:', err);
            }
            break;
          }

          case 'SIGNAL_ANSWER': {
            const pc = pcRef.current;
            if (!pc || !msg.sdp) return;
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              processPendingIceCandidates(pc);
            } catch (err) {
              console.error('[WS Reconnect] Error handling answer:', err);
            }
            break;
          }

          case 'SIGNAL_ICE': {
            if (!msg.candidate) return;
            const pc = pcRef.current;
            if (pc && pc.remoteDescription && pc.signalingState !== 'closed') {
              pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(() => {});
            } else {
              pendingIceCandidatesRef.current.push(msg.candidate);
            }
            break;
          }

          case 'PRESENTER_DISCONNECTED': {
            if (roleRef.current === 'receiver') {
              startReceiverSessionRef.current();
            }
            break;
          }

          case 'RECEIVER_DISCONNECTED': {
            if (roleRef.current === 'presenter') {
              handleStopSharing();
            }
            break;
          }

          case 'ERROR': {
            if (msg.code === 'SESSION_EXPIRED' || msg.code === 'UNAUTHORIZED') {
              console.warn('[WS Reconnect] Session expired or unauthorized on server:', msg.message);
              if (roleRef.current === 'receiver') {
                startReceiverSessionRef.current();
              } else {
                handleStopSharing();
              }
            }
            break;
          }
        }
      };

      ws.onclose = () => {
        stopHeartbeat();
        if (!isIntentionalStopRef.current) {
          attemptWsReconnectRef.current();
        }
      };

      ws.onerror = (err) => {
        console.warn('[WS] Reconnect socket error:', err);
      };
    }, delay);
  }, [startHeartbeat, stopHeartbeat, handleStopSharing]);

  useEffect(() => {
    attemptWsReconnectRef.current = attemptWsReconnect;
  }, [attemptWsReconnect]);

  // ----------------------------------------------------
  // RECEIVER LOGIC
  // ----------------------------------------------------
  const setupReceiverPeerConnection = useCallback(() => {
    console.log('[WebRTC] Initializing Receiver RTCPeerConnection');
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    pc.ontrack = (trackEvent) => {
      console.log(`[WebRTC] Remote track arrived: kind=${trackEvent.track.kind}, id=${trackEvent.track.id}`);
      let remoteStream = streamRef.current;
      if (!remoteStream) {
        remoteStream = trackEvent.streams[0] || new MediaStream([trackEvent.track]);
        streamRef.current = remoteStream;
      } else if (!remoteStream.getTracks().includes(trackEvent.track)) {
        remoteStream.addTrack(trackEvent.track);
      }
      setStream(remoteStream);
      startDiagnosticsLoop();
      setAppState((currentState) => {
        if (isInfoPage(currentState)) {
          setSavedSessionState('RECEIVER_PRESENTATION');
          return currentState;
        }
        return 'RECEIVER_PRESENTATION';
      });
    };

    pc.onicecandidate = (iceEvent) => {
      if (iceEvent.candidate) {
        console.log('[WebRTC] Receiver generated local ICE candidate');
        const cand = iceEvent.candidate.toJSON
          ? iceEvent.candidate.toJSON()
          : {
              candidate: iceEvent.candidate.candidate,
              sdpMid: iceEvent.candidate.sdpMid,
              sdpMLineIndex: iceEvent.candidate.sdpMLineIndex,
              usernameFragment: iceEvent.candidate.usernameFragment,
            };
        safeSend({ type: 'SIGNAL_ICE', candidate: cand });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] Receiver ICE connection state:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Receiver peer connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        if (webrtcGraceTimerRef.current) {
          clearTimeout(webrtcGraceTimerRef.current);
          webrtcGraceTimerRef.current = null;
        }
        setRecoveryMessage(null);
      } else if (pc.connectionState === 'disconnected') {
        setRecoveryMessage('Connection interrupted, attempting to resume...');
        if (webrtcGraceTimerRef.current) clearTimeout(webrtcGraceTimerRef.current);
        webrtcGraceTimerRef.current = setTimeout(() => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            console.log('[WebRTC] Receiver WebRTC grace period expired.');
            setRecoveryMessage('Connection lost with presenter.');
          }
        }, 6000);
      } else if (pc.connectionState === 'failed') {
        console.log('[WebRTC] Receiver WebRTC connection failed.');
        setRecoveryMessage('Direct peer connection failed. Please ensure both devices are on the same local network.');
      }
    };

    return pc;
  }, [startDiagnosticsLoop]);

  const startReceiverSession = useCallback(() => {
    cleanupConnections();
    isIntentionalStopRef.current = false;
    roleRef.current = 'receiver';
    setErrorMessage(null);
    setPairingCode('');
    setIsReceiverConnecting(true);
    setAppState('RECEIVER_WAITING');

    if (receiverTimeoutRef.current) {
      clearTimeout(receiverTimeoutRef.current);
    }
    receiverTimeoutRef.current = setTimeout(() => {
      if (!sessionCodeRef.current) {
        console.warn('[Signaling] Receiver pairing code request timed out (15s)');
        setIsReceiverConnecting(false);
        setErrorMessage('Signaling server took too long to respond. The server may be waking up. Please retry.');
      }
    }, 15000);

    const ws = new WebSocket(getSignalingUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Signaling] Receiver WebSocket connected, registering receiver');
      try {
        ws.send(JSON.stringify({ type: 'REGISTER_RECEIVER' }));
      } catch (err) {
        console.warn('[Signaling] Error sending REGISTER_RECEIVER:', err);
      }
      startHeartbeat();
    };

    ws.onmessage = async (event) => {
      let msg: SignalingMessage;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case 'RECEIVER_REGISTERED': {
          if (receiverTimeoutRef.current) {
            clearTimeout(receiverTimeoutRef.current);
            receiverTimeoutRef.current = null;
          }
          setIsReceiverConnecting(false);
          setErrorMessage(null);
          if (msg.code) {
            console.log(`[Signaling] Receiver registered with code: ${msg.code}`);
            sessionCodeRef.current = msg.code;
            sessionTokenRef.current = msg.token || '';
            setPairingCode(msg.code);
          }
          break;
        }

        case 'PRESENTER_JOINED': {
          console.log('[Signaling] Presenter joined. Preparing RTCPeerConnection');
          pendingIceCandidatesRef.current = [];
          setupReceiverPeerConnection();
          break;
        }

        case 'SIGNAL_OFFER': {
          console.log('[WebRTC] Received SDP Offer from presenter');
          let pc = pcRef.current;
          if (!pc) {
            pc = setupReceiverPeerConnection();
          }
          if (!msg.sdp) return;
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            console.log('[WebRTC] Receiver setRemoteDescription succeeded');
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('[WebRTC] Receiver created and set local answer, sending SIGNAL_ANSWER');
            safeSend({
              type: 'SIGNAL_ANSWER',
              sdp: { type: answer.type, sdp: answer.sdp },
            });
            processPendingIceCandidates(pc);
          } catch (err) {
            console.error('[WebRTC] Receiver error handling SDP Offer:', err);
            setRecoveryMessage('Failed to negotiate WebRTC connection with presenter.');
          }
          break;
        }

        case 'SIGNAL_ICE': {
          if (!msg.candidate) return;
          const pc = pcRef.current;
          if (pc && pc.remoteDescription && pc.signalingState !== 'closed') {
            pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch((err) => {
              console.warn('[WebRTC] Receiver error adding ICE candidate:', err);
            });
          } else {
            console.log('[WebRTC] Queued ICE candidate on receiver (waiting for remote description)');
            pendingIceCandidatesRef.current.push(msg.candidate);
          }
          break;
        }

        case 'PEER_TEMPORARILY_OFFLINE': {
          setRecoveryMessage('Presenter temporarily disconnected. Waiting for reconnection...');
          break;
        }

        case 'PEER_RECONNECTED': {
          setRecoveryMessage(null);
          break;
        }

        case 'RECONNECT_SUCCESS': {
          setRecoveryMessage(null);
          break;
        }

        case 'PRESENTER_DISCONNECTED': {
          console.log('[Signaling] Receiver received PRESENTER_DISCONNECTED:', msg.reason);
          // If presenter disconnected/cancelled before stream started, the server reset session to 'waiting'.
          // Keep the receiver session and pairing code active!
          if (!streamRef.current && (roleRef.current === 'receiver')) {
            console.log('[Signaling] Presenter cancelled during pairing. Keeping pairing code active.');
            if (pcRef.current) {
              pcRef.current.close();
              pcRef.current = null;
            }
            pendingIceCandidatesRef.current = [];
            setRecoveryMessage(null);
          } else {
            // Presentation ended intentionally, get a fresh code
            startReceiverSessionRef.current();
          }
          break;
        }

        case 'ERROR': {
          console.warn('[Signaling] Receiver server error:', msg.message);
          if (!sessionCodeRef.current) {
            if (receiverTimeoutRef.current) {
              clearTimeout(receiverTimeoutRef.current);
              receiverTimeoutRef.current = null;
            }
            setIsReceiverConnecting(false);
            setErrorMessage(msg.message || 'Unable to register receiver with server.');
          }
          break;
        }
      }
    };

    ws.onclose = (event) => {
      console.log('[WS] Receiver socket closed:', event.code, event.reason);
      stopHeartbeat();
      if (!sessionCodeRef.current) {
        if (receiverTimeoutRef.current) {
          clearTimeout(receiverTimeoutRef.current);
          receiverTimeoutRef.current = null;
        }
        setIsReceiverConnecting(false);
        setErrorMessage('Could not connect to signaling server. Please check your network and try again.');
      } else if (!isIntentionalStopRef.current && (pcRef.current || streamRef.current)) {
        attemptWsReconnect();
      }
    };

    ws.onerror = (err) => {
      console.error('[WS] Receiver socket error:', err);
      if (!sessionCodeRef.current) {
        if (receiverTimeoutRef.current) {
          clearTimeout(receiverTimeoutRef.current);
          receiverTimeoutRef.current = null;
        }
        setIsReceiverConnecting(false);
        setErrorMessage('Signaling server connection error. Please check your network and try again.');
      }
    };
  }, [cleanupConnections, startHeartbeat, stopHeartbeat, setupReceiverPeerConnection, attemptWsReconnect]);

  useEffect(() => {
    startReceiverSessionRef.current = startReceiverSession;
  }, [startReceiverSession]);

  // ----------------------------------------------------
  // PRESENTER LOGIC
  // ----------------------------------------------------
  const handlePresenterConnect = useCallback(
    async (code: string) => {
      cleanupConnections();
      isIntentionalStopRef.current = false;
      roleRef.current = 'presenter';
      sessionCodeRef.current = code;
      setPairingCode(code);
      setErrorMessage(null);
      setIsConnecting(true);
      setAppState('CONNECTING');

      const ws = new WebSocket(getSignalingUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Presenter WS] Connected, sending JOIN_AS_PRESENTER for code:', code);
        safeSend({ type: 'JOIN_AS_PRESENTER', code });
        startHeartbeat();
      };

      ws.onmessage = async (event) => {
        let msg: SignalingMessage;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        switch (msg.type) {
          case 'PAIR_SUCCESS': {
            console.log('[Presenter] Pairing successful, requesting getDisplayMedia()');
            sessionTokenRef.current = msg.token || '';
            try {
              if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                throw new Error(
                  'Screen sharing is not supported by this browser or requires a Secure Context (HTTPS).'
                );
              }

              // Tuned constraints: 30-60 FPS with full display dimensions for sharp classroom TV presentation
              const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                  frameRate: { ideal: 30, max: 60 },
                  width: { max: 3840 },
                  height: { max: 2160 },
                },
                audio: false,
              });

              localStreamRef.current = displayStream;
              streamRef.current = displayStream;
              setStream(displayStream);

              pendingIceCandidatesRef.current = [];
              const pc = new RTCPeerConnection(RTC_CONFIG);
              pcRef.current = pc;

              displayStream.getTracks().forEach((track) => {
                // Optimize track content hint for razor-sharp text and code on large displays
                if ('contentHint' in track) {
                  track.contentHint = 'detail';
                }

                pc.addTrack(track, displayStream);

                // Handle user stopping screen share via browser floating controls
                track.onended = () => {
                  console.log('[Presenter] Screen sharing stopped natively');
                  handleStopSharing();
                };
              });

              pc.onicecandidate = (iceEvent) => {
                if (iceEvent.candidate) {
                  console.log('[WebRTC] Presenter generated local ICE candidate');
                  const cand = iceEvent.candidate.toJSON
                    ? iceEvent.candidate.toJSON()
                    : {
                        candidate: iceEvent.candidate.candidate,
                        sdpMid: iceEvent.candidate.sdpMid,
                        sdpMLineIndex: iceEvent.candidate.sdpMLineIndex,
                        usernameFragment: iceEvent.candidate.usernameFragment,
                      };
                  safeSend({ type: 'SIGNAL_ICE', candidate: cand });
                }
              };

              pc.oniceconnectionstatechange = () => {
                console.log('[WebRTC] Presenter ICE connection state:', pc.iceConnectionState);
              };

              pc.onconnectionstatechange = () => {
                console.log('[Presenter] WebRTC Connection state:', pc.connectionState);
                if (pc.connectionState === 'connected') {
                  if (webrtcGraceTimerRef.current) {
                    clearTimeout(webrtcGraceTimerRef.current);
                    webrtcGraceTimerRef.current = null;
                  }
                  safeSend({ type: 'STREAM_ACTIVE' });
                  setIsConnecting(false);
                  setRecoveryMessage(null);
                  startDiagnosticsLoop();
                  setAppState('PRESENTER_CONNECTED');
                } else if (pc.connectionState === 'disconnected') {
                  // Temporary network flap: give 6-second grace period for auto-recovery
                  setRecoveryMessage('Connection interrupted, attempting to resume...');
                  if (webrtcGraceTimerRef.current) clearTimeout(webrtcGraceTimerRef.current);
                  webrtcGraceTimerRef.current = setTimeout(() => {
                    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                      console.log('[Presenter] WebRTC grace period expired.');
                      setRecoveryMessage('Connection lost with display.');
                    }
                  }, 6000);
                } else if (pc.connectionState === 'failed') {
                  console.log('[Presenter] WebRTC connection failed.');
                  setRecoveryMessage('Direct peer connection failed. Please ensure both devices are on the same local network.');
                }
              };

              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              console.log('[WebRTC] Created and set local offer, sending SIGNAL_OFFER');
              safeSend({
                type: 'SIGNAL_OFFER',
                sdp: { type: offer.type, sdp: offer.sdp },
              });

              // Apply degradation preference safely if supported after setLocalDescription
              try {
                const senders = pc.getSenders();
                const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
                if (videoSender) {
                  const params = videoSender.getParameters();
                  if (params && params.encodings && params.encodings.length > 0) {
                    params.encodings[0].maxBitrate = 6000000;
                    params.degradationPreference = 'maintain-resolution';
                    videoSender.setParameters(params).catch(() => {});
                  }
                }
              } catch {
                // Ignore
              }
            } catch (err: any) {
              console.error('[Presenter] Error capturing display media:', err);
              cleanupConnections();
              setErrorMessage(
                err?.name === 'NotAllowedError'
                  ? 'Screen capture cancelled or permission denied.'
                  : err?.message || 'Screen capture cancelled or permission denied.'
              );
              setAppState('PRESENTER_PAIRING');
            }
            break;
          }

          case 'SIGNAL_ANSWER': {
            const pc = pcRef.current;
            if (!pc || !msg.sdp) return;
            console.log('[WebRTC] Presenter received SDP answer');
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              console.log('[WebRTC] Presenter setRemoteDescription succeeded, processing queued ICE');
              processPendingIceCandidates(pc);
              setIsConnecting(false);
              setAppState('PRESENTER_CONNECTED');
            } catch (err) {
              console.error('[WebRTC] Presenter error setting remote description:', err);
              setRecoveryMessage('Failed to complete WebRTC handshake with display.');
            }
            break;
          }

          case 'SIGNAL_ICE': {
            if (!msg.candidate) return;
            const pc = pcRef.current;
            if (pc && pc.remoteDescription && pc.signalingState !== 'closed') {
              pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch((err) => {
                console.warn('[WebRTC] Presenter error adding ICE candidate:', err);
              });
            } else {
              console.log('[WebRTC] Queued ICE candidate on presenter (waiting for remote description)');
              pendingIceCandidatesRef.current.push(msg.candidate);
            }
            break;
          }

          case 'PEER_TEMPORARILY_OFFLINE': {
            setRecoveryMessage('Display temporarily disconnected. Waiting for recovery...');
            break;
          }

          case 'PEER_RECONNECTED': {
            setRecoveryMessage(null);
            break;
          }

          case 'RECONNECT_SUCCESS': {
            setRecoveryMessage(null);
            break;
          }

          case 'RECEIVER_DISCONNECTED': {
            console.log('[Presenter] Receiver disconnected');
            cleanupConnections();
            setSavedSessionState(null);
            setErrorMessage('The display has disconnected.');
            setAppState('PRESENTER_PAIRING');
            break;
          }

          case 'ERROR': {
            console.warn('[Presenter] Pairing error:', msg.message);
            cleanupConnections();
            setSavedSessionState(null);
            setErrorMessage(msg.message || 'Unable to pair with display.');
            setAppState('PRESENTER_PAIRING');
            break;
          }
        }
      };

      ws.onclose = () => {
        console.log('[Presenter WS] Disconnected');
        stopHeartbeat();
        if (!isIntentionalStopRef.current && (pcRef.current || streamRef.current)) {
          attemptWsReconnect();
        }
      };

      ws.onerror = () => {
        if (!pcRef.current && !streamRef.current) {
          cleanupConnections();
          setSavedSessionState(null);
          setErrorMessage(
            'Could not connect to the signaling server. Please check your network connection and try again.'
          );
          setAppState('PRESENTER_PAIRING');
        }
      };
    },
    [cleanupConnections, handleStopSharing, startHeartbeat, stopHeartbeat, startDiagnosticsLoop, attemptWsReconnect]
  );

  // SPA Navigation Helper
  // CRITICAL: Navigating to informational pages (FAQ, PRIVACY, TERMS) must NEVER stop active sessions!
  const navigateTo = useCallback(
    (page: 'HOME' | 'FAQ' | 'PRIVACY' | 'TERMS') => {
      if (isInfoPage(page)) {
        // Navigating to an informational page
        // Remember previous active state only if not already on an info page
        if (!isInfoPage(appState)) {
          setSavedSessionState(appState);
        }
        setAppState(page);
        const path = `/${page.toLowerCase()}`;
        if (window.location.pathname !== path) {
          window.history.pushState({}, '', path);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Page is 'HOME'
      // If returning from an informational page while an active session exists, restore it
      if (isInfoPage(appState) && savedSessionState) {
        const target = savedSessionState;
        setSavedSessionState(null);
        setAppState(target);
        if (window.location.pathname !== '/') {
          window.history.pushState({}, '', '/');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Intentional return to HOME
      cleanupConnections();
      setSavedSessionState(null);
      setErrorMessage(null);
      setAppState('HOME');
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [appState, savedSessionState, cleanupConnections]
  );

  // Return from informational page back to previous active state
  const handleReturnFromInfoPage = useCallback(() => {
    if (savedSessionState) {
      const targetState = savedSessionState;
      setSavedSessionState(null);
      setAppState(targetState);
    } else if (roleRef.current === 'presenter' && localStreamRef.current) {
      setAppState('PRESENTER_CONNECTED');
    } else if (roleRef.current === 'receiver' && stream) {
      setAppState('RECEIVER_PRESENTATION');
    } else {
      setAppState('HOME');
    }
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [savedSessionState, stream]);

  // Cancel pairing/connecting or return home from an active wizard
  const handleCancel = useCallback(() => {
    if (isInfoPage(appState)) {
      handleReturnFromInfoPage();
      return;
    }
    cleanupConnections();
    setSavedSessionState(null);
    setAppState('HOME');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, [appState, cleanupConnections, handleReturnFromInfoPage]);

  // Browser back/forward navigation support
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      if (path === '/faq') {
        setAppState((curr) => {
          if (!isInfoPage(curr)) setSavedSessionState(curr);
          return 'FAQ';
        });
      } else if (path === '/privacy') {
        setAppState((curr) => {
          if (!isInfoPage(curr)) setSavedSessionState(curr);
          return 'PRIVACY';
        });
      } else if (path === '/terms') {
        setAppState((curr) => {
          if (!isInfoPage(curr)) setSavedSessionState(curr);
          return 'TERMS';
        });
      } else {
        // Path is root '/'
        setSavedSessionState((prevSaved) => {
          if (prevSaved) {
            setAppState(prevSaved);
            return null;
          }
          if (roleRef.current === 'presenter' && localStreamRef.current) {
            setAppState('PRESENTER_CONNECTED');
          } else if (roleRef.current === 'receiver' && stream) {
            setAppState('RECEIVER_PRESENTATION');
          } else {
            setAppState('HOME');
          }
          return null;
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [stream]);

  // Cleanup connections on actual tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupConnections();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cleanupConnections]);

  // Determine active session badge & button label when browsing informational pages
  const isPresenterSharing =
    (savedSessionState === 'PRESENTER_CONNECTED' || appState === 'PRESENTER_CONNECTED') &&
    stream !== null;

  const isReceiverPresenting =
    (savedSessionState === 'RECEIVER_PRESENTATION' || appState === 'RECEIVER_PRESENTATION') &&
    stream !== null;

  const isReceiverWaiting =
    savedSessionState === 'RECEIVER_WAITING' && pairingCode !== '';

  let activeSessionBadge = null;
  if (isInfoPage(appState)) {
    if (isPresenterSharing) {
      activeSessionBadge = {
        label: `Sharing Active (Display ${pairingCode || 'Paired'})`,
        actionLabel: 'Return to Sharing',
        onAction: handleReturnFromInfoPage,
      };
    } else if (isReceiverPresenting) {
      activeSessionBadge = {
        label: 'Display Active',
        actionLabel: 'Return to Presentation',
        onAction: handleReturnFromInfoPage,
      };
    } else if (isReceiverWaiting) {
      activeSessionBadge = {
        label: `Receiver Waiting (${pairingCode || 'Ready'})`,
        actionLabel: 'Return to Receiver',
        onAction: handleReturnFromInfoPage,
      };
    }
  }

  const getBackLabel = (): string => {
    if (isPresenterSharing) return 'Back to Sharing';
    if (isReceiverPresenting) return 'Back to Presentation';
    if (isReceiverWaiting) return 'Back to Receiver';
    return 'Back to Home';
  };

  // In RECEIVER_PRESENTATION state, the UI must completely disappear
  if (appState === 'RECEIVER_PRESENTATION') {
    return (
      <ReceiverPresentationScreen
        stream={stream}
        diagnostics={diagnostics ?? undefined}
        recoveryMessage={recoveryMessage}
        onExit={handleCancel}
      />
    );
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between select-none transition-colors">
      {/* Header */}
      <Header
        onGoHome={isInfoPage(appState) ? handleReturnFromInfoPage : handleCancel}
        showHomeLink={appState !== 'HOME' && appState !== 'PRESENTER_CONNECTED'}
        homeLinkText={getBackLabel()}
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSessionBadge={activeSessionBadge}
      />

      {/* Main Content Area */}
      <main
        className={`w-full pt-16 flex-1 flex flex-col items-center px-4 sm:px-6 py-8 max-w-6xl mx-auto ${isInfoPage(appState) ? 'justify-start' : 'justify-center'
          }`}
      >
        {appState === 'HOME' && (
          <HomeScreen
            onSelectShareScreen={() => {
              setErrorMessage(null);
              setAppState('PRESENTER_PAIRING');
            }}
            onSelectGetScreened={startReceiverSession}
          />
        )}

        {appState === 'RECEIVER_WAITING' && (
          <ReceiverWaitingScreen
            code={pairingCode}
            onCancel={handleCancel}
            isConnecting={isReceiverConnecting}
            errorMessage={errorMessage}
            onRetry={startReceiverSession}
          />
        )}

        {appState === 'PRESENTER_PAIRING' && (
          <PresenterPairingScreen
            onConnect={handlePresenterConnect}
            onBack={handleCancel}
            errorMessage={errorMessage}
            isConnecting={isConnecting}
          />
        )}

        {appState === 'CONNECTING' && (
          <ConnectingScreen
            code={pairingCode}
            onCancel={handleCancel}
          />
        )}

        {appState === 'PRESENTER_CONNECTED' && (
          <PresenterConnectedScreen
            code={pairingCode}
            stream={stream}
            onStopSharing={handleStopSharing}
            diagnostics={diagnostics ?? undefined}
            recoveryMessage={recoveryMessage}
          />
        )}

        {appState === 'FAQ' && (
          <FaqScreen
            onGoHome={handleReturnFromInfoPage}
            backLabel={getBackLabel()}
          />
        )}

        {appState === 'PRIVACY' && (
          <PrivacyPolicyScreen
            onGoHome={handleReturnFromInfoPage}
            backLabel={getBackLabel()}
          />
        )}

        {appState === 'TERMS' && (
          <TermsOfUseScreen
            onGoHome={handleReturnFromInfoPage}
            backLabel={getBackLabel()}
          />
        )}
      </main>
      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default App;
