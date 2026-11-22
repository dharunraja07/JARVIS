# J.A.R.V.I.S. Production Security Protocols

This document defines the zero-trust security standards enforced across J.A.R.V.I.S.

---

## 1. Zero-Secret Frontend Rule
- **Standard**: No API keys, database credentials, or LiveKit secrets exist in frontend client code, Vite bundles, or browser memory.
- **Implementation**:
  - The LiveKit API Secret is stored exclusively on the backend Cloud Gateway (`LIVEKIT_API_SECRET`).
  - Frontend requests an ephemeral JSON Web Token (JWT) on demand via `/api/livekit/token`.
  - JWT tokens have a strictly limited room grant and expire automatically.
  - Tokens are never stored in `localStorage` or `sessionStorage`.

---

## 2. Cross-Device Identity Isolation
- **Standard**: When multiple devices (e.g. Windows PC, Android Phone, iPad) connect to the same voice session, neither device must be kicked or collide with the other.
- **Implementation**:
  - The token gateway inspects `X-JARVIS-CLIENT-DEVICE` header and generates cryptographically randomized participant identities:
    - Windows: `user-windows-a8f3b2`
    - Android: `user-android-4c91d8`
    - Web: `user-web-7e21a0`
  - Each participant has unique audio and data track publishing grants.

---

## 3. Host Companion Pairing & Telemetry Security
- **Standard**: The Windows Companion must never expose local hardware controls to unauthenticated third parties.
- **Implementation**:
  - Telemetry is dispatched exclusively via **outbound** HTTPS POST to the Cloud Gateway.
  - Requests must include the shared secret header: `X-JARVIS-DEVICE-SECRET: <your-secure-secret>`.
  - Local loopback server (`http://127.0.0.1:8001`) strictly rejects any connection from non-loopback IP addresses (`127.0.0.1` and `::1` only).

---

## 4. Production Master Key Enforcement
- **Standard**: In production mode (`JARVIS_ENV=production`), the application refuses or issues severe security audit alerts if default fallback keys are detected.
- **Verification**:
  - `src/cloud_server.py` checks whether `JARVIS_AUTH_KEY == "jarvis-master-key-2026"` or `JARVIS_DEVICE_SECRET == "jarvis-paired-device-secret-42"`.
  - Production deployments require 32+ character random alphanumeric strings.

---

## 5. Safe Error Sanitization
- **Standard**: Internal exceptions and stack traces must never leak to API consumers in production.
- **Implementation**:
  - `cors_middleware` intercepts all unhandled 500 exceptions.
  - In production mode, returns generic JSON: `{"error": "Internal server error occurred."}` while logging the full traceback to server logs.

---

## 6. Git Hygiene & Secret Scanning
- Ensure the following files are NEVER tracked in Git:
  - `.env`
  - `.env.local`
  - `src/database/jarvis_memory.db`
  - `*.pem`, `*.key`, `*.cert`
- Regularly audit repository with: `git status` and verify `.gitignore` integrity.
