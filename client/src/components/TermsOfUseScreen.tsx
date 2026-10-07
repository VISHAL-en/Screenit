import React from 'react';

interface TermsOfUseScreenProps {
  onGoHome: () => void;
  backLabel?: string;
}

export const TermsOfUseScreen: React.FC<TermsOfUseScreenProps> = ({
  onGoHome,
  backLabel = 'Back to Home',
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      {/* Category Marker */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 mb-4 transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500"></span>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Terms & Agreement
        </span>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
          Terms of Use
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Terms governing the use of the Screenit wireless presentation application.
        </p>
        <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
          Last updated: October 6, 2026
        </span>
      </div>

      {/* Content Container */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-slate-900 dark:text-slate-100 text-sm leading-relaxed transition-colors">
        {/* 1. Acceptance of Terms */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">01.</span>
            Acceptance of Terms
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            By accessing or using the Screenit web application, you agree to comply with and be bound by these Terms of Use. If you do not agree to these terms, you should not access or use Screenit.
          </p>
        </section>

        {/* 2. Use of Screenit */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">02.</span>
            Use of Screenit
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Screenit is a browser-based wireless presentation tool that enables real-time peer-to-peer screen display between compatible web browsers. Screenit is primarily intended for local environments such as classrooms, lecture halls, meetings, and collaborative events. You may access and use Screenit without creating an account or paying fees.
          </p>
        </section>

        {/* 3. Screen Sharing Responsibility */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">03.</span>
            Screen Sharing Responsibility
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-3">
            You maintain sole responsibility for any and all material, visual displays, audio, and content you choose to present through Screenit. You represent and warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>
              You possess all necessary rights, licenses, and permissions to broadcast and display the content you share.
            </li>
            <li>
              Your presentation content does not infringe upon intellectual property rights, privacy rights, or proprietary rights of any third party.
            </li>
            <li>
              You are responsible for managing the privacy of confidential documents, sensitive messages, and personal information visible on your screen during a presentation session.
            </li>
          </ul>
        </section>

        {/* 4. Prohibited Use */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">04.</span>
            Prohibited Use
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-3">
            When using Screenit, you agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>
              Broadcast illegal, abusive, harassing, defamatory, or unlawful material.
            </li>
            <li>
              Attempt to disrupt, tamper with, overload, or impair the signaling server, web application, or associated network infrastructure.
            </li>
            <li>
              Intercept, eavesdrop on, or manipulate WebRTC signaling sessions belonging to other parties.
            </li>
            <li>
              Use Screenit for unauthorized surveillance, covert recording, or deceptive display capture.
            </li>
          </ul>
        </section>

        {/* 5. Third-Party Services */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">05.</span>
            Third-Party Services
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Screenit is hosted and served using third-party infrastructure providers, including Vercel (frontend hosting) and Render (signaling server). Use of the application is subject to the technical availability, network performance, and acceptable use policies of these underlying hosting platforms.
          </p>
        </section>

        {/* 6. Availability and Reliability */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">06.</span>
            Availability and Reliability
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Screenit is provided on an "as is" and "as available" basis. Screenit does not guarantee uninterrupted, continuous, or zero-latency service. Screen presentation quality and responsiveness depend on local Wi-Fi router conditions, network bandwidth, firewall configurations, and client device hardware.
          </p>
        </section>

        {/* 7. Intellectual Property */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">07.</span>
            Intellectual Property
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            The Screenit application, design tokens, visual layout, and underlying code are the intellectual property of Screenit's creators. You retain full and exclusive ownership of any intellectual property, slide decks, media, and files you present through the application.
          </p>
        </section>

        {/* 8. Disclaimer */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">08.</span>
            Disclaimer
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            To the maximum extent permitted by applicable law, Screenit is provided without warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </section>

        {/* 9. Limitation of Liability */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">09.</span>
            Limitation of Liability
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            To the maximum extent permitted by applicable law, Screenit and its contributors shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, goodwill, or business disruption arising from or related to your use of or inability to use the service.
          </p>
        </section>

        {/* 10. Changes to the Terms */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">10.</span>
            Changes to the Terms
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            We reserve the right to revise or update these Terms of Use at any time. Continued access to or use of Screenit after updated terms are published constitutes your acceptance of the revised terms.
          </p>
        </section>

        {/* 11. Contact */}
        <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">11.</span>
            Contact
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            If you have questions or inquiries regarding these Terms of Use, please reach out to: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-xs text-blue-600 dark:text-blue-400">[its.vishal.n@gmail.com]</code>.
          </p>
        </section>
      </div>

      {/* Bottom Back Button */}
      <div className="w-full flex items-center justify-between pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={onGoHome}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>{backLabel}</span>
        </button>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Screenit
        </span>
      </div>
    </div>
  );
};
