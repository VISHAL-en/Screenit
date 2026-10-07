import React from 'react';

interface HeaderProps {
  onGoHome?: () => void;
  showHomeLink?: boolean;
  homeLinkText?: string;
  onNavigate?: (page: 'FAQ' | 'PRIVACY' | 'TERMS') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  activeSessionBadge?: {
    label: string;
    actionLabel: string;
    onAction: () => void;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  showHomeLink = false,
  homeLinkText = 'Back to App',
  onNavigate,
  theme = 'light',
  onToggleTheme,
  activeSessionBadge,
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
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="h-14 sm:h-16 max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
        {/* Brand Wordmark & Back Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onGoHome}
            type="button"
            className="flex items-center gap-2 group text-left focus:outline-none cursor-pointer shrink-0"
            title="Screenit — Home"
          >
            {/* Minimal Cast/Display Mark */}
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-[1.03]">
              <span className="material-symbols-outlined text-[18px]">
                cast
              </span>
            </div>
            <span className="font-semibold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Screenit
            </span>
          </button>

          {showHomeLink && onGoHome && (
            <div className="flex items-center min-w-0">
              <span className="text-slate-300 dark:text-slate-700 mx-1.5 text-xs shrink-0">/</span>
              <button
                onClick={onGoHome}
                type="button"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer truncate"
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">
                  arrow_back
                </span>
                <span className="truncate">{homeLinkText}</span>
              </button>
            </div>
          )}
        </div>

        {/* Center Active Session Banner (if browsing informational pages while session active) */}
        {activeSessionBadge && (
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{activeSessionBadge.label}</span>
            <button
              onClick={activeSessionBadge.onAction}
              type="button"
              className="ml-1 font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white underline cursor-pointer inline-flex items-center gap-0.5"
            >
              <span>{activeSessionBadge.actionLabel}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Minimal Right Navigation & Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <nav aria-label="Main Navigation" className="flex items-center gap-0.5 sm:gap-1">
            <a
              href="/faq"
              onClick={(e) => handleNav(e, 'FAQ')}
              className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors px-2 py-1 rounded-md hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
            >
              FAQ
            </a>
            <a
              href="/privacy"
              onClick={(e) => handleNav(e, 'PRIVACY')}
              className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors px-2 py-1 rounded-md hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
            >
              Privacy
            </a>
            <a
              href="/terms"
              onClick={(e) => handleNav(e, 'TERMS')}
              className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors px-2 py-1 rounded-md hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
            >
              Terms
            </a>
          </nav>

          {/* Theme Toggle Divider */}
          {onToggleTheme && (
            <div className="flex items-center pl-1">
              <span className="w-px h-4 bg-slate-200 dark:bg-slate-800 mr-1.5 hidden sm:block" />
              <button
                onClick={onToggleTheme}
                type="button"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span className="material-symbols-outlined text-[19px]">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
