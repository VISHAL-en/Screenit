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
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center my-auto py-12 px-4 sm:px-6">
      {/* Top Identity Marker */}
      <div className="flex items-center gap-2 mb-6">
        <span className="font-label-code text-sm text-primary uppercase font-bold tracking-wider">
          Screenit
        </span>
        <span className="h-1 w-1 rounded-full bg-outline"></span>
        <span className="bg-surface-container-high text-on-surface-variant font-label-caps text-[11px] px-3 py-0.5 rounded-full uppercase font-medium">
          Local Presentation
        </span>
      </div>

      {/* Typography Hero */}
      <div className="text-center max-w-2xl flex flex-col items-center">
        <h1 className="font-headline-xl text-on-surface tracking-tight mb-3">
          Present without the cable.
        </h1>
        <p className="font-body-lg text-secondary">
          Share your screen wirelessly with a display on the same network.
        </p>
      </div>

      {/* Environmental Status Strip */}
      <div className="mt-6 mb-10 flex items-center gap-4 px-4 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-code text-xs text-secondary font-medium">
            Local Peer-to-Peer
          </span>
        </div>
        <span className="text-outline-variant font-label-code text-xs">•</span>
        <span className="font-label-code text-xs text-on-surface-variant">
          Ultra-Low Latency WebRTC
        </span>
      </div>

      {/* Core Interactive Dual-Selector Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Card 1: Share Screen (Presenter) */}
        <button
          onClick={onSelectShareScreen}
          className="group relative flex flex-col justify-between p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-200">
                <span className="material-symbols-outlined text-[32px]">
                  laptop_chromebook
                </span>
              </div>
              <span className="font-label-caps text-xs uppercase text-secondary group-hover:text-primary tracking-widest font-semibold transition-colors">
                P-01 • SOURCE
              </span>
            </div>
            <span className="font-label-caps text-[11px] tracking-widest uppercase text-outline mb-1.5 block font-semibold">
              Initiate Stream
            </span>
            <h2 className="font-headline-lg text-on-surface font-semibold mb-2 tracking-tight">
              SHARE SCREEN
            </h2>
            <p className="font-body-md text-secondary leading-relaxed">
              Present your laptop screen on a nearby display with instantaneous peer-to-peer pairing.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-headline-md text-base text-primary font-semibold">
              <span>Start Presenting</span>
              <span className="material-symbols-outlined text-[20px] transform group-hover:translate-x-1.5 transition-transform duration-200">
                arrow_forward
              </span>
            </span>
            <span className="font-label-code text-xs text-outline group-hover:text-primary transition-colors font-medium">
              Ready
            </span>
          </div>
        </button>

        {/* Card 2: Get Screened (Receiver) */}
        <button
          onClick={onSelectGetScreened}
          className="group relative flex flex-col justify-between p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-200">
                <span className="material-symbols-outlined text-[32px]">tv</span>
              </div>
              <span className="font-label-caps text-xs uppercase text-secondary group-hover:text-primary tracking-widest font-semibold transition-colors">
                R-02 • TARGET
              </span>
            </div>
            <span className="font-label-caps text-[11px] tracking-widest uppercase text-outline mb-1.5 block font-semibold">
              Standby Mode
            </span>
            <h2 className="font-headline-lg text-on-surface font-semibold mb-2 tracking-tight">
              GET SCREENED
            </h2>
            <p className="font-body-md text-secondary leading-relaxed">
              Turn this screen into a wireless presentation display and broadcast pairing credentials.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-headline-md text-base text-primary font-semibold">
              <span>Open Receiver</span>
              <span className="material-symbols-outlined text-[20px] transform group-hover:translate-x-1.5 transition-transform duration-200">
                arrow_forward
              </span>
            </span>
            <span className="font-label-code text-xs text-outline group-hover:text-primary transition-colors font-medium">
              Display
            </span>
          </div>
        </button>
      </div>

      {/* Network Protocol Guarantee */}
      <div className="mt-12 text-center max-w-xl">
        <div className="inline-flex items-center gap-1.5 text-outline mb-1.5">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span className="font-label-caps text-[11px] uppercase tracking-wider font-semibold">
            Zero Deployment Overhead
          </span>
        </div>
        <p className="font-body-sm text-secondary">
          No signups, no downloads, no configuration. Both devices simply need to be connected to the same Wi-Fi or Ethernet.
        </p>
      </div>
    </div>
  );
};
