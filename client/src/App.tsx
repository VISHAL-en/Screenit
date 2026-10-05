import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { AppState, SignalingMessage } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/HomeScreen';
import { ReceiverWaitingScreen } from './components/ReceiverWaitingScreen';
import { PresenterPairingScreen } from './components/PresenterPairingScreen';
import { ConnectingScreen } from './components/ConnectingScreen';
import { PresenterConnectedScreen } from './components/PresenterConnectedScreen';
import { ReceiverPresentationScreen } from './components/ReceiverPresentationScreen';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

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

  const host = window.location.hostname || 'localhost';
  return `ws://${host}:3001`;
}

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('HOME');
  const [pairingCode, setPairingCode] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const roleRef = useRef<'receiver' | 'presenter' | null>(null);

  const safeSend = (data: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  const cleanupConnections = useCallback(() => {
    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

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
    setStream(null);
    setIsConnecting(false);
  }, []);

  // Flush queued ICE candidates once remote description is set
  const processPendingIceCandidates = (pc: RTCPeerConnection) => {
    const queue = pendingIceCandidatesRef.current;
    while (queue.length > 0) {
      const cand = queue.shift();
      if (cand) {
        pc.addIceCandidate(new RTCIceCandidate(cand)).catch((err) => {
          console.warn('[WebRTC] Error adding queued ICE candidate:', err);
        });
      }
    }
  };

  // ----------------------------------------------------
  // RECEIVER LOGIC
  // ----------------------------------------------------
  const startReceiverSession = useCallback(() => {
    cleanupConnections();
    roleRef.current = 'receiver';
    setErrorMessage(null);
    setAppState('RECEIVER_WAITING');

    const ws = new WebSocket(getSignalingUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Receiver WS] Connected, registering receiver');
      safeSend({ type: 'REGISTER_RECEIVER' });
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
          if (msg.code) {
            console.log('[Receiver] Registered with pairing code:', msg.code);
            setPairingCode(msg.code);
          }
          break;
        }

        case 'PRESENTER_JOINED': {
          console.log('[Receiver] Presenter joined. Preparing RTCPeerConnection');
          // Prepare PeerConnection for receiving stream
          const pc = new RTCPeerConnection(RTC_CONFIG);
          pcRef.current = pc;

          pc.ontrack = (trackEvent) => {
            console.log('[Receiver] Received remote stream track');
            const remoteStream = trackEvent.streams[0] || new MediaStream([trackEvent.track]);
            setStream(remoteStream);
            setAppState('RECEIVER_PRESENTATION');
          };

          pc.onicecandidate = (iceEvent) => {
            if (iceEvent.candidate) {
              safeSend({ type: 'SIGNAL_ICE', candidate: iceEvent.candidate.toJSON() });
            }
          };

          pc.onconnectionstatechange = () => {
            console.log('[Receiver] WebRTC Connection state:', pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
              console.log('[Receiver] Presenter disconnected via WebRTC state.');
              // Reset and generate new code
              startReceiverSession();
            }
          };
          break;
        }

        case 'SIGNAL_OFFER': {
          const pc = pcRef.current;
          if (!pc || !msg.sdp) return;
          console.log('[Receiver] Received SDP offer, creating answer');
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            processPendingIceCandidates(pc);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            safeSend({ type: 'SIGNAL_ANSWER', sdp: answer });
          } catch (err) {
            console.error('[Receiver] Error handling offer:', err);
          }
          break;
        }

        case 'SIGNAL_ICE': {
          const pc = pcRef.current;
          if (!pc || !msg.candidate) return;
          if (pc.remoteDescription) {
            pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch((err) => {
              console.warn('[Receiver] Error adding ICE candidate:', err);
            });
          } else {
            pendingIceCandidatesRef.current.push(msg.candidate);
          }
          break;
        }

        case 'PRESENTER_DISCONNECTED': {
          console.log('[Receiver] Presenter disconnected. Refreshing receiver session with new code.');
          // Generate new temporary pairing code and return to waiting state
          startReceiverSession();
          break;
        }

        case 'ERROR': {
          console.warn('[Receiver] Server error:', msg.message);
          break;
        }
      }
    };

    ws.onclose = () => {
      console.log('[Receiver WS] Disconnected');
    };

    ws.onerror = (err) => {
      console.error('[Receiver WS] Error:', err);
    };
  }, [cleanupConnections]);

  // ----------------------------------------------------
  // PRESENTER LOGIC
  // ----------------------------------------------------
  const handlePresenterConnect = useCallback(
    async (code: string) => {
      cleanupConnections();
      roleRef.current = 'presenter';
      setPairingCode(code);
      setErrorMessage(null);
      setIsConnecting(true);
      setAppState('CONNECTING');

      const ws = new WebSocket(getSignalingUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Presenter WS] Connected, sending JOIN_AS_PRESENTER for code:', code);
        safeSend({ type: 'JOIN_AS_PRESENTER', code });
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
            try {
              // 1. Capture screen
              if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                throw new Error(
                  'Screen sharing is not supported by this browser or requires a Secure Context (HTTPS).'
                );
              }

              const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                  frameRate: { ideal: 60, max: 60 },
                },
                audio: false,
              });

              localStreamRef.current = displayStream;
              setStream(displayStream);

              // 2. Setup WebRTC PeerConnection
              const pc = new RTCPeerConnection(RTC_CONFIG);
              pcRef.current = pc;

              displayStream.getTracks().forEach((track) => {
                pc.addTrack(track, displayStream);

                // Handle user stopping screen share via browser floating controls
                track.onended = () => {
                  console.log('[Presenter] Screen sharing stopped natively');
                  handleStopSharing();
                };
              });

              pc.onicecandidate = (iceEvent) => {
                if (iceEvent.candidate) {
                  safeSend({ type: 'SIGNAL_ICE', candidate: iceEvent.candidate.toJSON() });
                }
              };

              pc.onconnectionstatechange = () => {
                console.log('[Presenter] WebRTC Connection state:', pc.connectionState);
                if (pc.connectionState === 'connected') {
                  safeSend({ type: 'STREAM_ACTIVE' });
                  setIsConnecting(false);
                  setAppState('PRESENTER_CONNECTED');
                } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                  handleStopSharing();
                }
              };

              // 3. Create Offer
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              safeSend({ type: 'SIGNAL_OFFER', sdp: offer });
            } catch (err: any) {
              console.error('[Presenter] Error capturing display media:', err);
              cleanupConnections();
              setErrorMessage(err?.name === 'NotAllowedError' ? 'Screen capture cancelled or permission denied.' : (err?.message || 'Screen capture cancelled or permission denied.'));
              setAppState('PRESENTER_PAIRING');
            }
            break;
          }

          case 'SIGNAL_ANSWER': {
            const pc = pcRef.current;
            if (!pc || !msg.sdp) return;
            console.log('[Presenter] Received SDP answer');
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              processPendingIceCandidates(pc);
              setIsConnecting(false);
              setAppState('PRESENTER_CONNECTED');
            } catch (err) {
              console.error('[Presenter] Error setting remote description:', err);
            }
            break;
          }

          case 'SIGNAL_ICE': {
            const pc = pcRef.current;
            if (!pc || !msg.candidate) return;
            if (pc.remoteDescription) {
              pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch((err) => {
                console.warn('[Presenter] Error adding ICE candidate:', err);
              });
            } else {
              pendingIceCandidatesRef.current.push(msg.candidate);
            }
            break;
          }

          case 'RECEIVER_DISCONNECTED': {
            console.log('[Presenter] Receiver disconnected');
            cleanupConnections();
            setErrorMessage('The display has disconnected.');
            setAppState('PRESENTER_PAIRING');
            break;
          }

          case 'ERROR': {
            console.warn('[Presenter] Pairing error:', msg.message);
            cleanupConnections();
            setErrorMessage(msg.message || 'Unable to pair with display.');
            setAppState('PRESENTER_PAIRING');
            break;
          }
        }
      };

      ws.onclose = () => {
        console.log('[Presenter WS] Disconnected');
      };

      ws.onerror = () => {
        cleanupConnections();
        setErrorMessage('Could not connect to the signaling server. Please check your network connection and try again.');
        setAppState('PRESENTER_PAIRING');
      };
    },
    [cleanupConnections]
  );

  // Presenter stops sharing
  const handleStopSharing = useCallback(() => {
    safeSend({ type: 'STOP_SHARING' });
    cleanupConnections();
    setAppState('HOME');
  }, [cleanupConnections]);

  // Cancel connecting or return home
  const handleCancel = useCallback(() => {
    cleanupConnections();
    setAppState('HOME');
  }, [cleanupConnections]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupConnections();
    };
  }, [cleanupConnections]);

  // In RECEIVER_PRESENTATION state, the UI must completely disappear
  if (appState === 'RECEIVER_PRESENTATION') {
    return <ReceiverPresentationScreen stream={stream} />;
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between select-none">
      {/* Header */}
      <Header
        onGoHome={handleCancel}
        showHomeLink={appState !== 'HOME'}
      />

      {/* Main Content Area */}
      <main className="w-full pt-16 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 max-w-6xl mx-auto">
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
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
