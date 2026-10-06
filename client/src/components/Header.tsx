import React from 'react';

interface HeaderProps {
  onGoHome?: () => void;
  showHomeLink?: boolean;
  onNavigate?: (page: 'FAQ' | 'PRIVACY' | 'TERMS') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  showHomeLink = false,
  onNavigate,
}) => {
  const handleNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: 'FAQ' | 'PRIVACY' | 'TERMS'
  ) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="h-14 sm:h-16 max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            type="button"
            className="flex items-center gap-2 group text-left focus:outline-none cursor-pointer"
            title="Screenit — Home"
          >
            {/* Minimal Cast/Display Mark */}
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-[1.03]">
              <span className="material-symbols-outlined text-[18px]">
                cast
              </span>
            </div>
            <span className="font-semibold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Screenit
            </span>
          </button>

          {showHomeLink && onGoHome && (
            <div className="flex items-center">
              <span className="text-slate-300 mx-1.5 text-xs">/</span>
              <button
                onClick={onGoHome}
                type="button"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  arrow_back
                </span>
                <span>Back to App</span>
              </button>
            </div>
          )}
        </div>

        {/* Minimal Right Navigation */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2">
          <a
            href="/faq"
            onClick={(e) => handleNav(e, 'FAQ')}
            className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-100/70"
          >
            FAQ
          </a>
          <a
            href="/privacy"
            onClick={(e) => handleNav(e, 'PRIVACY')}
            className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-100/70"
          >
            Privacy
          </a>
          <a
            href="/terms"
            onClick={(e) => handleNav(e, 'TERMS')}
            className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-100/70"
          >
            Terms
          </a>
        </nav>
      </div>
    </header>
  );
};
