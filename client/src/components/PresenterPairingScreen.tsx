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
    // Auto-focus the first input on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Take only the last digit entered if numeric
    const clean = value.replace(/[^0-9]/g, '');
    const char = clean.slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // If a digit was entered, move focus to next input
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
    <div className="flex flex-col w-full items-center justify-center py-6 max-w-xl mx-auto my-auto px-4">
      {/* Back Link */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors font-label-caps text-xs uppercase tracking-wider group cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">
            arrow_back
          </span>
          <span>Back to options</span>
        </button>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span className="font-label-code text-xs text-secondary">
            DIRECT WEBRTC
          </span>
        </div>
      </div>

      {/* Main Presenter Code Entry Card */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle Ambient Tone Shift Behind Canvas */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-secondary-container/30 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>

        {/* Screen Cast Icon Marker */}
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary mb-4 shadow-xs">
          <span className="material-symbols-outlined text-[26px]">
            present_to_all
          </span>
        </div>

        {/* Heading Hierarchy */}
        <h1 className="font-headline-xl text-on-surface tracking-tight mb-2">
          Share your screen
        </h1>
        <p className="font-body-lg text-secondary max-w-md mb-8">
          Enter the 4-digit code shown on the display.
        </p>

        {/* Interactive 4-Slot PIN Entry */}
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
                className="w-16 h-20 sm:w-20 sm:h-24 bg-surface-container-low border border-outline-variant/50 text-on-surface font-display-room-code text-center rounded-lg shadow-xs focus:outline-none focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all select-all cursor-pointer disabled:opacity-50"
              />
            ))}
          </div>

          {/* Status / Requirement Indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            {isComplete ? (
              <>
                <span className="material-symbols-outlined text-[18px] text-primary">
                  check_circle
                </span>
                <span className="font-label-caps text-xs uppercase tracking-wider text-secondary font-semibold">
                  Ready to connect
                </span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px] text-outline">
                  pending
                </span>
                <span className="font-label-caps text-xs uppercase tracking-wider text-secondary font-medium">
                  Enter {4 - code.length} more digit{4 - code.length > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          {/* Error Message if Any */}
          {errorMessage && (
            <div className="w-full max-w-sm mb-6 p-3 rounded-lg bg-error-container text-on-error-container border border-error/20 flex items-center gap-2 text-left text-sm animate-shake">
              <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={!isComplete || isConnecting}
            className={`w-full sm:w-80 h-12 rounded-lg shadow-md flex items-center justify-center gap-2 font-headline-md text-base font-semibold transition-all ${
              isComplete && !isConnecting
                ? 'bg-primary text-on-primary hover:bg-primary-container active:scale-[0.99] cursor-pointer'
                : 'bg-surface-container text-outline cursor-not-allowed opacity-60'
            }`}
          >
            {isConnecting ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Connect</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Network Note */}
      <div className="w-full max-w-xl mt-6 bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 shadow-xs flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[18px]">wifi</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-body-md text-on-surface font-semibold">
            Same Local Network Required
          </p>
          <p className="font-body-sm text-secondary truncate">
            Make sure your laptop is on the same local Wi-Fi or Ethernet network as the display.
          </p>
        </div>
      </div>
    </div>
  );
};
