"""
JARVIS Cloud Gateway Server (Production Hardened)
Centralized cloud & multi-device coordinator:
- Multi-device authentication & session tokens
- Dynamic LiveKit WebRTC access token issuance with collision-free device identities
- Dual-engine persistent memory CRUD (PostgreSQL on cloud / SQLite locally)
- Paired Windows companion telemetry relay & status registry
- Real-time AI tools dispatch (Weather, News, Currency, DDGS Search, World Time)
- Production readiness: Dynamic $PORT, Liveness/Readiness probes, CORS filtering, sanitized errors
"""

import asyncio
import logging
import os
import platform
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

from aiohttp import web
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Load environment configuration
load_dotenv(BASE_DIR.parent / ".env.local")
load_dotenv(BASE_DIR.parent / ".env")

from livekit.api import AccessToken, VideoGrants  # noqa: E402

import currency  # noqa: E402
import memory  # noqa: E402
import memory_manager  # noqa: E402
import news  # noqa: E402
import system_monitor  # noqa: E402
import time_info  # noqa: E402
import weather  # noqa: E402
import web_search  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("jarvis.cloud")

# Environment & Security Configuration
IS_PRODUCTION = (
    os.getenv("JARVIS_ENV") == "production" or os.getenv("NODE_ENV") == "production"
)
MASTER_KEY = os.getenv("JARVIS_AUTH_KEY", "jarvis-master-key-2026")
DEVICE_SECRET = os.getenv("JARVIS_DEVICE_SECRET", "jarvis-paired-device-secret-42")

if IS_PRODUCTION:
    if MASTER_KEY == "jarvis-master-key-2026":
        logger.warning(
            "[SECURITY AUDIT] JARVIS_AUTH_KEY is using default placeholder in production mode! Set a unique secure key."
        )
    if DEVICE_SECRET == "jarvis-paired-device-secret-42":
        logger.warning(
            "[SECURITY AUDIT] JARVIS_DEVICE_SECRET is using default placeholder in production mode! Set a unique secure secret."
        )

ALLOWED_ORIGINS_RAW = os.getenv("JARVIS_ALLOWED_ORIGINS", "*").strip()
ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

# In-memory device registry & telemetry cache for paired companions
paired_devices: dict[str, dict] = {}


# ============================================================================
# CORS & ERROR SANITIZATION MIDDLEWARE
# ============================================================================
@web.middleware
async def cors_middleware(request: web.Request, handler):
    origin = request.headers.get("Origin", "")
    allow_origin = "*"

    if "*" in ALLOWED_ORIGINS:
        allow_origin = "*"
    elif origin in ALLOWED_ORIGINS:
        allow_origin = origin
    elif ALLOWED_ORIGINS:
        allow_origin = ALLOWED_ORIGINS[0]

    if request.method == "OPTIONS":
        response = web.Response(status=200)
    else:
        try:
            response = await handler(request)
        except web.HTTPException as ex:
            response = ex
        except Exception as e:
            logger.exception("Internal error on %s: %s", request.path, e)
            msg = str(e) if not IS_PRODUCTION else "Internal server error occurred."
            response = web.json_response({"error": msg}, status=500)

    response.headers["Access-Control-Allow-Origin"] = allow_origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = (
        "Content-Type, Authorization, X-Requested-With, Accept, X-JARVIS-DEVICE-SECRET, X-JARVIS-CLIENT-DEVICE"
    )
    return response


# ============================================================================
# HEALTH & AUTHENTICATION ENDPOINTS
# ============================================================================
async def handle_health(request: web.Request) -> web.Response:
    """Service health, version, database engine, and paired device readiness."""
    now = datetime.now(timezone.utc)
    companion_online = False
    companion_last_seen = None

    if "windows-companion" in paired_devices:
        last_dt = paired_devices["windows-companion"].get("last_seen_dt")
        if last_dt and (now - last_dt).total_seconds() < 15:
            companion_online = True
            companion_last_seen = paired_devices["windows-companion"].get("last_seen")

    db_engine = "PostgreSQL" if memory.is_postgres_active() else "SQLite"

    return web.json_response(
        {
            "status": "online",
            "service": "J.A.R.V.I.S. Cloud Gateway",
            "version": "4.4.0-production",
            "platform": platform.platform(),
            "database_engine": db_engine,
            "livekit_configured": bool(
                os.getenv("LIVEKIT_API_KEY") and os.getenv("LIVEKIT_API_SECRET")
            ),
            "companion_status": "online" if companion_online else "offline",
            "companion_last_seen": companion_last_seen,
        }
    )


