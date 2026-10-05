import React, { useEffect, useRef, useState } from 'react';

interface ReceiverPresentationScreenProps {
  stream: MediaStream | null;
}

export const ReceiverPresentationScreen: React.FC<ReceiverPresentationScreenProps> = ({
  stream,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFullscreenHint, setShowFullscreenHint] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay may have been blocked or delayed:', err);
      });
    }
  }, [stream]);

  // Request fullscreen when user interacts (double click or 'F' key)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      onDoubleClick={toggleFullscreen}
      onMouseEnter={() => setShowFullscreenHint(true)}
      onMouseLeave={() => setShowFullscreenHint(false)}
      className="fixed inset-0 w-screen h-screen bg-black overflow-hidden z-50 flex items-center justify-center m-0 p-0 cursor-none"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain m-0 p-0 border-0 outline-none select-none block"
      />

      {/* Tiny unobtrusive fullscreen helper visible briefly on hover */}
      {showFullscreenHint && (
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen (or press F, or double-click)"
          className="cursor-pointer absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-black/80 transition-all backdrop-blur-xs"
        >
          <span className="material-symbols-outlined text-[20px]">
            fullscreen
          </span>
        </button>
      )}
    </div>
  );
};
