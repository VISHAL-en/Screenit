import React from 'react';

interface PrivacyPolicyScreenProps {
  onGoHome: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onGoHome }) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
      {/* Category Marker */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        <span className="text-xs font-medium text-slate-600">
          Legal & Privacy
        </span>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-2">
          How Screenit handles technical data, pairing, and peer-to-peer screen sharing.
        </p>
        <span className="font-mono text-xs text-slate-400">
          Last updated: October 6, 2026
        </span>
      </div>

      {/* Content Container */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-slate-900 text-sm leading-relaxed">
        {/* 1. Overview */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">01.</span>
            Overview
          </h2>
          <p className="text-slate-600">
            Screenit is a browser-based wireless presentation utility designed to enable direct screen sharing between devices without friction. Screenit is built on principles of minimal data processing: we do not require user accounts, do not create personal user profiles, do not store presentation recordings, do not provide file storage or chat services, and do not track users across websites.
          </p>
        </section>

        {/* 2. Information Screenit Processes */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">02.</span>
            Information Screenit Processes
          </h2>
          <p className="text-slate-600 mb-3">
            Screenit intentionally processes only the minimal technical data strictly required to pair devices and initiate a wireless session:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>
              <strong className="text-slate-900">Temporary Pairing Codes:</strong> When a receiver selects "Get Screened", the signaling server generates a temporary 4-digit numeric code. This code is held strictly in volatile server memory for the duration of the pairing session and is discarded upon disconnection or session completion.
            </li>
            <li>
              <strong className="text-slate-900">WebRTC Signaling Metadata:</strong> Standard Session Description Protocol (SDP) offers, answers, and ICE candidates exchanged via WebSocket to negotiate peer-to-peer media paths between browsers.
            </li>
          </ul>
          <p className="text-slate-600 mt-3">
            Screenit does not request or process personal identification information, such as your name, email address, physical address, or phone number.
          </p>
        </section>

        {/* 3. Screen Sharing Content */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">03.</span>
            Screen Sharing Content
          </h2>
          <p className="text-slate-600">
            Screenit does not intentionally record, capture, proxy, or store any screen-share video, audio, or visual display data. The presentation stream is transmitted directly peer-to-peer between the presenter and display browsers using WebRTC. Screen video frames flow directly between devices and never pass through or get saved on the signaling server.
          </p>
        </section>

        {/* 4. Pairing and Signaling */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">04.</span>
            Pairing and Signaling
          </h2>
          <p className="text-slate-600">
            The signaling server operates solely to coordinate the WebRTC handshake between the two participating devices. The temporary 4-digit code is an ephemeral session token and is not intended to serve as a permanent identifier for any user or device. Once both devices disconnect or stop presenting, the associated in-memory session is deleted immediately.
          </p>
        </section>

        {/* 5. Cookies and Similar Technologies */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">05.</span>
            Cookies and Similar Technologies
          </h2>
          <p className="text-slate-600">
            Screenit does not use tracking cookies, marketing pixels, third-party analytics trackers, or persistent local storage identifiers. Transient in-memory state is utilized strictly during an active browser session to manage connection status.
          </p>
        </section>

        {/* 6. Third-Party Infrastructure */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">06.</span>
            Third-Party Infrastructure
          </h2>
          <p className="text-slate-600 mb-3">
            Screenit relies on third-party cloud hosting infrastructure to deliver its services:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>
              <strong className="text-slate-900">Frontend Hosting:</strong> The static web application is hosted and delivered via Vercel.
            </li>
            <li>
              <strong className="text-slate-900">Signaling Server:</strong> The Node.js WebSocket signaling server is deployed on Render.
            </li>
            <li>
              <strong className="text-slate-900">STUN Resolution:</strong> Standard public STUN servers (such as Google STUN) are queried by client browsers solely to discover public network routing addresses for WebRTC connection negotiation.
            </li>
          </ul>
          <p className="text-slate-600 mt-3">
            While Screenit does not maintain user databases or activity logs, these underlying infrastructure providers may process standard technical network data (such as IP addresses, HTTP request headers, and routing packets) as part of ordinary internet protocol communication and operational security.
          </p>
        </section>

        {/* 7. Data Retention */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">07.</span>
            Data Retention
          </h2>
          <p className="text-slate-600">
            Screenit maintains no persistent databases, user records, or stored screen files. Pairing codes and session records exist only in volatile server memory for the duration of an active presentation and are automatically removed when either party disconnects or when services restart.
          </p>
        </section>

        {/* 8. Security */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">08.</span>
            Security
          </h2>
          <p className="text-slate-600">
            WebRTC peer-to-peer screen transmissions are encrypted using industry-standard DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-time Transport Protocol) enforced natively by modern web browsers. Web traffic and WebSocket signaling are conducted over encrypted HTTPS and WSS connections.
          </p>
        </section>

        {/* 9. Children's Privacy */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">09.</span>
            Children's Privacy
          </h2>
          <p className="text-slate-600">
            Screenit is a general-utility wireless presentation tool designed for educational classrooms, lecture halls, and meeting environments. Screenit does not solicit or knowingly collect personal information from children or any other users.
          </p>
        </section>

        {/* 10. Changes to This Policy */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">10.</span>
            Changes to This Policy
          </h2>
          <p className="text-slate-600">
            We may update this Privacy Policy from time to time to reflect operational, architectural, or technical changes. Any revisions will be published directly on this page with an updated effective date.
          </p>
        </section>

        {/* 11. Contact */}
        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-mono text-xs">11.</span>
            Contact
          </h2>
          <p className="text-slate-600">
            If you have questions, feedback, or inquiries regarding this Privacy Policy or Screenit technical data practices, please contact: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs text-blue-600">[Contact Email]</code>.
          </p>
        </section>
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
