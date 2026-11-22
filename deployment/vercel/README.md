# J.A.R.V.I.S. Vercel Frontend Deployment Guide

This guide details deploying the holographic frontend and PWA to Vercel.

---

## 1. Import Repository in Vercel

1. Log in to [https://vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Under **Import Git Repository**, locate `dharunraja07/JARVIS` and click **Import**.

---

## 2. Configure Project Build Settings

In the Vercel Project Configuration screen:

1. **Framework Preset**: `Vite` (automatically detected).
2. **Root Directory**: Click **Edit** and select `frontend`.
3. **Build Command**: `npm run build` (Default).
4. **Output Directory**: `dist` (Default).
5. **Install Command**: `npm install` (Default).

---

## 3. Configure Environment Variables

Under **Environment Variables**, add the single required frontend build secret:

| Key | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://your-cloud-gateway.onrender.com` | The public URL of your deployed Render Cloud Gateway |

*Note: If your Render backend is not yet deployed, you can leave this empty initially or point to your placeholder and update it after backend deployment with an automatic redeploy.*

---

## 4. Deploy & Verify

1. Click **Deploy**.
2. Vercel will run `npm run build` and output your live production URL (e.g. `https://jarvis-xxxxx.vercel.app`).
3. Open the URL on:
   - Your PC browser (Chrome / Edge / Firefox)
   - Your smartphone browser (Android Chrome / iOS Safari)
4. Verify PWA installation prompt ("Install J.A.R.V.I.S.") appears in browser address bar.
