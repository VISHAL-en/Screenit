import React from 'react';

interface HomeScreenProps {
  onSelectShareScreen: () => void;
  onSelectGetScreened: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectShareScreen,
  onSelectGetScreened,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-6 sm:py-12 px-4 sm:px-6 my-auto">
      {/* Category Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 mb-5 sm:mb-6 transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500"></span>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Direct Wireless Presentation
        </span>
      </div>

      {/* Hero Headline */}
      <div className="text-center max-w-2xl flex flex-col items-center mb-8 sm:mb-12">
        <h1 className="font-headline-xl text-slate-900 dark:text-white tracking-[-0.03em] mb-3 text-center">
          Present without the cable.
        </h1>
        <p className="font-body-lg text-slate-500 dark:text-slate-400 max-w-xl text-center leading-relaxed">
          Wirelessly share your screen to a nearby display. No apps, accounts, or cables required.
        </p>
      </div>

      {/* Primary Actions: Share Screen vs Get Screened */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mb-12 sm:mb-16">
        {/* Presenter Action */}
        <button
          onClick={onSelectShareScreen}
          type="button"
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center mb-5 group-hover:bg-blue-600 dark:group-hover:bg-blue-600 group-hover:text-white transition-colors duration-150">
              <span className="material-symbols-outlined text-[22px]">
                laptop_mac
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Presenter
            </span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight mb-1.5">
              Share Screen
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Broadcast your laptop screen, window, or tab to a paired display.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors inline-flex items-center gap-1">
              <span>Start presenting</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </span>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
              Source
            </span>
          </div>
        </button>

        {/* Receiver Action */}
        <button
          onClick={onSelectGetScreened}
          type="button"
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center mb-5 group-hover:bg-blue-600 dark:group-hover:bg-blue-600 group-hover:text-white transition-colors duration-150">
              <span className="material-symbols-outlined text-[22px]">
                tv
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Display / Projector
            </span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight mb-1.5">
              Get Screened
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Turn this display into a receiver and generate a temporary 4-digit code.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors inline-flex items-center gap-1">
              <span>Open receiver</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </span>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
              Target
            </span>
          </div>
        </button>
      </div>

      {/* Subtle Visual Demonstration of the Flow */}
      <div className="w-full max-w-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 mb-10 transition-colors">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 text-center">
          How it works
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Step 1 */}
          <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2">
            <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Open Screenit
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                On both devices
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2">
            <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Enter 4-Digit Code
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                e.g. 4827
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2">
            <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Present
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Instant peer-to-peer
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Product Pillars */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500">
            lock
          </span>
          <span>Peer-to-Peer WebRTC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500">
            bolt
          </span>
          <span>Zero installation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500">
            schedule
          </span>
          <span>No account required</span>
        </div>
      </div>
    </div>
  );
};
