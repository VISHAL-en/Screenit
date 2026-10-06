import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'What is Screenit?',
    answer:
      'Screenit is a lightweight, browser-based wireless presentation tool designed for instant display casting without cables, user accounts, or native application installs. It allows one device to present its screen directly to another device with zero friction.',
  },
  {
    question: 'How does Screenit work?',
    answer:
      'Screenit uses direct WebRTC peer-to-peer technology to transmit screen video between two browsers. A lightweight signaling server facilitates the initial handshake using a temporary 4-digit code. Once paired, video frames flow directly between the devices whenever network conditions permit.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'No. Screenit runs completely within standard modern web browsers (such as Chrome, Edge, Firefox, and Safari). Neither the presenter nor the display screen requires software downloads, browser extensions, or administrative permissions.',
  },
  {
    question: 'Do both devices need to be on the same Wi-Fi?',
    answer:
      'Screenit is primarily designed and optimized for same-network college classrooms, meeting rooms, conferences, and event spaces. While WebRTC can establish connections across different networks, cross-network performance depends on local NAT and firewall traversal and may have higher latency.',
  },
  {
    question: 'How do I connect a presenter?',
    answer:
      'On the display device (projector, TV, or desktop), click "Get Screened" to receive a temporary 4-digit pairing code. On the presenter laptop, click "Share Screen", type the 4-digit code, click "Connect", and select what you want to share in your browser prompt.',
  },
  {
    question: 'Where do I enter the 4-digit code?',
    answer:
      'Open Screenit on the presenter device, select "Share Screen" from the home screen, and enter the 4-digit code displayed on the receiver into the input boxes provided.',
  },
  {
    question: 'What can I share?',
    answer:
      'You can share your entire display, a specific application window, or an individual browser tab. The browser native screen-sharing picker gives you complete control over which screen or application is captured.',
  },
  {
    question: 'Does Screenit record my screen?',
    answer:
      'No. Screenit does not record, capture, or store your screen video. The media stream flows directly peer-to-peer between your devices. The signaling server handles only session handshakes and never touches, relays, or records video frames.',
  },
  {
    question: 'Why is there sometimes more latency on different networks?',
    answer:
      'When two devices are on different networks, media packets must travel through public internet routing nodes, firewalls, and NAT gateways. Local Wi-Fi connections keep packets inside the local router, delivering the lowest latency and highest responsiveness.',
  },
  {
    question: 'Why does the browser ask for screen-sharing permission?',
    answer:
      'Screen capture is protected by browser security sandboxes. Web browsers require explicit user confirmation before any web page can access your display content to ensure your privacy and prevent unauthorized screen capture.',
  },
  {
    question: 'Why does screen sharing not work on some browsers?',
    answer:
      'Screen sharing requires browser support for the standard getDisplayMedia() API and a Secure Context (HTTPS or localhost). Most mobile browsers (such as iOS Safari or Android Chrome) intentionally disable screen capture for web apps, and insecure HTTP origins block media capture APIs.',
  },
  {
    question: 'What should I do if the connection fails?',
    answer:
      'Check that both devices have active network access, verify that the 4-digit code matches the code currently showing on the receiver screen, ensure you approved the browser screen capture prompt, and refresh both pages to generate a fresh pairing session if needed.',
  },
  {
    question: 'Is Screenit free?',
    answer:
      'Yes. Screenit is completely free to use with no subscription, credit card, or paywall.',
  },
  {
    question: 'Does Screenit require an account?',
    answer:
      'No. Screenit requires no user accounts, passwords, or profile creation. You simply open the site, pair with a code, and present.',
  },
];

interface FaqScreenProps {
  onGoHome: () => void;
}

export const FaqScreen: React.FC<FaqScreenProps> = ({ onGoHome }) => {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0, 1]));

  const toggleItem = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (openIndices.size === FAQ_DATA.length) {
      setOpenIndices(new Set());
    } else {
      setOpenIndices(new Set(FAQ_DATA.map((_, i) => i)));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      {/* Category Marker */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        <span className="text-xs font-medium text-slate-600">
          Support & Questions
        </span>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
          Frequently asked questions
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Answers to common questions about using Screenit.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
        <span className="text-xs font-medium text-slate-500">
          {FAQ_DATA.length} questions
        </span>
        <button
          onClick={toggleAll}
          type="button"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          {openIndices.size === FAQ_DATA.length ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Accordion List */}
      <div className="w-full flex flex-col gap-2.5">
        {FAQ_DATA.map((item, index) => {
          const isOpen = openIndices.has(index);
          return (
            <div
              key={index}
              className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden transition-all hover:border-slate-300 shadow-2xs"
            >
              <button
                onClick={() => toggleItem(index)}
                type="button"
                aria-expanded={isOpen}
                className="w-full py-4 px-5 sm:px-6 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-slate-50/50"
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900 pr-4">
                  {item.question}
                </span>
                <span
                  className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-150 shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-4 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Back Button */}
      <div className="w-full flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
        <button
          onClick={onGoHome}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </button>
        <span className="text-xs text-slate-400">
          Screenit
        </span>
      </div>
    </div>
  );
};
