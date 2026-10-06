import React from 'react';

interface ConnectingScreenProps {
  code: string;
  onCancel: () => void;
}

export const ConnectingScreen: React.FC<ConnectingScreenProps> = ({
  code,
  onCancel,
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center py-10 px-4 my-auto">
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs flex flex-col items-center text-center">
        {/* Subtle Calm Animated Ring */}
        <div className="relative w-14 h-14 mb-6 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-slate-200"></div>
          <div className="absolute top-0 left-0 w-14 h-14 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <span className="material-symbols-outlined text-slate-700 text-[20px]">
            cast
          </span>
        </div>

        {/* Status Texts */}
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">
          Connecting to display...
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Pairing with display code <span className="font-mono font-semibold text-slate-700">{code}</span>.
        </p>

        {/* Cancel Action */}
        <button
          onClick={onCancel}
          type="button"
          className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
