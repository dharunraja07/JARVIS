# JARVIS Multi-Device Deployment Architecture

This document specifies the multi-platform deployment targets for the JARVIS AI Assistant.

---

## 1. Web & Cloud Deployment (Vercel / Cloudflare Pages / Static CDN)

The frontend is built as a production-grade Single-Page Application (SPA) with Progressive Web App (PWA) support.

### Build Artifacts:
- Root: `frontend/dist/`
- SPA Routing: `frontend/vercel.json` rewrites all requests to `/index.html`.
- PWA Manifest: `frontend/public/manifest.json`.
- Offline Shell Service Worker: `frontend/public/sw.js`.

### Deployment Steps:
```bash
cd frontend
npm run build
vercel deploy --prod
```

### Environment Configuration:
Set `VITE_COMPANION_API_URL` to your production companion API or default to `/api` proxy.

---

## 2. Windows Desktop Application (Electron)

The desktop application wraps the production web build and communicates directly with the local Windows companion process (`src/companion_server.py`) over authenticated localhost loopback (`127.0.0.1:8000`).

### Architecture:
```
+-------------------------------------------------------+
|  Electron Main Process (Node.js)                      |
|  - Spawns / monitors Python companion server          |
|  - Manages native window & system tray icon           |
|  - Exposes safe IPC bridge via contextIsolation       |
+---------------------------+---------------------------+
                            | preload.cjs (contextBridge)
+---------------------------v---------------------------+
|  JARVIS React Frontend (Chromium Renderer)            |
|  - Holographic UI & Voice Controls                    |
|  - Communicates with localhost:8000 REST APIs         |
|  - Connects to LiveKit Cloud via WebRTC               |
+-------------------------------------------------------+
```

### Pre-configured Electron Entry Point (`desktop/main.cjs`):
```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#070B14',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
}

app.whenReady().then(createWindow);
```

---

## 3. Android Mobile Application (Capacitor)

Capacitor wraps the production web assets into a native Android Studio project with WebRTC audio permissions.

### Android Permissions Required (`AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Capacitor Configuration (`capacitor.config.json`):
```json
{
  "appId": "io.jarvis.assistant",
  "appName": "JARVIS",
  "webDir": "frontend/dist",
  "bundledWebRuntime": false,
  "server": {
    "cleartext": true
  }
}
```

### Build Workflow:
```bash
cd frontend
npm run build
npx cap add android
npx cap copy
npx cap open android
```
