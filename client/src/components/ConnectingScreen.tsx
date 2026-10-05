import React from 'react';

interface ConnectingScreenProps {
  code: string;
  onCancel: () => void;
}

export const ConnectingScreen: React.FC<ConnectingScreenProps> = ({ code, onCancel }) => {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center my-auto py-10 px-4">
      <div className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl p-8 sm:p-10 relative overflow-hidden flex flex-col items-center text-center">
        {/* Subtle Ambient Tone Shift */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>

        {/* Handshake Graphic */}
        <div className="relative w-full max-w-sm h-32 flex items-center justify-between mb-6 select-none px-4">
          {/* Laptop Side */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-16 h-16 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center shadow-xs text-primary">
              <span className="material-symbols-outlined text-[32px]">
                laptop_mac
              </span>
            </div>
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-secondary font-medium">
              Your Laptop
            </span>
          </div>

          {/* Connection Line with Traveling Pulse */}
          <div className="flex-1 relative flex items-center justify-center h-16 mx-4">
            <div className="w-full h-0.5 border-t-2 border-dashed border-primary/40 relative"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary/20 animate-ping"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
            </div>
          </div>

          {/* Display Side */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="relative w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-md text-on-primary">
              <span className="material-symbols-outlined text-[32px]">tv</span>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-fixed border-2 border-surface-container-lowest"></span>
              </span>
            </div>
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface font-semibold">
              Display {code}
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col items-center gap-1 mb-6 max-w-sm">
          <h1 className="font-headline-lg text-on-surface tracking-tight flex items-center gap-2">
            <span>Connecting</span>
            <span className="inline-flex gap-0.5 tracking-tighter">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
            </span>
          </h1>
          <p className="font-body-md text-secondary">
            Connecting to the display.
          </p>
        </div>

        {/* Ticker */}
        <div className="w-full max-w-xs bg-surface-container-low border border-outline-variant/30 rounded-lg py-2 px-4 flex items-center justify-center gap-2.5 mb-8">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <span className="font-label-code text-xs text-secondary tracking-normal">
            Establishing direct peer link...
          </span>
        </div>

        {/* Cancel Button */}
        <div className="w-full flex justify-center">
          <button
            onClick={onCancel}
            type="button"
            className="px-6 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-body-md transition-colors duration-150 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">
              close
            </span>
            <span>Cancel connection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
