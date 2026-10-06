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
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-between py-6 sm:py-10 px-4 my-auto">
      {/* Top Context Bar */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onCancel}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
          <span>Exit Receiver</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-600">
            Waiting for presenter...
          </span>
        </div>
      </div>

      {/* Main Code Presentation Card */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-xs p-8 sm:p-14 flex flex-col items-center text-center">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
          Ready to receive
        </h1>
        <p className="text-base text-slate-500 max-w-md mb-10 leading-relaxed">
          Enter this code on the device you want to present from.
        </p>

        {/* 4-Digit Display Cards */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-10">
          {digits.map((digit, index) => (
            <div
              key={index}
              className="w-18 h-26 sm:w-24 sm:h-34 md:w-28 md:h-38 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-center shadow-xs"
            >
              <span className="font-mono text-5xl sm:text-7xl md:text-8xl font-semibold text-slate-900 tabular-nums">
                {digit}
              </span>
            </div>
          ))}
        </div>

        {/* Network Hint */}
        <div className="inline-flex items-center gap-2 text-xs text-slate-400">
          <span className="material-symbols-outlined text-[16px]">
            wifi
          </span>
          <span>Both devices must be on the same local network</span>
        </div>
      </div>
    </div>
  );
};
