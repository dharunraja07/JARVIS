# J.A.R.V.I.S. Environment Variables Matrix

This document provides the authoritative reference for every environment variable across all deployment targets.

---

## 1. Master Environment Variable Matrix

| Variable Name | Required By | Target Host | Example / Recommended Value | Description |
|---|---|---|---|---|
| `LIVEKIT_URL` | Cloud Gateway, Agent Worker | Render / Cloud | `wss://jarvis-xxxxx.livekit.cloud` | Secure WebRTC WebSocket gateway URL from LiveKit Cloud |
| `LIVEKIT_API_KEY` | Cloud Gateway, Agent Worker | Render / Cloud | `APIxxxxxxxxxxxx` | LiveKit Cloud project API Key |
| `LIVEKIT_API_SECRET` | Cloud Gateway, Agent Worker | Render / Cloud | `secret_xxxxxxxxxxxxxxxx` | LiveKit Cloud project API Secret (Keep strictly confidential) |
| `JARVIS_AUTH_KEY` | Cloud Gateway, Frontend | Render, Vercel | `jrv_auth_8f9c1b3e7a2d4506` | Master authentication key for device pairing & session tokens |
| `JARVIS_DEVICE_SECRET` | Cloud Gateway, Windows Companion | Render, Windows Host | `jrv_sec_4a7e91d2c5b803f6` | Shared secret header for Windows companion telemetry relay |
| `JARVIS_ENV` | Cloud Gateway | Render / Cloud | `production` | Enables strict security checks, error sanitization, origin checks |
| `DATABASE_URL` | Cloud Gateway, Agent Worker | Render / Cloud | `postgresql://user:pass@ep-host.neon.tech/jarvis?sslmode=require` | Managed PostgreSQL connection string (PostgreSQL auto-enabled) |
| `PORT` | Cloud Gateway | Render / Cloud | `10000` (Assigned by Render) | Dynamic HTTP port assigned by cloud container orchestrator |
| `JARVIS_CLOUD_HOST` | Cloud Gateway | Render / Cloud | `0.0.0.0` | IP interface binding (must be 0.0.0.0 for public cloud ingress) |
| `JARVIS_CLOUD_PORT` | Cloud Gateway | Local / Render | `8000` | Fallback port if PORT is unset |
| `JARVIS_ALLOWED_ORIGINS`| Cloud Gateway | Render / Cloud | `https://your-jarvis.vercel.app,http://localhost:5173` | Comma-separated list of allowed CORS browser origins |
| `VITE_API_URL` | Frontend Build | Vercel | `https://jarvis-gateway.onrender.com` | Public HTTPS base URL of the deployed Cloud Gateway |
| `JARVIS_CLOUD_URL` | Windows Companion | Windows Host | `https://jarvis-gateway.onrender.com` | Target URL for Windows companion telemetry heartbeats |
| `JARVIS_DEVICE_ID` | Windows Companion | Windows Host | `windows-companion` | Unique identifier for the host workstation |
| `JARVIS_COMPANION_PORT`| Windows Companion | Windows Host | `8001` | Local loopback port for desktop Electron clients |

---

## 2. Environment Configuration by Deployment Target

### A. Vercel (Frontend Project Settings -> Environment Variables)
```
VITE_API_URL=https://<your-render-gateway-subdomain>.onrender.com
```

### B. Render Web Service (`jarvis-cloud-gateway`)
```
LIVEKIT_URL=wss://<your-project>.livekit.cloud
LIVEKIT_API_KEY=<your_key>
LIVEKIT_API_SECRET=<your_secret>
JARVIS_AUTH_KEY=<generate_secure_random_key>
JARVIS_DEVICE_SECRET=<generate_secure_random_secret>
JARVIS_ENV=production
DATABASE_URL=postgresql://<user>:<password>@<neon-or-supabase-host>/jarvis_memory?sslmode=require
JARVIS_ALLOWED_ORIGINS=https://<your-project>.vercel.app,http://localhost:5173
```

### C. Render Background Worker (`jarvis-livekit-agent`)
```
LIVEKIT_URL=wss://<your-project>.livekit.cloud
LIVEKIT_API_KEY=<your_key>
LIVEKIT_API_SECRET=<your_secret>
DATABASE_URL=postgresql://<user>:<password>@<neon-or-supabase-host>/jarvis_memory?sslmode=require
```

### D. Windows Local Workstation (`.env.local` or Windows Environment)
```
JARVIS_CLOUD_URL=https://<your-render-gateway-subdomain>.onrender.com
JARVIS_DEVICE_SECRET=<matching_random_secret_above>
JARVIS_DEVICE_ID=windows-companion
JARVIS_COMPANION_PORT=8001
```
