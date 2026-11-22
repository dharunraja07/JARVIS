# J.A.R.V.I.S. Render.com Deployment Guide

Render hosts both the **Cloud Gateway Web Service** (token issuance, memory CRUD, tools) and the **LiveKit Voice Agent Worker** (real-time voice intelligence).

---

## Method 1: Instant Blueprint Deployment (Recommended)

1. Log in to [https://render.com](https://render.com) with GitHub.
2. Click **New +** -> **Blueprint**.
3. Connect your `JARVIS` repository.
4. Render detects `deployment/render/render.yaml` automatically and configures both services.
5. Provide your secret keys in the prompts:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `DATABASE_URL` (From Neon or Supabase)
6. Click **Apply**.

---

## Method 2: Manual Web Service Setup

If you prefer configuring via the web dashboard:

### Service 1: Cloud Gateway (Web Service)
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect `JARVIS` repository.
3. Configure settings:
   - **Name**: `jarvis-cloud-gateway`
   - **Language**: `Python`
   - **Build Command**: `uv sync`
   - **Start Command**: `uv run python src/cloud_server.py`
   - **Health Check Path**: `/api/health/liveness`
4. In **Environment Variables**, add:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `DATABASE_URL` (Neon PostgreSQL URL)
   - `JARVIS_AUTH_KEY` (Create a random secret)
   - `JARVIS_DEVICE_SECRET` (Create a random secret)
   - `JARVIS_ENV`: `production`
   - `JARVIS_ALLOWED_ORIGINS`: Your Vercel domain (e.g. `https://your-jarvis.vercel.app`)
5. Click **Create Web Service**.

### Service 2: LiveKit Agent (Background Worker)
1. Click **New +** -> **Background Worker**.
2. Configure settings:
   - **Name**: `jarvis-livekit-agent`
   - **Language**: `Python`
   - **Build Command**: `uv sync && uv run --module livekit.agents download-files`
   - **Start Command**: `uv run src/agent.py start`
3. Add Environment Variables:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `DATABASE_URL`
4. Click **Create Background Worker**.
