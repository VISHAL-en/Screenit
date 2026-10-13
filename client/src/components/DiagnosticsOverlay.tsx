import React, { useState, useEffect } from 'react';
import type { ConnectionDiagnostics } from '../types';

interface DiagnosticsOverlayProps {
  diagnostics: ConnectionDiagnostics;
  recoveryMessage?: string | null;
  role?: 'presenter' | 'receiver' | null;
  showControls?: boolean;
}

export const DiagnosticsOverlay: React.FC<DiagnosticsOverlayProps> = ({
  diagnostics,
  recoveryMessage,
  role,
  showControls = true,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Toggle on 'd' or 'D' keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'd' || e.key === 'D') {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getStatusColor = (state: string) => {
    if (state === 'connected') return 'bg-emerald-500';
    if (state === 'connecting' || state === 'reconnecting' || state === 'grace_period' || state === 'ice_restarting') {
      return 'bg-amber-500 animate-pulse';
    }
    return 'bg-red-500';
  };

  const formatBitrate = (kbps: number) => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(2)} Mbps`;
    }
    return `${Math.round(kbps)} kbps`;
  };

  return (
    <>
      {/* Recovery / Transient Disconnect Notification Banner */}
      {recoveryMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 dark:bg-slate-950/90 text-white text-xs font-medium shadow-xl border border-amber-500/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{recoveryMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button (Unobtrusive) */}
      <div
        className={`fixed bottom-3 right-3 z-50 flex items-center gap-2 transition-opacity duration-300 ${
          showControls || isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            type="button"
            title="Toggle Diagnostics (Press 'D')"
            className="cursor-pointer group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-slate-300 hover:text-white text-[11px] font-mono shadow-md backdrop-blur-md border border-slate-700/50 transition-all opacity-40 hover:opacity-100"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                diagnostics.pcConnectionState === 'connected' ? 'connected' : diagnostics.wsState
              )}`}
            ></span>
            <span>Stats</span>
            <span className="hidden group-hover:inline opacity-60">('D')</span>
          </button>
        )}

        {/* Expanded Diagnostics Panel */}
        {isOpen && (
          <div className="w-80 rounded-2xl bg-slate-900/95 text-slate-100 border border-slate-700/80 shadow-2xl p-4 backdrop-blur-xl transition-all text-xs font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-blue-400">
                  insights
                </span>
                <span className="font-semibold tracking-wide text-white">
                  Diagnostics {role ? `(${role})` : ''}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                title="Close diagnostics"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 py-3 text-[11px]">
              {/* WebSocket Status */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                <div className="text-slate-400 text-[10px] uppercase font-medium">Signaling (WS)</div>
                <div className="flex items-center gap-1.5 mt-1 font-mono capitalize">
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(diagnostics.wsState)}`}></span>
                  <span>{diagnostics.wsState}</span>
                </div>
              </div>

              {/* WebRTC Status */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                <div className="text-slate-400 text-[10px] uppercase font-medium">WebRTC Link</div>
                <div className="flex items-center gap-1.5 mt-1 font-mono capitalize">
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(diagnostics.pcConnectionState)}`}></span>
                  <span>{diagnostics.pcConnectionState}</span>
                </div>
              </div>

              {/* Resolution */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                <div className="text-slate-400 text-[10px] uppercase font-medium">Resolution</div>
                <div className="mt-1 font-mono font-semibold text-white">
                  {diagnostics.resolution}
                </div>
              </div>

              {/* Frame Rate */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                <div className="text-slate-400 text-[10px] uppercase font-medium">Framerate</div>
                <div className="mt-1 font-mono font-semibold text-white">
                  {diagnostics.fps > 0 ? `${diagnostics.fps} fps` : 'N/A'}
                </div>
              </div>

              {/* Bitrate */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                <div className="text-slate-400 text-[10px] uppercase font-medium">Bitrate</div>
                <div className="mt-1 font-mono font-semibold text-emerald-400">
                  {formatBitrate(diagnostics.bitrateKbps)}
                </div>
              </div>

              {/* Round Trip Time / Latency */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                <div className="text-slate-400 text-[10px] uppercase font-medium">RTT / Delay</div>
                <div className="mt-1 font-mono font-semibold text-blue-400">
                  {diagnostics.rttMs > 0 ? `${Math.round(diagnostics.rttMs)} ms` : '< 5 ms (LAN)'}
                </div>
              </div>

              {/* Packet Loss */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                <div className="text-slate-400 text-[10px] uppercase font-medium">Packet Loss</div>
                <div className={`mt-1 font-mono font-semibold ${diagnostics.packetLossPct > 2 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {diagnostics.packetLossPct.toFixed(1)}%
                </div>
              </div>

              {/* Jitter */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                <div className="text-slate-400 text-[10px] uppercase font-medium">Jitter</div>
                <div className="mt-1 font-mono font-semibold text-slate-200">
                  {diagnostics.jitterMs > 0 ? `${diagnostics.jitterMs.toFixed(1)} ms` : '0 ms'}
                </div>
              </div>
            </div>

            {/* Network Link Candidate Details */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Link path:</span>
              <span className="font-mono text-slate-200 font-medium">
                {diagnostics.candidateType}
              </span>
            </div>
            {diagnostics.recoveryState !== 'normal' && (
              <div className="mt-2 text-[10px] px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                Status: {diagnostics.recoveryState.replace('_', ' ')}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
