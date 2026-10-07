import React from 'react';

interface FooterProps {
  onNavigate?: (page: 'FAQ' | 'PRIVACY' | 'TERMS') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: 'FAQ' | 'PRIVACY' | 'TERMS'
  ) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200/70 dark:border-slate-800/70 py-6 mt-auto transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        {/* Brand Statement */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-200 tracking-tight">Screenit</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-500 dark:text-slate-400">Present without the cable.</span>
        </div>

        {/* Links & Protocol info */}
        <div className="flex items-center gap-5 sm:gap-6">
          <a
            href="/faq"
            onClick={(e) => handleLinkClick(e, 'FAQ')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            FAQ
          </a>
          <a
            href="/privacy"
            onClick={(e) => handleLinkClick(e, 'PRIVACY')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            onClick={(e) => handleLinkClick(e, 'TERMS')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Terms of Use
          </a>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="hidden md:inline font-mono text-[11px] text-slate-400 dark:text-slate-500">
            WebRTC P2P
          </span>
        </div>
      </div>
    </footer>
  );
};
