"""
JARVIS Windows Local Companion Service
Runs locally on Windows host:
- Monitors CPU, RAM, Disk, and Battery telemetry via psutil
- Dispatches secure authenticated heartbeats to JARVIS Cloud Gateway
- Exposes authenticated local loopback API (http://127.0.0.1:8001) for local desktop clients
"""

import asyncio
from datetime import datetime, timezone
import json
import logging
import os
import platform
from pathlib import Path
import urllib.request
import urllib.error
from aiohttp import web
from dotenv import load_dotenv

import sys
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

load_dotenv(BASE_DIR.parent / ".env.local")
load_dotenv(BASE_DIR.parent / ".env")

import system_monitor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("jarvis.companion_service")

CLOUD_URL = os.getenv("JARVIS_CLOUD_URL", "http://127.0.0.1:8000")
DEVICE_SECRET = os.getenv("JARVIS_DEVICE_SECRET", "jarvis-paired-device-secret-42")
DEVICE_ID = os.getenv("JARVIS_DEVICE_ID", "windows-companion")
LOCAL_PORT = int(os.getenv("JARVIS_COMPANION_PORT", "8001"))


def collect_current_telemetry() -> dict:
    """Collect real Windows hardware metrics using psutil and system_monitor."""
    return {
        "device_id": DEVICE_ID,
        "hostname": platform.node(),
        "cpu": system_monitor.get_cpu_info(),
        "memory": system_monitor.get_memory_info(),
        "disk": system_monitor.get_disk_info(),
        "battery": system_monitor.get_battery_info(),
        "os": {
            "platform": platform.system(),
            "release": platform.release(),
            "arch": platform.machine(),
            "hostname": platform.node(),
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================================
# CLOUD HEARTBEAT DISPATCHER
# ============================================================================
async def heartbeat_loop():
    """Periodically post telemetry to the central Cloud Gateway."""
    endpoint = f"{CLOUD_URL}/api/companion/heartbeat"
    logger.info("Heartbeat loop started targeting Cloud Gateway: %s", endpoint)

    while True:
        try:
            telemetry = await asyncio.to_thread(collect_current_telemetry)
            payload = json.dumps(telemetry).encode("utf-8")

            req = urllib.request.Request(
                endpoint,
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-JARVIS-DEVICE-SECRET": DEVICE_SECRET,
                    "User-Agent": "JARVIS-Windows-Companion/1.0",
                },
                method="POST",
            )

            def send_req():
                with urllib.request.urlopen(req, timeout=4) as resp:
                    return resp.status

            status = await asyncio.to_thread(send_req)
            if status == 200:
                logger.debug("Heartbeat acknowledged by cloud.")
        except urllib.error.URLError as e:
            logger.debug("Cloud gateway heartbeat failed (waiting for cloud): %s", e)
        except Exception as e:
            logger.debug("Heartbeat error: %s", e)

        await asyncio.sleep(4)


# ============================================================================
# LOCAL AUTHENTICATED LOOPBACK API
# ============================================================================
async def handle_local_telemetry(request: web.Request) -> web.Response:
    """Local authenticated telemetry endpoint for Electron or local tools."""
    secret = request.headers.get("X-JARVIS-DEVICE-SECRET", "")
    # Allow localhost access if secret matches or from local loopback
    remote = request.remote
    if remote not in ("127.0.0.1", "::1") and secret != DEVICE_SECRET:
        return web.json_response({"error": "Unauthorized remote access."}, status=401)

    telemetry = await asyncio.to_thread(collect_current_telemetry)
    return web.json_response(telemetry)


async def handle_local_health(request: web.Request) -> web.Response:
    return web.json_response({
        "status": "online",
        "service": "JARVIS Local Windows Companion",
        "device_id": DEVICE_ID,
        "cloud_target": CLOUD_URL,
    })


def create_local_companion_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/health", handle_local_health)
    app.router.add_get("/telemetry", handle_local_telemetry)
    return app


async def main():
    logger.info("Starting JARVIS Windows Companion on localhost:%d", LOCAL_PORT)
    app = create_local_companion_app()
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", LOCAL_PORT)
    await site.start()

    # Start background heartbeat dispatch task
    asyncio.create_task(heartbeat_loop())

    # Keep running
    try:
        while True:
            await asyncio.sleep(3600)
    except asyncio.CancelledError:
        pass
    finally:
        await runner.cleanup()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Windows Companion stopped cleanly.")
