# J.A.R.V.I.S. Production Deployment Hub

This directory contains the production-grade deployment configurations, Infrastructure-as-Code (IaC) templates, step-by-step guides, and security protocols for **J.A.R.V.I.S. Mark VII**.

---

## Directory Overview

```
deployment/
├── README.md                           # This overview and quick reference
├── DEPLOYMENT_MASTER_PLAN.md           # Master roadmap and phased deployment sequence
├── ARCHITECTURE.md                     # Deep architectural breakdown of multi-device hybrid cloud
├── SECURITY_CHECKLIST.md               # Security hardening, token policies, and threat mitigations
├── ENVIRONMENT_VARIABLES.md            # Comprehensive matrix of all secrets and configs
├── COST_ESTIMATE.md                    # Free tier limits vs paid scaling analysis ($0/mo viable)
├── TROUBLESHOOTING.md                  # Diagnostics guide for WebRTC, microphone, CORS & companion
├── vercel/
│   ├── README.md                       # Vercel setup and deployment guide
│   └── vercel.json                     # Vercel SPA routing and security headers
├── render/
│   ├── README.md                       # Render.com setup guide (Web Gateway & Background Worker)
│   └── render.yaml                     # Render Blueprint (Infrastructure-as-Code)
├── database/
│   ├── README.md                       # Managed PostgreSQL setup (Neon / Supabase / Render)
│   └── schema.sql                      # PostgreSQL DDL schema & indexing script
├── livekit/
│   └── README.md                       # LiveKit Cloud configuration, keys & voice pipeline
├── windows/
│   ├── README.md                       # Windows Companion startup & background service guide
│   ├── start_companion.bat             # One-click Windows companion launcher
│   └── register_task.ps1               # Windows Task Scheduler auto-start on logon script
├── android/
│   └── README.md                       # Capacitor Android build and packaging instructions
└── testing/
    └── MULTI_DEVICE_VERIFICATION_CHECKLIST.md # Cross-device QA verification protocol
```

---

## Quick Reference: 5-Stage Deployment Roadmap

| Stage | Target Service | Function | Configuration File |
|---|---|---|---|
| **1. Database** | Neon / Supabase / Render PG | Shared persistent memory | `deployment/database/schema.sql` |
| **2. LiveKit Cloud** | livekit.io | WebRTC audio & AI voice models | `deployment/livekit/README.md` |
| **3. Cloud Gateway** | Render Web Service | Tokens, Auth, DB CRUD & Tools | `deployment/render/render.yaml` |
| **4. LiveKit Worker** | Render Worker / VM | AI Agent process (Gemma/Cartesia/Gemini) | `Dockerfile` |
| **5. Frontend & PWA** | Vercel | Holographic UI, WebRTC client, PWA | `deployment/vercel/vercel.json` |
| **6. Windows Companion** | Local Windows Host | Hardware telemetry & system stats | `deployment/windows/register_task.ps1` |
| **7. Mobile & Desktop** | Android / Electron | Native mobile app & desktop wrapper | `capacitor.config.json` |

---

## Automated Migration Command

To migrate existing local SQLite memories (`src/database/jarvis_memory.db`) into your new Cloud PostgreSQL instance:

```powershell
# 1. Preview records to be migrated
uv run python scripts/migrate_sqlite_to_pg.py --dry-run

# 2. Execute migration with live connection
uv run python scripts/migrate_sqlite_to_pg.py --database-url "postgresql://user:pass@ep-host.neon.tech/jarvis_memory?sslmode=require"
```
