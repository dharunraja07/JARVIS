import sys
from pathlib import Path
from unittest.mock import patch
import pytest
from aiohttp.test_utils import AioHTTPTestCase

# Add src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from companion_server import create_app


class TestCompanionAPI(AioHTTPTestCase):
    async def get_application(self):
        return create_app()

    async def test_health_endpoint(self):
        resp = await self.client.request("GET", "/api/health")
        assert resp.status == 200
        data = await resp.json()
        assert data["status"] == "online"
        assert "service" in data
        assert data["livekit_configured"] is True

    async def test_livekit_token_generation(self):
        resp = await self.client.request("GET", "/api/livekit/token?room=test-room&identity=test-user")
        assert resp.status == 200
        data = await resp.json()
        assert "token" in data
        assert len(data["token"]) > 50
        assert data["room"] == "test-room"
        assert data["identity"] == "test-user"
        assert "serverUrl" in data

    async def test_memories_crud_lifecycle(self):
        # 1. Get existing memories
        resp = await self.client.request("GET", "/api/memories")
        assert resp.status == 200
        initial_memories = await resp.json()
        assert isinstance(initial_memories, list)

        # 2. Create new memory
        post_resp = await self.client.request(
            "POST",
            "/api/memories",
            json={"category": "Projects", "content": "Pytest automated integration test memory."}
        )
        assert post_resp.status == 201
        created = await post_resp.json()
        assert created["category"] == "Projects"
        assert created["content"] == "Pytest automated integration test memory."
        mem_id = created["id"]

        # 3. Verify in search
        search_resp = await self.client.request("GET", "/api/memories?q=automated")
        assert search_resp.status == 200
        search_results = await search_resp.json()
        assert any(m["id"] == mem_id for m in search_results)

        # 4. Delete the test memory
        del_resp = await self.client.request("DELETE", f"/api/memories/{mem_id}")
        assert del_resp.status == 200
        del_data = await del_resp.json()
        assert del_data["success"] is True
        assert del_data["deleted_id"] == mem_id

    async def test_system_metrics_endpoint(self):
        resp = await self.client.request("GET", "/api/system")
        assert resp.status == 200
        data = await resp.json()
        assert "cpu" in data
        assert "memory" in data
        assert "disk" in data
        assert "battery" in data
        assert "os" in data
        assert data["cpu"]["logical_processors"] > 0
        assert data["memory"]["total_gb"] > 0

    async def test_weather_endpoint(self):
        mock_weather = {
            "location": "London",
            "region": "City of London",
            "country": "United Kingdom",
            "temperature": 12.5,
            "feels_like": 11.0,
            "humidity": 75,
            "condition": "Mainly clear",
            "wind_speed": 14.0,
            "precipitation": 0.0,
            "max_temperature": 15.0,
            "min_temperature": 9.0,
            "rain_probability": 10,
            "local_time": "12:00",
            "timezone": "Europe/London",
        }
        with patch("companion_server.weather.get_current_weather", return_value=mock_weather):
            resp = await self.client.request("GET", "/api/weather?city=London")
            assert resp.status == 200
            data = await resp.json()
            assert data["location"] == "London"
            assert data["temperature"] == 12.5

    async def test_news_endpoint(self):
        resp = await self.client.request("GET", "/api/news?category=technology&limit=2")
        assert resp.status == 200
        items = await resp.json()
        assert isinstance(items, list)
        if len(items) > 0:
            assert "title" in items[0]

    async def test_currency_endpoint(self):
        mock_rate = {"base": "USD", "quote": "INR", "rate": 86.5, "date": "2026-11-21"}
        with patch("companion_server.currency.get_exchange_rate", return_value=mock_rate):
            resp = await self.client.request("GET", "/api/currency?amount=50&from=USD&to=INR")
            assert resp.status == 200
            data = await resp.json()
            assert data["from"] == "USD"
            assert data["to"] == "INR"
            assert data["amount"] == 50
            assert data["result"] == 4325.0
            assert data["rate"] == 86.5

    async def test_time_endpoint(self):
        resp = await self.client.request("GET", "/api/time?timezone=Asia/Kolkata")
        assert resp.status == 200
        data = await resp.json()
        assert "report" in data
        assert "Current Time:" in data["report"]
