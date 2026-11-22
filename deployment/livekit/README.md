# J.A.R.V.I.S. LiveKit Cloud Provisioning Guide

LiveKit Cloud powers the ultra-low latency WebRTC audio pipeline, speech transcription (STT), and voice synthesis (TTS).

---

## 1. Create a LiveKit Cloud Account

1. Go to [https://cloud.livekit.io](https://cloud.livekit.io) and register.
2. Create a new Project named `JARVIS`.

---

## 2. Obtain Project Credentials

1. In your project dashboard, navigate to **Settings -> Keys**.
2. Click **Generate Key**.
3. Copy the credentials:
   - **WebSocket URL**: e.g., `wss://jarvis-xxxx.livekit.cloud`
   - **API Key**: e.g., `APIxxxxxxxx`
   - **API Secret**: e.g., `secret_xxxxxxxxxxxxxxxx`
4. Store these securely. They will be added to Render Web Service and Worker environment variables.

---

## 3. Configure Audio & Codecs

- Default Audio Codec: **Opus** (48kHz, Fullband Stereo/Mono)
- In LiveKit Agents SDK, voice sessions connect automatically with AEC (Acoustic Echo Cancellation), AGC (Automatic Gain Control), and noise suppression enabled on client audio tracks.
