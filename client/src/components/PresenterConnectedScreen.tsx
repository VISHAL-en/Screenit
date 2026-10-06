import React, { useEffect, useRef } from 'react';

interface PresenterConnectedScreenProps {
  code: string;
  stream: MediaStream | null;
  onStopSharing: () => void;
}

export const PresenterConnectedScreen: React.FC<PresenterConnectedScreenProps> = ({
  code,
  stream,
  onStopSharing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-6 sm:py-8 px-4 my-auto">
      {/* Top Status */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Live presentation on Display {code}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-1">
          You're sharing
        </h1>
        <p className="text-sm text-slate-500">
          Your screen is currently visible on the display.
        </p>
      </div>

      {/* Stream Preview Panel */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-5">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[16px] text-slate-400">
              lock
            </span>
            <span>Direct Peer-to-Peer Link</span>
          </div>

          <button
            onClick={onStopSharing}
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">
              stop_circle
            </span>
            <span>Stop Sharing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
