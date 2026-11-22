# J.A.R.V.I.S. Multi-Device Production Verification Protocol

This runbook verifies all features across Web, Windows, Android, and Cloud.

---

## Pre-Flight Check

- [ ] Backend Cloud Gateway is live and healthy (`/api/health/readiness` returns HTTP 200).
- [ ] Managed PostgreSQL database is connected (`database_engine` in `/api/health` shows `PostgreSQL`).
- [ ] LiveKit Cloud credentials are active (`livekit_configured: true`).
- [ ] Vercel frontend is deployed with `VITE_API_URL` pointing to the cloud gateway.
- [ ] Windows Companion is running locally and posting heartbeats.

---

## Test Scenario 1: Multi-Device Identity & Anti-Collision Test

1. Open `https://your-jarvis.vercel.app` on your Windows PC browser.
2. Open the same URL on your Android smartphone browser.
3. On Windows, click the holographic orb to start a LiveKit voice session.
4. On Android, click the holographic orb to start a voice session simultaneously.
5. **Expected Outcome**:
   - Both devices join room `jarvis-room` successfully.
   - Neither device is disconnected or kicked.
   - Windows identity is `user-windows-<hex>`.
   - Android identity is `user-android-<hex>`.

---

## Test Scenario 2: Cross-Device Persistent Memory Sync Test

1. **Step 1 (Windows)**: In Memory dashboard, click **Save New Memory**:
   - Category: `Career`
   - Content: `Completed multi-device deployment of JARVIS Mark VII system.`
   - Click **Save**.
2. **Step 2 (Android)**: Open Memory dashboard on phone.
   - Click refresh or search for `Mark VII`.
   - **Expected Outcome**: The memory saved on Windows appears instantly on Android.
3. **Step 3 (Live Voice Test)**:
   - On Android, say to JARVIS: *"What did I just complete?"*
   - **Expected Outcome**: JARVIS retrieves the memory from PostgreSQL and replies via Gemini TTS: *"You recorded that you completed the multi-device deployment of the JARVIS Mark VII system, Sir."*
4. **Step 4 (Web Delete)**:
   - Delete the memory from the web dashboard.
   - Refresh on Android and Windows; verify it is permanently removed across all devices.

---

## Test Scenario 3: Real-Time Windows Hardware Telemetry Relay

1. On your Windows laptop, ensure `windows_companion.py` is running.
2. On your Android phone, navigate to the **Workstation Hardware Diagnostics** page (`/system`).
3. **Expected Outcome**:
   - Status badge shows: `LIVE WINDOWS TELEMETRY` (Emerald Green).
   - CPU usage gauge updates dynamically with your Windows laptop's live CPU percent.
   - RAM gauge matches Task Manager on your laptop.
   - Battery gauge displays exact laptop battery percentage and charging state.
4. Stop `windows_companion.py` on your laptop.
5. Within 15 seconds, Android UI updates badge to: `COMPANION DISCONNECTED` (Amber) with genuine zero-fake-data reporting.

---

## Test Scenario 4: Real AI Tool Intelligence Dispatch

1. **Weather**: Query *"What's the weather in Tokyo?"* -> Real Open-Meteo temperature, humidity, and condition returned.
2. **Currency**: Query *"Convert 250 USD to EUR"* -> Real-time Frankfurter ECB exchange rate calculated.
3. **News**: Query *"What is the latest technology news?"* -> Real BBC/Google RSS articles fetched.
4. **Web Search**: Query *"Who won the latest Formula 1 Grand Prix?"* -> DuckDuckGo results retrieved with genuine citations.