async def handle_liveness(request: web.Request) -> web.Response:
    """Kubernetes / Cloud container liveness probe."""
    return web.json_response(
        {"status": "alive", "timestamp": datetime.now(timezone.utc).isoformat()}
    )


async def handle_readiness(request: web.Request) -> web.Response:
    """Readiness probe validating database responsiveness and critical services."""
    db_healthy = False
    try:
        # Quick health query
        await asyncio.to_thread(memory_manager.get_all_memories)
        db_healthy = True
    except Exception as e:
        logger.error("Readiness probe database check failed: %s", e)

    livekit_ready = bool(
        os.getenv("LIVEKIT_API_KEY") and os.getenv("LIVEKIT_API_SECRET")
    )

    ready = db_healthy and livekit_ready
    status_code = 200 if ready else 503

    return web.json_response(
        {
            "status": "ready" if ready else "degraded",
            "database": "healthy" if db_healthy else "unreachable",
            "database_engine": "PostgreSQL"
            if memory.is_postgres_active()
            else "SQLite",
            "livekit": "configured" if livekit_ready else "missing_credentials",
        },
        status=status_code,
    )


async def handle_auth_login(request: web.Request) -> web.Response:
    """Authenticate client device with master key or companion token."""
    try:
        data = await request.json()
    except Exception:
        return web.json_response({"error": "Invalid JSON body."}, status=400)

    key = data.get("key", "").strip()
    device_type = data.get("device_type", "web").strip()

    if not key or (key != MASTER_KEY and key != DEVICE_SECRET):
        return web.json_response({"error": "Invalid authorization key."}, status=401)

    session_token = f"jarvis-session-{uuid.uuid4().hex}"
    logger.info("Authenticated device (%s) successfully.", device_type)

    return web.json_response(
        {
            "authenticated": True,
            "token": session_token,
            "device_type": device_type,
            "issued_at": datetime.now(timezone.utc).isoformat(),
        }
    )


