# J.A.R.V.I.S. Deployment Master Plan

This document establishes the verified, phase-by-phase execution plan for deploying J.A.R.V.I.S. to production.

---

## 1. High-Level Architecture Topology

```
                       ┌──────────────────────────────────────────────┐
                       │          Vercel Frontend (Edge CDN)          │
                       │     https://your-jarvis.vercel.app           │
                       │  - React 19 + Vite + Tailwind v4 + Lucide    │
                       │  - Holographic UI & Command Centre           │
                       │  - PWA Service Worker (Offline shell)        │
                       └──────────────┬───────────────────────────────┘
                                      │
               HTTPS API Requests     │   WebRTC Audio Stream
               (Tokens, Memory, Tools)│   (Sub-200ms Voice)
                                      │
         ┌────────────────────────────┴─────────────┐         ┌─────────────────────────┐
         │                                          │         │      LiveKit Cloud      │
         ▼                                          │         │  wss://*.livekit.cloud  │
┌─────────────────────────────────┐                 │         └────────────┬────────────┘
│       Render Web Service        │                 │                      │
│   (J.A.R.V.I.S. Cloud Gateway)  │                 │                      │ WebRTC Room
│   - Python aiohttp REST API     │                 │                      │ Session
│   - LiveKit Token Issuance      │                 │                      │
│   - Auth & Session Management   │                 │         ┌────────────▼────────────┐
│   - AI Tools (Weather/News/etc) │                 │         │   Render Background     │
│   - Companion Telemetry Relay   │                 │         │         Worker          │
└────────┬────────────────────────┘                 │         │   (J.A.R.V.I.S. Agent)  │
         │                                          │         │ - Google Gemma 4 31B    │
         │ SQL (SSL)                                │         │ - Cartesia Ink-Whisper  │
         ▼                                          │         │ - Gemini 3.8 Flash TTS  │
┌─────────────────────────────────┐                 │         │ - SQLite / PG Memory    │
│    Managed PostgreSQL DB        │                 │         └─────────────────────────┘
│    (Neon / Supabase / Render)   │                 │
│    - Shared Episodic Memory     │                 │
│    - Automated Daily Backups    │                 │
└─────────────────────────────────┘                 │
                                                    │
                                                    ▼
                                    ┌─────────────────────────────────┐
                                    │    Local Windows Companion      │
                                    │      (User's Windows Laptop)    │
                                    │  - psutil hardware diagnostics  │
                                    │  - Authenticated push heartbeat │
                                    │  - Local loopback 127.0.0.1:8001│
                                    └─────────────────────────────────┘
```

---

## 2. Deployment Stages & Prerequisites

### Stage 1: GitHub Repository Synchronization
- Verify all code is clean, linted, tested, and pushed to `main`.
- Ensure `.env`, `.env.local`, and secrets are excluded by `.gitignore`.

### Stage 2: Managed PostgreSQL Database Provisioning
- **Recommended Provider**: Neon.tech (Free Serverless PostgreSQL, 0.5 GB storage, instant branching) or Supabase.
- **Actions**:
  1. Create database `jarvis_memory`.
  2. Execute `deployment/database/schema.sql` to initialize tables and indices.
  3. Run `python scripts/migrate_sqlite_to_pg.py --database-url "..."` to migrate existing memories.
  4. Save `DATABASE_URL` for backend configuration.

### Stage 3: LiveKit Cloud Setup
- **Provider**: LiveKit Cloud (https://cloud.livekit.io)
- **Actions**:
  1. Create a project named `JARVIS`.
  2. Note down: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.
  3. Ensure default codec is Opus (48kHz) for crystal-clear voice.

### Stage 4: Backend Cloud Gateway & LiveKit Worker Deployment
- **Provider**: Render.com (or Railway)
- **Option A (Render Blueprint)**: Connect repository and apply `deployment/render/render.yaml`.
- **Option B (Manual Web Service)**:
  - **Service 1 (Web Service)**: `uv run python src/cloud_server.py`
    - Port: dynamic `$PORT`
    - Health check path: `/api/health/liveness`
  - **Service 2 (Background Worker)**: `uv run src/agent.py start`
    - Connects outbound to LiveKit Cloud.

### Stage 5: Frontend Production Deployment on Vercel
- **Provider**: Vercel (https://vercel.com)
- **Configuration**:
  - Root directory: `frontend`
  - Framework: `Vite`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://your-cloud-gateway.onrender.com`

### Stage 6: Windows Local Companion Setup
- On the user's Windows machine:
  1. Configure `.env.local` with `JARVIS_CLOUD_URL=https://your-cloud-gateway.onrender.com` and `JARVIS_DEVICE_SECRET`.
  2. Register background task via `deployment/windows/register_task.ps1`.
  3. Verify heartbeat reception on Cloud Gateway via `/api/system`.

### Stage 7: Android and Desktop Packaging (Optional)
- Android: Build APK using `@capacitor/android` with microphone permissions.
- Desktop: Package Electron Windows app using `desktop/package.json`.

---

## 3. Rollback & Disaster Recovery Procedures

1. **Frontend Rollback**: In Vercel Dashboard -> Deployments -> Click previous stable deployment -> "Instant Rollback".
2. **Backend Rollback**: In Render Dashboard -> Deploys -> Revert to previous successful commit.
3. **Database Recovery**: Neon and Supabase support Point-in-Time Recovery (PITR). Local SQLite copies remain safe in `src/database/jarvis_memory.db` as cold backup.
