# Screenit

> **“Present without the cable.”**

A lightweight, zero-friction wireless screen presentation platform designed for local network display casting via WebRTC.

---

## Core Experience

```
Open → Choose → Pair → Present
```

1. **Big Screen / Projector Computer**: Opens Screenit, selects **GET SCREENED**, and receives a temporary 4-digit pairing code (e.g., `4827`).
2. **Presenter Laptop**: Opens Screenit on the same local network, selects **SHARE SCREEN**, enters the 4-digit code, and clicks **Connect**.
3. **Screen Sharing**: Presenter picks what to share via native browser prompt.
4. **Presentation Mode**: The receiver screen instantly switches to 100vw × 100vh display of the presenter's screen with `object-fit: contain` and zero UI obstructions.
5. **Stop Sharing**: When the presenter clicks **Stop Sharing** (or stops sharing via the browser bar), the receiver automatically returns to the standby state with a new temporary code.

---

## Architecture & Technology

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS (incorporating the Stitch design tokens and aesthetics: *Hanken Grotesk*, *JetBrains Mono*, *Material Symbols*).
- **Backend**: Node.js, Express, WebSocket (`ws`) for signaling and session management.
- **Media Transmission**: Direct peer-to-peer WebRTC (`RTCPeerConnection` with `getDisplayMedia()`). The backend **never** touches or proxies screen video frames.
- **State Store**: Temporary in-memory session mapping with strict 4-digit temporary PIN validation and single-presenter lock.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Both devices connected to the same Wi-Fi / Local Network

### 2. Start Both Services

From the project root:

```bash
npm run dev
```

This concurrently starts:
- **Signaling Server**: `http://localhost:3001` (WebSocket on port `3001`)
- **Vite Web Client**: `http://localhost:5173` (also accessible on your local network IP, e.g. `http://192.168.x.x:5173`)

### 3. Testing Across Devices

- **Device A (Display/TV)**: Open `http://<your-local-ip>:5173` → Click **GET SCREENED**
- **Device B (Presenter Laptop)**: Open `http://<your-local-ip>:5173` → Click **SHARE SCREEN** → Enter the 4-digit PIN → Click **Connect**

### 4. Running Automated Tests

```bash
# Verify complete signaling handshake (registration, pairing, offer/answer, ICE, teardown)
npm run test:signaling

# Verify security & validation (invalid codes, malformed payloads, duplicate presenter lock)
npm run test:validation
```
