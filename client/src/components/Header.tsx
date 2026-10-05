import React from 'react';

interface HeaderProps {
  onGoHome?: () => void;
  showHomeLink?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, showHomeLink = false }) => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 group text-left focus:outline-none"
            title="Screenit Home"
          >
            <span className="font-label-caps text-xs tracking-widest text-on-surface font-bold select-none group-hover:text-primary transition-colors">
              SCREENIT
            </span>
          </button>

          {showHomeLink && onGoHome && (
            <>
              <div className="h-4 w-px bg-outline-variant/40 hidden sm:block"></div>
              <button
                onClick={onGoHome}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-on-surface tracking-wider uppercase transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Home
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/70 border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-secondary font-medium">
              Same Network Required
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
