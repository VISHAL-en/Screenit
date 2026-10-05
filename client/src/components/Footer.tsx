import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface py-4 border-t border-outline-variant/15 mt-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between text-on-surface-variant font-label-caps text-xs">
        <span className="tracking-wider text-secondary">
          PEER-TO-PEER WEBRTC • DIRECT LOCAL PRESENTATION
        </span>
        <span className="tracking-wider font-label-code text-xs text-outline">
          SCREENIT v1.0
        </span>
      </div>
    </footer>
  );
};
