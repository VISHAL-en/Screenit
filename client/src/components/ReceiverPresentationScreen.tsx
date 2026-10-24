import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ConnectionDiagnostics } from '../types';
import { DiagnosticsOverlay } from './DiagnosticsOverlay';

interface ReceiverPresentationScreenProps {
  stream: MediaStream | null;
  diagnostics?: ConnectionDiagnostics;
  recoveryMessage?: string | null;
  onExit?: () => void;
}

export const ReceiverPresentationScreen: React.FC<ReceiverPresentationScreenProps> = ({
  stream,
  diagnostics,
  recoveryMessage,
  onExit,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });
  const [fullscreenFailed, setFullscreenFailed] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

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
    const video = videoRef.current;
    if (!video || !stream) {
      setIsVideoPlaying(false);
      return;
    }

    video.srcObject = stream;
    // Explicitly enforce muted and playsInline on DOM node for strict browser autoplay compliance
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if ('playoutDelayHint' in (video as any)) {
      try {
        (video as any).playoutDelayHint = 0;
      } catch {
        // Ignore unsupported browser property
      }
    }

    const checkPlaying = () => {
      if (video.videoWidth > 0 && !video.paused) {
        setIsVideoPlaying(true);
        setAutoplayBlocked(false);
      }
    };

    const handleLoadedMetadata = () => {
      console.log(`[Media] Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
      checkPlaying();
      video.play().catch((err) => {
        console.warn('[Media] Autoplay play() rejected in loadedmetadata:', err);
        if (err.name === 'NotAllowedError') {
          setAutoplayBlocked(true);
        }
      });
    };

    const handlePlaying = () => {
      console.log('[Media] Video playback started successfully');
      setIsVideoPlaying(true);
      setAutoplayBlocked(false);
      setPlaybackError(null);
    };

    const handleError = () => {
      console.error('[Media] Video element error event');
      setPlaybackError('Stream playback error encountered.');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('timeupdate', checkPlaying);
    video.addEventListener('error', handleError);

    // Initial attempt to start playback
    video
      .play()
      .then(() => {
        console.log('[Media] Initial video play() succeeded');
        setAutoplayBlocked(false);
        checkPlaying();
      })
      .catch((err) => {
        console.warn('[Media] Initial play() rejected:', err);
        if (err.name === 'NotAllowedError') {
          setAutoplayBlocked(true);
        }
      });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('timeupdate', checkPlaying);
      video.removeEventListener('error', handleError);
    };
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
      } else if (e.key === 'Escape' && onExit && !document.fullscreenElement) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, onExit]);

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setIsVideoPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.warn('[Media] Manual play failed:', err);
        });
    }
  };

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
        className={`w-full h-full object-contain m-0 p-0 border-0 outline-none select-none block transition-opacity duration-300 ${
          isVideoPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Connecting / Buffering Neutral Overlay (Never leave the screen pitch black) */}
      {!isVideoPlaying && !autoplayBlocked && !playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-40 px-4 text-center">
          <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-slate-800"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
            <span className="material-symbols-outlined text-blue-400 text-[26px]">
              cast_connected
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">
            Connecting to presenter…
          </h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            Establishing direct peer-to-peer screen stream. Video will start automatically.
          </p>

          {recoveryMessage && (
            <div className="mb-6 px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{recoveryMessage}</span>
            </div>
          )}

          {onExit && (
            <button
              onClick={onExit}
              type="button"
              className="px-5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
            >
              Exit Presentation
            </button>
          )}
        </div>
      )}

      {/* Autoplay Blocked Recovery Overlay */}
      {autoplayBlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white z-40 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-5">
            <span className="material-symbols-outlined text-[30px]">play_circle</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Playback Requires Interaction
          </h2>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            Your browser requires a click to begin display playback.
          </p>

          <button
            onClick={handleManualPlay}
            type="button"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95 mb-4"
          >
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
            <span>Start Viewing Presentation</span>
          </button>

          {onExit && (
            <button
              onClick={onExit}
              type="button"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Exit Presentation
            </button>
          )}
        </div>
      )}

      {/* Playback Error Overlay */}
      {playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-white z-40 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 mb-5">
            <span className="material-symbols-outlined text-[30px]">error_outline</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Playback Interrupted
          </h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {playbackError}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualPlay}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Retry Playback
            </button>
            {onExit && (
              <button
                onClick={onExit}
                type="button"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Discreet fullscreen button shown only when auto-fullscreen is blocked */}
      {!isFullscreen && fullscreenFailed && showControls && (
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

      {/* Discreet exit button in non-fullscreen or when controls are shown */}
      {showControls && onExit && (
        <button
          onClick={onExit}
          type="button"
          title="Exit Presentation"
          className="cursor-pointer absolute top-4 left-4 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-medium shadow-md backdrop-blur-md transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          <span>Exit</span>
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
