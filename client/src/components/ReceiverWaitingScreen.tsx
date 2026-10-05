import React from 'react';

interface ReceiverWaitingScreenProps {
  code: string;
  onCancel: () => void;
}

export const ReceiverWaitingScreen: React.FC<ReceiverWaitingScreenProps> = ({
  code,
  onCancel,
}) => {
  const digits = code.padStart(4, '•').split('').slice(0, 4);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-between min-h-[580px] py-8 px-4 sm:px-6 select-none my-auto">
      {/* Background Ambient Aura */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-primary-fixed/30 via-surface-container/20 to-transparent blur-3xl pointer-events-none -z-10"></div>

      {/* Top Display Context Banner */}
      <div className="w-full flex items-center justify-between pb-6">
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-xs uppercase tracking-widest text-primary font-bold">
            SCREENIT
          </span>
          <span className="text-outline-variant font-label-code text-sm">/</span>
          <span className="font-label-caps text-xs uppercase tracking-wider text-secondary">
            Room Display Mode
          </span>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-3.5 py-1 rounded-full shadow-xs border border-outline-variant/30">
          <span className="material-symbols-outlined text-[16px] text-primary">
            tv
          </span>
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface font-semibold">
            Ready to Cast
          </span>
        </div>
      </div>

      {/* Hero Guidance Block */}
      <div className="text-center max-w-2xl flex flex-col items-center mt-2">
        <div className="inline-flex items-center gap-2 bg-surface-container px-3.5 py-1 rounded-full mb-3 border border-outline-variant/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span className="font-label-caps text-[11px] uppercase tracking-widest text-primary font-semibold">
            Awaiting Wireless Link
          </span>
        </div>
        <h1 className="font-headline-xl text-on-surface font-semibold tracking-tight text-center">
          Ready to receive
        </h1>
        <p className="font-body-lg text-secondary mt-1 text-center max-w-lg">
          Enter this code on the device you want to present from.
        </p>
      </div>

      {/* Monospace 4-Digit Pairing Pin Cluster */}
      <div className="my-8 flex flex-col items-center justify-center w-full">
        <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-6">
          {digits.map((digit, index) => (
            <div
              key={index}
              className="w-20 h-28 sm:w-28 sm:h-36 md:w-32 md:h-44 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl flex items-center justify-center relative overflow-hidden transition-transform"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-primary/30"></div>
              <span className="font-display-room-code sm:text-[96px] md:text-[112px] leading-none text-on-surface tabular-nums">
                {digit}
              </span>
            </div>
          ))}
        </div>

        {/* Live Connectivity Pulse Indicator */}
        <div className="mt-8 flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant/30 px-6 py-2.5 rounded-full shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="font-body-md text-on-surface font-medium">
            Waiting for presenter...
          </span>
        </div>
      </div>

      {/* Connection Guide Note */}
      <div className="w-full max-w-xl bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between text-secondary shadow-xs mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-[20px]">devices</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-label-caps text-[10px] text-secondary uppercase tracking-wider">
              Presenter Device
            </span>
            <span className="font-body-md text-on-surface font-medium">
              Open Screenit & choose "Share Screen"
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-label-code text-xs text-primary font-semibold">
          <span className="material-symbols-outlined text-[16px]">wifi</span>
          Same Network
        </div>
      </div>

      {/* Bottom Control Area */}
      <div className="w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-secondary font-label-caps text-xs">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span>DIRECT PEER-TO-PEER ENCRYPTED</span>
        </div>
        <button
          onClick={onCancel}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 text-on-surface shadow-xs transition-all active:scale-95 font-body-md font-medium cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
};
