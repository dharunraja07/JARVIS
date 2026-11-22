# J.A.R.V.I.S. Windows Host Companion Setup

The Windows Local Companion connects your physical computer's CPU, RAM, Disk, and Battery hardware telemetry directly to J.A.R.V.I.S. Cloud Gateway.

---

## 1. Local Configuration

Create or update `.env.local` in `D:\jarvis-agent`:

```env
JARVIS_CLOUD_URL=https://your-cloud-gateway.onrender.com
JARVIS_DEVICE_SECRET=your-paired-device-secret-configured-on-render
JARVIS_DEVICE_ID=windows-companion
JARVIS_COMPANION_PORT=8001
```

---

## 2. Running Manually

To run the companion in an interactive terminal:

```powershell
uv run python src/windows_companion.py
```

Expected output:
```
[INFO] jarvis.companion_service: Starting JARVIS Windows Companion on localhost:8001
[INFO] jarvis.companion_service: Heartbeat loop started targeting Cloud Gateway: https://.../api/companion/heartbeat
```

---

## 3. Automatic Background Startup on Windows Boot

We have provided an automated script that registers a silent background task in **Windows Task Scheduler** so the companion starts automatically whenever you log into Windows:

1. Open PowerShell as Administrator.
2. Run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File deployment\windows\register_task.ps1
   ```
3. The task `JARVIS_Windows_Companion` is now registered and will run invisibly in the background.

To stop or remove the scheduled task:
```powershell
Unregister-ScheduledTask -TaskName "JARVIS_Windows_Companion" -Confirm:$false
```
