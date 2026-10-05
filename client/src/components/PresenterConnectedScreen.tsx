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
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center my-auto py-8 px-4">
      {/* Background Aura */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header Info */}
      <div className="w-full flex flex-col items-center text-center space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high/90 border border-outline-variant/30 shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="font-label-caps text-xs uppercase tracking-wider text-on-surface font-semibold">
            Broadcasting Live
          </span>
          <span className="text-outline-variant font-label-code text-xs">•</span>
          <span className="font-label-code text-xs text-primary font-semibold">
            Display {code}
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="font-headline-xl text-on-surface tracking-tight">
            You're sharing
          </h1>
          <p className="font-body-lg text-secondary max-w-md mx-auto">
            Your screen is being displayed.
          </p>
        </div>
      </div>

      {/* Stream Preview Card */}
      <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              desktop_windows
            </span>
            <span className="font-headline-md text-base text-on-surface font-semibold">
              Live Screen Output
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container font-label-code text-xs text-secondary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Streaming</span>
          </div>
        </div>

        {/* Video Preview */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-inverse-surface shadow-inner flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-secondary font-body-sm text-xs">
            <span className="material-symbols-outlined text-[16px] text-primary">
              lock
            </span>
            <span>Local Direct Presentation Link</span>
          </div>

          <button
            onClick={onStopSharing}
            type="button"
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-error hover:bg-on-error-container text-on-error font-headline-md text-base font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              stop_circle
            </span>
            <span>Stop Sharing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
