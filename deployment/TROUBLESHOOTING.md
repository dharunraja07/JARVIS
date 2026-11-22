# J.A.R.V.I.S. Production Diagnostics & Troubleshooting

This guide resolves common deployment errors, network glitches, and permission blocks.

---

## 1. WebRTC & Voice Connection Issues

### Problem: "ICE Connection Failed" or "Connecting..." hangs indefinitely
- **Cause**: Network firewall or symmetric NAT blocking UDP WebRTC ports.
- **Fix**:
  1. LiveKit Cloud provides TURN servers over TCP port 443 automatically.
  2. Verify your browser is not blocking WebRTC via aggressive privacy extensions (e.g. uBlock WebRTC IP leak shields).
  3. Verify `LIVEKIT_URL` in backend `.env` begins with `wss://` (not `https://`).

### Problem: Assistant does not speak / No audio output
- **Cause**: Browser autoplay policy prevented audio playback before user interacted with the page.
- **Fix**:
  1. Click anywhere on the JARVIS holographic orb or UI to grant user-gesture audio activation.
  2. In Chrome / Edge: Click the padlock icon in the address bar -> "Site settings" -> "Sound" -> Select "Allow".
  3. In `livekitService.ts`, check that `track.attach()` was called on the remote audio track.

### Problem: "Microphone permission denied"
- **Cause**: User dismissed browser microphone prompt or site is served over insecure HTTP.
- **Fix**:
  1. WebRTC microphone capture requires **HTTPS** (or `localhost`). Production sites must be served via HTTPS on Vercel.
  2. In Android Chrome / Capacitor: Go to App Settings -> Permissions -> Allow Microphone.

---

## 2. CORS & Backend Gateway Errors

### Problem: "Cross-Origin Request Blocked" in browser console
- **Cause**: `JARVIS_ALLOWED_ORIGINS` on Render does not include your frontend Vercel URL.
- **Fix**:
  1. Go to your Render Web Service dashboard -> Environment.
  2. Set `JARVIS_ALLOWED_ORIGINS=https://your-jarvis.vercel.app,http://localhost:5173`.
  3. Click "Save Changes" to trigger automatic redeployment.

### Problem: "502 Bad Gateway" on Render
- **Cause**: The Python server failed to bind to the dynamic `$PORT` provided by Render.
- **Fix**:
  1. Verify `cloud_server.py` uses `int(os.getenv("PORT", os.getenv("JARVIS_CLOUD_PORT", "8000")))`. (Already implemented in v4.4.0).
  2. Check Render Deploy Logs for Python exceptions.

---

## 3. Database Connectivity

### Problem: "psycopg.OperationalError: connection to server failed: SSL SYSCALL error"
- **Cause**: Cloud PostgreSQL providers (Neon, Supabase) require SSL connections.
- **Fix**:
  1. Append `?sslmode=require` to your `DATABASE_URL`:
     ```
     postgresql://user:pass@ep-host.neon.tech/jarvis_memory?sslmode=require
     ```
  2. Ensure Neon branch is not suspended or inactive.

---

## 4. Windows Companion Diagnostics

### Problem: Dashboard says "Host Companion Telemetry Offline"
- **Cause**: `src/windows_companion.py` is not running on your Windows workstation or secret mismatch.
- **Fix**:
  1. Open PowerShell on Windows and test local execution:
     ```powershell
     uv run python src/windows_companion.py
     ```
  2. Check that `JARVIS_DEVICE_SECRET` in your local `.env.local` exactly matches the `JARVIS_DEVICE_SECRET` configured in Render environment variables.
  3. Check that `JARVIS_CLOUD_URL` in `.env.local` points to your active Render Gateway URL (e.g. `https://jarvis-cloud.onrender.com`).
