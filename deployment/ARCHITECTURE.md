# J.A.R.V.I.S. Technical Architecture

## 1. System Components & Data Flows

### A. Frontend Layer (Single Page Application & Progressive Web App)
- **Framework**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Audio & WebRTC**: `@livekit/components-react` and `livekit-client`.
- **State Store**: Zustand store (`useJarvisStore`) managing assistant connection states (`disconnected`, `connecting`, `connected`, `listening`, `thinking`, `speaking`), transcripts, system telemetry, and user preferences.
- **Zero-Secret Client**: The frontend holds NO persistent LiveKit API secrets or master database credentials. It requests short-lived JWT access tokens from `/api/livekit/token` on demand.

### B. Cloud Gateway Layer (`src/cloud_server.py`)
- **Server**: Asynchronous Python `aiohttp` web server running on high-concurrency event loop.
- **Port Handling**: Binds to `0.0.0.0` and reads dynamically assigned `$PORT` from environment for cloud container compatibility.
- **CORS Protection**: Origin-checked middleware with configurable `JARVIS_ALLOWED_ORIGINS`.
- **Endpoints**:
  - `/api/health`: Service metadata, version, platform, DB engine, and companion status.
  - `/api/health/liveness`: Container orchestrator liveness check.
  - `/api/health/readiness`: Verifies database responsiveness and LiveKit secret configuration.
  - `/api/auth/login` & `/api/auth/verify`: Client device authentication issuing session tokens.
  - `/api/livekit/token`: Generates collision-free WebRTC tokens stamped with device type (`user-windows-*`, `user-android-*`, `user-web-*`).
  - `/api/memories` (GET, POST, DELETE): CRUD bridge to shared persistent memory.
  - `/api/companion/heartbeat`: Authenticated receiver for Windows host telemetry.
  - `/api/system`: Relays live Windows workstation hardware telemetry to any authenticated client.
  - AI dispatch tools: `/api/weather`, `/api/news`, `/api/currency`, `/api/search`, `/api/time`.

### C. LiveKit Voice Agent Worker (`src/agent.py`)
- **Runtime**: `livekit-agents` worker connecting via secure WebSockets to LiveKit Cloud.
- **LLM**: Google Gemma 4 31B instruction-tuned neural model (`google/gemma-4-31b-it`).
- **STT**: Cartesia Ink-Whisper (`cartesia/ink-whisper`) with sub-150ms speech-to-text inference.
- **TTS**: Google Gemini 3.8 Flash TTS (`google/gemini-3.8-flash-tts`) for lifelike speech synthesis.
- **Audio Pre-processing**: `ai-coustics` plugin for neural noise reduction and acoustic cleanup.
- **Function Tools**: Registered tools for Weather, News, Currency, Web Search, Date/Time, System Monitor, and Memory Retrieval/Storage.

### D. Persistent Storage Engine (`src/memory.py` & `src/memory_manager.py`)
- **Dual-Engine Abstraction**:
  - **Local Development / Offline**: Embedded SQLite (`src/database/jarvis_memory.db`) with WAL mode.
  - **Cloud Production**: Managed PostgreSQL (via `psycopg` v3) triggered automatically whenever `DATABASE_URL` is set.
- **Shared Memory Topology**: Both the Cloud Gateway (REST API) and the LiveKit Agent Worker connect to the same PostgreSQL database, ensuring instant memory synchronization across voice and UI.

### E. Windows Local Companion (`src/windows_companion.py`)
- **Service**: Standalone background Python process on the user's primary Windows computer.
- **Sensors**: Reads physical CPU usage, cores, RAM allocation, NVMe disk usage, and battery charging status via `psutil`.
- **Outbound Heartbeat**: Posts authenticated telemetry payloads every 4 seconds to the Cloud Gateway with header `X-JARVIS-DEVICE-SECRET`.
- **Zero Inbound Attack Surface**: Does NOT require opening ports or port-forwarding on home router; communicates strictly via outbound HTTPS.
