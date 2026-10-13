import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ConnectionDiagnostics } from '../types';
import { DiagnosticsOverlay } from './DiagnosticsOverlay';

interface ReceiverPresentationScreenProps {
  stream: MediaStream | null;
  diagnostics?: ConnectionDiagnostics;
  recoveryMessage?: string | null;
}

export const ReceiverPresentationScreen: React.FC<ReceiverPresentationScreenProps> = ({
  stream,
  diagnostics,
  recoveryMessage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });
  const [fullscreenFailed, setFullscreenFailed] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isFullscreen) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if ('playoutDelayHint' in (videoRef.current as any)) {
        try {
          (videoRef.current as any).playoutDelayHint = 0;
        } catch {
          // Ignore unsupported browser property
        }
      }
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay may have been blocked or delayed:', err);
      });
    }
  }, [stream]);

  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const target = document.documentElement;
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        }
      }
    } catch (err) {
      console.warn('[Receiver] Fullscreen request was prevented or blocked by browser:', err);
      setFullscreenFailed(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestFullscreen();
    }, 0);
    return () => clearTimeout(timer);
  }, [requestFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (active) {
        setFullscreenFailed(false);
      } else {
        setFullscreenFailed(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.warn('[Receiver] Error exiting fullscreen on unmount:', err);
        });
      }
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('[Receiver] Error toggling fullscreen:', err);
    }
  }, [requestFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      onDoubleClick={toggleFullscreen}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 w-screen h-screen bg-black overflow-hidden z-50 flex items-center justify-center m-0 p-0 ${
        isFullscreen ? (showControls ? 'cursor-default' : 'cursor-none') : 'cursor-default'
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain m-0 p-0 border-0 outline-none select-none block"
      />

      {/* Discreet fullscreen button shown only when auto-fullscreen is blocked */}
      {!isFullscreen && fullscreenFailed && (
        <button
          onClick={requestFullscreen}
          type="button"
          title="Enter Fullscreen (or press F, or double-click)"
          className="cursor-pointer absolute top-4 right-4 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium shadow-md backdrop-blur-md transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">
            fullscreen
          </span>
          <span>Enter Fullscreen</span>
        </button>
      )}

      {diagnostics && (
        <DiagnosticsOverlay
          diagnostics={diagnostics}
          recoveryMessage={recoveryMessage}
          role="receiver"
          showControls={showControls}
        />
      )}
    </div>
  );
};
