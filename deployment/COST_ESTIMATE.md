# J.A.R.V.I.S. Production Cost & Capacity Analysis

This guide provides a transparent, zero-surprise breakdown of hosting costs for running J.A.R.V.I.S. across free tiers and paid production options.

---

## 1. Zero-Dollar ($0/Month) Complete Free Tier Setup

You can run J.A.R.V.I.S. permanently for **$0/month** by leveraging the generous developer tiers of modern cloud providers:

| Component | Recommended Provider | Tier | Free Allocation | Sufficiency for J.A.R.V.I.S. |
|---|---|---|---|---|
| **Frontend & PWA** | Vercel | Hobby Plan | 100 GB bandwidth / mo, Unlimited deployments, SSL included | 100% Sufficient for personal / multi-device assistant |
| **Cloud Gateway** | Render.com | Free Web Service | 750 free instance hours / month, automatic HTTPS | Sufficient (sleeps after 15m inactivity; wakes in ~30s on request) |
| **Agent Worker** | Render.com / Local Host | Free Worker or Local | Can run on local PC while using, or Render Free tier | Sufficient for personal use |
| **Database** | Neon.tech / Supabase | Free Serverless PG | 0.5 GB storage, autoscaling to 0, branching | Sufficient for 500,000+ episodic text memories |
| **WebRTC & Voice** | LiveKit Cloud | Developer Free | 10,000 participant minutes / month | Equal to ~166 hours of voice conversation per month! |
| **Total Monthly Cost** | | | **$0.00 / month** | |

---

## 2. Low-Cost Production Upgrade ($7 - $12/Month)

If you require **zero cold-start latency** (your backend never goes to sleep) and 24/7 background worker uptime:

| Upgrade Component | Provider | Cost | Benefit |
|---|---|---|---|
| **Render Web Service** | Render Starter | $7.00 / month | Always-on, 512 MB RAM, 0.5 CPU, 0s wake-up delay |
| **Managed DB** | Neon / Supabase | $0.00 (Free Tier) | 0.5 GB free storage is plenty for personal memories |
| **LiveKit Cloud** | LiveKit Cloud | $0.00 (Free Tier) | Free 10,000 minutes is ample for daily personal use |
| **Total Upgraded Cost** | | **$7.00 / month** | Instant, enterprise-speed response times 24/7 |

---

## 3. Storage & Bandwidth Sizing

- **Memory Database**: Each episodic memory record occupies ~250 bytes in PostgreSQL. 10,000 memories occupy only ~2.5 MB. Neon's free 500 MB limit will last for years of continuous conversational memory.
- **Audio Bandwidth**: LiveKit Opus WebRTC audio consumes ~32 kbps per stream (~240 KB per minute). 1,000 minutes of active voice consumes ~240 MB of bandwidth.
- **AI Tool APIs**: Open-Meteo (Weather), Frankfurter (Currency), BBC/Google News (RSS), and DuckDuckGo Search (DDGS) are 100% free and open with zero subscription fees.
