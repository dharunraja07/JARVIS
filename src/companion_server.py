"""
JARVIS Companion Backend & LiveKit Token Gateway Server
Provides production REST APIs for:
- LiveKit token generation (keeping API secrets exclusively server-side)
- Persistent SQLite memory CRUD
- Real-time PC hardware monitoring
- AI tools: Weather, News, Currency, Web Search, World Time
"""

import asyncio
import logging
import os
import platform
import uuid
from pathlib import Path
from aiohttp import web
from dotenv import load_dotenv

# Ensure backend modules can be imported
import sys
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Load server environment variables
load_dotenv(BASE_DIR.parent / ".env.local")
load_dotenv(BASE_DIR.parent / ".env")

import currency
import memory_manager
import news
import system_monitor
import time_info
import weather
import web_search
from livekit.api import AccessToken, VideoGrants

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("jarvis.companion")


# ============================================================================
# CORS MIDDLEWARE
# ============================================================================
@web.middleware
async def cors_middleware(request: web.Request, handler):
    if request.method == "OPTIONS":
        response = web.Response(status=200)
    else:
        try:
            response = await handler(request)
        except web.HTTPException as ex:
            response = ex
        except Exception as e:
            logger.exception("Internal error handling %s: %s", request.path, e)
            response = web.json_response({"error": str(e)}, status=500)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = (
        "Content-Type, Authorization, X-Requested-With, Accept"
    )
    return response


# ============================================================================
# HANDLERS
# ============================================================================
async def handle_health(request: web.Request) -> web.Response:
    """Service health and diagnostics check."""
    return web.json_response({
        "status": "online",
        "service": "J.A.R.V.I.S. Companion API & LiveKit Gateway",
        "version": "4.2.0",
        "platform": platform.platform(),
        "livekit_configured": bool(os.getenv("LIVEKIT_API_KEY") and os.getenv("LIVEKIT_API_SECRET")),
    })


async def handle_livekit_token(request: web.Request) -> web.Response:
    """Generate a secure, short-lived LiveKit access token.

    Never exposes API secrets to client browsers or mobile devices.
    """
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    server_url = os.getenv("LIVEKIT_URL", "wss://jarvis.livekit.cloud")

    if not api_key or not api_secret:
        return web.json_response(
            {"error": "LiveKit API key or secret not configured on backend server."},
            status=500,
        )

    # Extract room and identity from query or body
    room_name = request.query.get("room")
    identity = request.query.get("identity")
    name = request.query.get("name", "User")

    if request.method == "POST" and request.can_read_body:
        try:
            data = await request.json()
            room_name = data.get("room", room_name)
            identity = data.get("identity", identity)
            name = data.get("name", name)
        except Exception:
            pass

    if not room_name:
        room_name = "jarvis-room"
    if not identity:
        identity = f"user-{uuid.uuid4().hex[:8]}"

    # Grant voice and room join permissions
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
        .with_name(name)
        .with_grants(grants)
        .to_jwt()
    )

    logger.info("Generated LiveKit access token for identity: %s in room: %s", identity, room_name)

    return web.json_response({
        "serverUrl": server_url,
        "token": token,
        "room": room_name,
        "identity": identity,
    })


async def handle_get_memories(request: web.Request) -> web.Response:
    """Retrieve real memories from SQLite database."""
    query = request.query.get("q", "").strip()

    def fetch():
        if query:
            return memory_manager.search_memories(query)
        return memory_manager.get_all_memories()

    memories = await asyncio.to_thread(fetch)
    return web.json_response(memories)


async def handle_create_memory(request: web.Request) -> web.Response:
    """Save a new memory to persistent SQLite database."""
    try:
        data = await request.json()
    except Exception:
        return web.json_response({"error": "Invalid JSON body."}, status=400)

    category = data.get("category", "").strip()
    content = data.get("content", "").strip()

    if not category or not content:
        return web.json_response({"error": "Category and content are required."}, status=400)

    def save():
        mem_id = memory_manager.save_memory(category, content)
        return memory_manager.get_memory_by_id(mem_id)

    try:
        memory = await asyncio.to_thread(save)
        return web.json_response(memory, status=201)
    except Exception as e:
        logger.error("Failed to save memory: %s", e)
        return web.json_response({"error": str(e)}, status=500)


