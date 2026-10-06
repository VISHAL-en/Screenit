import React, { useState, useRef, useEffect } from 'react';

interface PresenterPairingScreenProps {
  onConnect: (code: string) => void;
  onBack: () => void;
  errorMessage?: string | null;
  isConnecting?: boolean;
}

export const PresenterPairingScreen: React.FC<PresenterPairingScreenProps> = ({
  onConnect,
  onBack,
  errorMessage,
  isConnecting = false,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, '');
    const char = clean.slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
      inputRefs[index + 1].current?.select();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
      inputRefs[index - 1].current?.select();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!paste) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 4; i++) {
      if (paste[i]) {
        nextDigits[i] = paste[i];
      }
    }
    setDigits(nextDigits);

    const targetIndex = Math.min(paste.length, 3);
    inputRefs[targetIndex].current?.focus();
  };

  const code = digits.join('');
  const isComplete = code.length === 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplete && !isConnecting) {
      onConnect(code);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center py-6 sm:py-10 max-w-lg mx-auto my-auto px-4">
      {/* Top Navigation */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
          <span>Back</span>
        </button>
        <span className="font-mono text-xs text-slate-400">
          Presenter Mode
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-10 flex flex-col items-center text-center">
        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-2">
          Enter display code
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
          Type the 4-digit code shown on the receiver screen to start presenting.
        </p>

        {/* 4-Digit Inputs */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isConnecting}
                aria-label={`Digit ${index + 1} of 4`}
                className="w-14 h-18 sm:w-16 sm:h-20 bg-slate-50 border border-slate-200 text-slate-900 font-mono text-3xl sm:text-4xl font-semibold text-center rounded-xl shadow-xs focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100/60 focus:outline-none transition-all select-all disabled:opacity-50"
              />
            ))}
          </div>

          {/* Status Message */}
          <div className="h-5 flex items-center justify-center mb-6">
            {isComplete ? (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Ready to connect</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                {4 - code.length} {4 - code.length === 1 ? 'digit' : 'digits'} remaining
              </span>
            )}
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="w-full max-w-md mb-6 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-800 flex items-start gap-2.5 text-left text-xs leading-relaxed">
              <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Connect Button */}
          <button
            type="submit"
            disabled={!isComplete || isConnecting}
            className={`w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
              isComplete && !isConnecting
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer active:scale-[0.99]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isConnecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Connect & Present</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
