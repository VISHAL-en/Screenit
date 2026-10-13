export type AppState =
  | 'HOME'
  | 'RECEIVER_WAITING'
  | 'PRESENTER_PAIRING'
  | 'CONNECTING'
  | 'PRESENTER_CONNECTED'
  | 'RECEIVER_PRESENTATION'
  | 'FAQ'
  | 'PRIVACY'
  | 'TERMS';

export interface SignalingMessage {
  type: string;
  code?: string;
  token?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  message?: string;
  reason?: string;
  role?: string;
  timestamp?: number;
  gracePeriodMs?: number;
}

export interface ConnectionDiagnostics {
  wsState: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  pcConnectionState: RTCPeerConnectionState | 'none';
  iceConnectionState: RTCIceConnectionState | 'none';
  resolution: string;
  fps: number;
  bitrateKbps: number;
  packetLossPct: number;
  rttMs: number;
  jitterMs: number;
  candidateType: string;
  recoveryState: 'normal' | 'grace_period' | 'ice_restarting' | 'ws_reconnecting';
  lastUpdated: number;
}