async def handle_delete_memory(request: web.Request) -> web.Response:
    """Delete a memory from SQLite by ID."""
    try:
        memory_id = int(request.match_info["id"])
    except ValueError:
        return web.json_response({"error": "Invalid memory ID."}, status=400)

    def delete():
        return memory_manager.delete_memory(memory_id)

    success = await asyncio.to_thread(delete)
    if success:
        return web.json_response({"success": True, "deleted_id": memory_id})
    return web.json_response({"error": f"Memory {memory_id} not found."}, status=404)


async def handle_get_system(request: web.Request) -> web.Response:
    """Retrieve actual host machine telemetry from psutil."""
    def get_metrics():
        cpu = system_monitor.get_cpu_info()
        memory = system_monitor.get_memory_info()
        disk = system_monitor.get_disk_info()
        battery = system_monitor.get_battery_info()

        return {
            "cpu": cpu,
            "memory": memory,
            "disk": disk,
            "battery": battery,
            "os": {
                "platform": platform.system(),
                "release": platform.release(),
                "arch": platform.machine(),
                "hostname": platform.node(),
            },
            "timestamp": system_monitor.datetime.now().isoformat(),
        }

    try:
        metrics = await asyncio.to_thread(get_metrics)
        return web.json_response(metrics)
    except Exception as e:
        logger.error("Failed to read system telemetry: %s", e)
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_weather(request: web.Request) -> web.Response:
    """Retrieve actual weather for a city via Open-Meteo."""
    city = request.query.get("city", "").strip()
    if not city:
        return web.json_response({"error": "City parameter is required."}, status=400)

    try:
        data = await asyncio.to_thread(weather.get_current_weather, city)
        return web.json_response(data)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_news(request: web.Request) -> web.Response:
    """Retrieve actual news headlines via RSS feeds."""
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
    """Calculate actual currency exchange via Frankfurter API."""
    from_curr = request.query.get("from", "USD").strip().upper()
    to_curr = request.query.get("to", "INR").strip().upper()
    try:
        amount = float(request.query.get("amount", 100))
    except ValueError:
        return web.json_response({"error": "Invalid amount number."}, status=400)

    try:
        data = await asyncio.to_thread(currency.get_exchange_rate, from_curr, to_curr)
        rate = data.get("rate", 1.0)
        result = round(amount * rate, 2)
        return web.json_response({
            "from": from_curr,
            "to": to_curr,
            "amount": amount,
            "rate": rate,
            "result": result,
            "date": data.get("date", ""),
        })
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_search(request: web.Request) -> web.Response:
    """Perform real web search via DDGS."""
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
        logger.error("Web search failed: %s", e)
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_time(request: web.Request) -> web.Response:
    """Retrieve formatted time report for a timezone."""
    tz = request.query.get("timezone", "").strip()
    try:
        report = await asyncio.to_thread(time_info.get_time_report, tz)
        return web.json_response({"report": report})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


# ============================================================================
# APP INITIALIZATION
# ============================================================================
def create_app() -> web.Application:
    app = web.Application(middlewares=[cors_middleware])

    # Routes
    app.router.add_get("/api/health", handle_health)
    app.router.add_get("/api/livekit/token", handle_livekit_token)
    app.router.add_post("/api/livekit/token", handle_livekit_token)
    app.router.add_get("/api/memories", handle_get_memories)
    app.router.add_post("/api/memories", handle_create_memory)
    app.router.add_delete("/api/memories/{id}", handle_delete_memory)
    app.router.add_get("/api/system", handle_get_system)
    app.router.add_get("/api/weather", handle_get_weather)
    app.router.add_get("/api/news", handle_get_news)
    app.router.add_get("/api/currency", handle_get_currency)
    app.router.add_get("/api/search", handle_get_search)
    app.router.add_get("/api/time", handle_get_time)

    return app


if __name__ == "__main__":
    host = os.getenv("JARVIS_HOST", "127.0.0.1")
    port = int(os.getenv("JARVIS_PORT", "8000"))
    logger.info("Starting JARVIS Companion API on http://%s:%d", host, port)
    app = create_app()
    web.run_app(app, host=host, port=port)
