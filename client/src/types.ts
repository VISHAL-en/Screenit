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
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  message?: string;
  reason?: string;
}