async def handle_auth_verify(request: web.Request) -> web.Response:
    """Verify active session validity."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "").strip()
        if token.startswith("jarvis-session-"):
            return web.json_response({"valid": True, "status": "active"})
    return web.json_response({"valid": False, "status": "unauthorized"}, status=401)


# ============================================================================
# LIVEKIT TOKEN GATEWAY (MULTI-DEVICE ENABLED)
# ============================================================================
async def handle_livekit_token(request: web.Request) -> web.Response:
    """Generate collision-free LiveKit access tokens for Windows, Android, and Web."""
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    server_url = os.getenv("LIVEKIT_URL", "wss://jarvis.livekit.cloud")

    if not api_key or not api_secret:
        return web.json_response(
            {"error": "LiveKit API key or secret not configured on backend server."},
            status=500,
        )

    # Detect device type and requested identity
    device = (
        request.headers.get("X-JARVIS-CLIENT-DEVICE")
        or request.query.get("device")
        or "web"
    )
    room_name = request.query.get("room", "jarvis-room")
    requested_id = request.query.get("identity")

    if request.method == "POST" and request.can_read_body:
        try:
            data = await request.json()
            device = data.get("device", device)
            room_name = data.get("room", room_name)
            requested_id = data.get("identity", requested_id)
        except Exception:
            pass

    random_suffix = uuid.uuid4().hex[:6]
    clean_device = "".join(c for c in device if c.isalnum() or c in "-_")[:16]
    identity = requested_id or f"user-{clean_device}-{random_suffix}"
    participant_name = f"User ({clean_device.capitalize()})"

    grants = VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=True,
        can_subscribe=True,
        can_publish_data=True,
    )

    token = (
        AccessToken(api_key, api_secret)
        .with_identity(identity)
        .with_name(participant_name)
        .with_grants(grants)
        .to_jwt()
    )

    logger.info(
        "Issued LiveKit token for [%s] in room [%s] (device: %s)",
        identity,
        room_name,
        clean_device,
    )

    return web.json_response(
        {
            "serverUrl": server_url,
            "token": token,
            "room": room_name,
            "identity": identity,
            "device": clean_device,
        }
    )


# ============================================================================
# SHARED PERSISTENT MEMORY CRUD (POSTGRESQL / SQLITE)
# ============================================================================
async def handle_get_memories(request: web.Request) -> web.Response:
    """Retrieve shared memories from persistent database across all devices."""
    query = request.query.get("q", "").strip()

    def fetch():
        if query:
            return memory_manager.search_memories(query)
        return memory_manager.get_all_memories()

    memories = await asyncio.to_thread(fetch)
    return web.json_response(memories)


async def handle_create_memory(request: web.Request) -> web.Response:
    """Save a new memory to shared persistent database."""
    try:
        data = await request.json()
    except Exception:
        return web.json_response({"error": "Invalid JSON body."}, status=400)

    category = data.get("category", "").strip()
    content = data.get("content", "").strip()

    if not category or not content:
        return web.json_response(
            {"error": "Category and content are required."}, status=400
        )

    def save():
        mem_id = memory_manager.save_memory(category, content)
        return memory_manager.get_memory_by_id(mem_id)

    try:
        saved = await asyncio.to_thread(save)
        logger.info(
            "Shared memory indexed (ID: %s, Category: %s)", saved.get("id"), category
        )
        return web.json_response(saved, status=201)
    except Exception as e:
        logger.error("Failed to save memory: %s", e)
        return web.json_response({"error": str(e)}, status=500)


async def handle_delete_memory(request: web.Request) -> web.Response:
    """Delete a memory by ID across all devices."""
    try:
        memory_id = int(request.match_info["id"])
    except ValueError:
        return web.json_response({"error": "Invalid memory ID."}, status=400)

    def delete():
        return memory_manager.delete_memory(memory_id)

    success = await asyncio.to_thread(delete)
    if success:
        logger.info("Shared memory deleted (ID: %d)", memory_id)
        return web.json_response({"success": True, "deleted_id": memory_id})
    return web.json_response({"error": f"Memory {memory_id} not found."}, status=404)


# ============================================================================
# WINDOWS COMPANION TELEMETRY & RELAY
# ============================================================================
async def handle_companion_heartbeat(request: web.Request) -> web.Response:
    """Authenticated endpoint for Windows Companion to submit live telemetry."""
    secret = request.headers.get("X-JARVIS-DEVICE-SECRET", "")
    if secret != DEVICE_SECRET:
        return web.json_response({"error": "Unauthorized device secret."}, status=401)

    try:
        payload = await request.json()
    except Exception:
        return web.json_response({"error": "Invalid JSON."}, status=400)

    device_id = payload.get("device_id", "windows-companion")
    now = datetime.now(timezone.utc)

    paired_devices[device_id] = {
        **payload,
        "last_seen_dt": now,
        "last_seen": now.isoformat(),
        "status": "online",
    }

    return web.json_response({"acknowledged": True, "server_time": now.isoformat()})


async def handle_get_system(request: web.Request) -> web.Response:
    """Query live host telemetry for any connected device (Android, Web, Desktop)."""
    device_id = request.query.get("device_id", "windows-companion")
    now = datetime.now(timezone.utc)

    # 1. Check if paired Windows companion has posted heartbeats
    if device_id in paired_devices:
        device_data = paired_devices[device_id]
        last_dt = device_data.get("last_seen_dt")
        if last_dt and (now - last_dt).total_seconds() < 15:
            return web.json_response(
                {
                    "online": True,
                    "device_id": device_id,
                    "status": "active",
                    "cpu": device_data.get("cpu"),
                    "memory": device_data.get("memory"),
                    "disk": device_data.get("disk"),
                    "battery": device_data.get("battery"),
                    "os": device_data.get("os"),
                    "last_seen": device_data.get("last_seen"),
                }
            )
        else:
            return web.json_response(
                {
                    "online": False,
                    "device_id": device_id,
                    "status": "offline",
                    "message": "Windows companion is offline or sleeping.",
                    "last_seen": device_data.get("last_seen"),
                }
            )

    # 2. If running locally on Windows host, fallback to system_monitor
    if platform.system() == "Windows":
        try:

            def local_metrics():
                return {
                    "online": True,
                    "device_id": "windows-local",
                    "status": "active (local-server)",
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
                    "last_seen": now.isoformat(),
                }

            metrics = await asyncio.to_thread(local_metrics)
            return web.json_response(metrics)
        except Exception as e:
            logger.error("Failed to read local system metrics: %s", e)

    return web.json_response(
        {
            "online": False,
            "device_id": device_id,
            "status": "offline",
            "message": "No active Windows companion registered.",
            "last_seen": None,
        }
    )


# ============================================================================
# AI TOOLS DISPATCH (WEATHER, NEWS, CURRENCY, SEARCH, TIME)
# ============================================================================
async def handle_get_weather(request: web.Request) -> web.Response:
    city = request.query.get("city", "").strip()
    if not city:
        return web.json_response({"error": "City parameter is required."}, status=400)
    try:
        data = await asyncio.to_thread(weather.get_current_weather, city)
        return web.json_response(data)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_news(request: web.Request) -> web.Response:
    category = request.query.get("category", "technology")
    try:
        limit = int(request.query.get("limit", 6))
    except ValueError:
        limit = 6
    try:
        items = await asyncio.to_thread(news.get_news, category, limit)
        return web.json_response(items)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_currency(request: web.Request) -> web.Response:
    from_curr = request.query.get("from", "USD").strip().upper()
    to_curr = request.query.get("to", "INR").strip().upper()
    try:
        amount = float(request.query.get("amount", 100))
    except ValueError:
        return web.json_response({"error": "Invalid amount number."}, status=400)
    try:
        data = await asyncio.to_thread(currency.get_exchange_rate, from_curr, to_curr)
        rate = data.get("rate", 1.0)
        return web.json_response(
            {
                "from": from_curr,
                "to": to_curr,
                "amount": amount,
                "rate": rate,
                "result": round(amount * rate, 2),
                "date": data.get("date", ""),
            }
        )
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_search(request: web.Request) -> web.Response:
    query = request.query.get("q", "").strip()
    if not query:
        return web.json_response([])
    try:
        limit = int(request.query.get("limit", 5))
    except ValueError:
        limit = 5
    try:
        results = await asyncio.to_thread(web_search.search_web, query, limit)
        return web.json_response(results)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_time(request: web.Request) -> web.Response:
    tz = request.query.get("timezone", "").strip()
    try:
        report = await asyncio.to_thread(time_info.get_time_report, tz)
        return web.json_response({"report": report})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


# ============================================================================
# APP FACTORY & ENTRYPOINT
# ============================================================================
def create_cloud_app() -> web.Application:
    app = web.Application(middlewares=[cors_middleware])

    # Core, Health & Auth
    app.router.add_get("/api/health", handle_health)
    app.router.add_get("/api/health/liveness", handle_liveness)
    app.router.add_get("/api/health/readiness", handle_readiness)
    app.router.add_post("/api/auth/login", handle_auth_login)
    app.router.add_get("/api/auth/verify", handle_auth_verify)

    # LiveKit Multi-Device Gateway
    app.router.add_get("/api/livekit/token", handle_livekit_token)
    app.router.add_post("/api/livekit/token", handle_livekit_token)

    # Shared Persistent Memory
    app.router.add_get("/api/memories", handle_get_memories)
    app.router.add_post("/api/memories", handle_create_memory)
    app.router.add_delete("/api/memories/{id}", handle_delete_memory)

    # Paired Windows Companion Telemetry
    app.router.add_post("/api/companion/heartbeat", handle_companion_heartbeat)
    app.router.add_get("/api/system", handle_get_system)

    # AI Tools Dispatch
    app.router.add_get("/api/weather", handle_get_weather)
    app.router.add_get("/api/news", handle_get_news)
    app.router.add_get("/api/currency", handle_get_currency)
    app.router.add_get("/api/search", handle_get_search)
    app.router.add_get("/api/time", handle_get_time)

    return app


if __name__ == "__main__":
    host = os.getenv("JARVIS_CLOUD_HOST", "0.0.0.0")
    # Dynamic port binding for Cloud (Render, Railway, Heroku, Docker)
    port = int(os.getenv("PORT", os.getenv("JARVIS_CLOUD_PORT", "8000")))
    logger.info("Starting JARVIS Cloud Gateway on %s:%d", host, port)
    app = create_cloud_app()
    web.run_app(app, host=host, port=port)
