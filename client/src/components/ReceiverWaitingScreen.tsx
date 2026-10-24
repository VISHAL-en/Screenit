import React from 'react';

interface ReceiverWaitingScreenProps {
  code: string;
  onCancel: () => void;
  isConnecting?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const ReceiverWaitingScreen: React.FC<ReceiverWaitingScreenProps> = ({
  code,
  onCancel,
  isConnecting = false,
  errorMessage = null,
  onRetry,
}) => {
  const hasCode = /^\d{4}$/.test(code);
  const digits = hasCode ? code.split('').slice(0, 4) : ['•', '•', '•', '•'];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-between py-6 sm:py-10 px-4 my-auto">
      {/* Top Context Bar */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onCancel}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
          <span>Exit Receiver</span>
        </button>

        {hasCode ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Waiting for presenter...
            </span>
          </div>
        ) : isConnecting ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 transition-colors">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping"></span>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Connecting to server...
            </span>
          </div>
        ) : errorMessage ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 transition-colors">
            <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></span>
            <span className="text-xs font-medium text-red-700 dark:text-red-300">
              Connection issue
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:text-slate-500"></span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Preparing display...
            </span>
          </div>
        )}
      </div>

      {/* Main Code Presentation Card */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs p-8 sm:p-14 flex flex-col items-center text-center transition-colors">
        {errorMessage ? (
          <div className="flex flex-col items-center max-w-md my-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
              <span className="material-symbols-outlined text-[24px]">cloud_off</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
              Could not generate code
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex items-center gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Retry Connection</span>
                </button>
              )}
              <button
                onClick={onCancel}
                type="button"
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
              {hasCode ? 'Ready to receive' : 'Preparing display'}
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mb-10 leading-relaxed">
              {hasCode
                ? 'Enter this code on the device you want to present from.'
                : 'Connecting to signaling server to generate your 4-digit pairing code...'}
            </p>

            {/* 4-Digit Display Cards */}
            <div className="flex items-center justify-center gap-3 sm:gap-5 mb-10">
              {digits.map((digit, index) => (
                <div
                  key={index}
                  className={`w-18 h-26 sm:w-24 sm:h-34 md:w-28 md:h-38 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/90 rounded-2xl flex items-center justify-center shadow-xs transition-colors ${
                    !hasCode ? 'animate-pulse opacity-70' : ''
                  }`}
                >
                  <span className="font-mono text-5xl sm:text-7xl md:text-8xl font-semibold text-slate-900 dark:text-white tabular-nums">
                    {digit}
                  </span>
                </div>
              ))}
            </div>

            {/* Network Hint */}
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="material-symbols-outlined text-[16px]">
                {hasCode ? 'wifi' : 'sync'}
              </span>
              <span>
                {hasCode
                  ? 'Both devices must be on the same local network'
                  : 'Establishing secure peer signaling channel...'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
