import sys
from pathlib import Path
from unittest.mock import patch

from aiohttp.test_utils import AioHTTPTestCase

# Add src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from cloud_server import create_cloud_app


class TestCloudAndMultiDeviceAPI(AioHTTPTestCase):
    async def get_application(self):
        return create_cloud_app()

    async def test_health_endpoint(self):
        resp = await self.client.request("GET", "/api/health")
        assert resp.status == 200
        data = await resp.json()
        assert data["status"] == "online"
        assert "service" in data
        assert data["livekit_configured"] is True

    async def test_liveness_and_readiness_probes(self):
        # Liveness
        live_resp = await self.client.request("GET", "/api/health/liveness")
        assert live_resp.status == 200
        live_data = await live_resp.json()
        assert live_data["status"] == "alive"

        # Readiness
        ready_resp = await self.client.request("GET", "/api/health/readiness")
        assert ready_resp.status == 200
        ready_data = await ready_resp.json()
        assert ready_data["status"] == "ready"
        assert ready_data["database"] == "healthy"

    async def test_auth_login_and_verify(self):
        # 1. Login with valid master key
        login_resp = await self.client.request(
            "POST",
            "/api/auth/login",
            json={"key": "jarvis-master-key-2026", "device_type": "android"},
        )
        assert login_resp.status == 200
        login_data = await login_resp.json()
        assert login_data["authenticated"] is True
        token = login_data["token"]
        assert token.startswith("jarvis-session-")

        # 2. Verify token
        verify_resp = await self.client.request(
            "GET", "/api/auth/verify", headers={"Authorization": f"Bearer {token}"}
        )
        assert verify_resp.status == 200
        verify_data = await verify_resp.json()
        assert verify_data["valid"] is True

    async def test_multi_device_token_generation(self):
        # Generate token for Windows device
        win_resp = await self.client.request(
            "GET",
            "/api/livekit/token?room=collab-room",
            headers={"X-JARVIS-CLIENT-DEVICE": "windows"},
        )
        assert win_resp.status == 200
        win_data = await win_resp.json()
        assert "token" in win_data
        assert "windows" in win_data["identity"]

        # Generate token for Android device in same room
        droid_resp = await self.client.request(
            "GET",
            "/api/livekit/token?room=collab-room",
            headers={"X-JARVIS-CLIENT-DEVICE": "android"},
        )
        assert droid_resp.status == 200
        droid_data = await droid_resp.json()
        assert "token" in droid_data
        assert "android" in droid_data["identity"]

        # Identities must be distinct to prevent collision/dropouts
        assert win_data["identity"] != droid_data["identity"]
        assert win_data["room"] == droid_data["room"]

    async def test_multi_device_memory_synchronization(self):
        """
        Verify multi-device memory requirement:
        1. Save memory simulating Windows client.
        2. Retrieve memory simulating Android client.
        3. Delete memory simulating Web client.
        4. Verify deletion on Windows.
        """
        test_content = "Multi-device test: Quantum computing algorithms."

        # 1. Save on Windows
        save_resp = await self.client.request(
            "POST",
            "/api/memories",
            headers={"X-JARVIS-CLIENT-DEVICE": "windows"},
            json={"category": "Education", "content": test_content},
        )
        assert save_resp.status == 201
        created_mem = await save_resp.json()
        mem_id = created_mem["id"]

        # 2. Retrieve on Android
        droid_resp = await self.client.request(
            "GET",
            f"/api/memories?q={test_content}",
            headers={"X-JARVIS-CLIENT-DEVICE": "android"},
        )
        assert droid_resp.status == 200
        droid_memories = await droid_resp.json()
        matching = [m for m in droid_memories if m["id"] == mem_id]
        assert len(matching) == 1
        assert matching[0]["content"] == test_content

        # 3. Delete from Web client
        del_resp = await self.client.request(
            "DELETE",
            f"/api/memories/{mem_id}",
            headers={"X-JARVIS-CLIENT-DEVICE": "web"},
        )
        assert del_resp.status == 200
        del_data = await del_resp.json()
        assert del_data["success"] is True

        # 4. Verify deletion on Windows
        win_verify = await self.client.request(
            "GET", "/api/memories", headers={"X-JARVIS-CLIENT-DEVICE": "windows"}
        )
        assert win_verify.status == 200
        all_mems = await win_verify.json()
        assert not any(m["id"] == mem_id for m in all_mems)

    async def test_windows_companion_pairing_and_telemetry_relay(self):
        """Test Windows companion heartbeat submission and relay to clients."""
        mock_telemetry = {
            "device_id": "windows-companion",
            "hostname": "JARVIS-LAPTOP-WIN11",
            "cpu": {
                "processor": "Intel i7-13700H",
                "usage": 14.2,
                "cores": 8,
                "logical_processors": 16,
            },
            "memory": {
                "total_gb": 16.0,
                "used_gb": 7.5,
                "available_gb": 8.5,
                "usage_percent": 46.8,
            },
            "disk": {
                "total_gb": 512.0,
                "used_gb": 220.0,
                "free_gb": 292.0,
                "usage_percent": 43.0,
            },
            "battery": {
                "available": True,
                "percentage": 92,
                "plugged_in": True,
                "status": "Charging",
            },
            "os": {
                "platform": "Windows",
                "release": "11 Pro",
                "arch": "AMD64",
                "hostname": "JARVIS-LAPTOP-WIN11",
            },
        }

        # 1. Reject unauthorized heartbeat
        unauth_resp = await self.client.request(
            "POST",
            "/api/companion/heartbeat",
            headers={"X-JARVIS-DEVICE-SECRET": "wrong-secret"},
            json=mock_telemetry,
        )
        assert unauth_resp.status == 401

        # 2. Accept authenticated heartbeat
        auth_resp = await self.client.request(
            "POST",
            "/api/companion/heartbeat",
            headers={"X-JARVIS-DEVICE-SECRET": "jarvis-paired-device-secret-42"},
            json=mock_telemetry,
        )
        assert auth_resp.status == 200
        auth_data = await auth_resp.json()
        assert auth_data["acknowledged"] is True

        # 3. Client on Android queries /api/system and receives relayed Windows telemetry!
        client_resp = await self.client.request(
            "GET",
            "/api/system?device_id=windows-companion",
            headers={"X-JARVIS-CLIENT-DEVICE": "android"},
        )
        assert client_resp.status == 200
        client_data = await client_resp.json()
        assert client_data["online"] is True
        assert client_data["cpu"]["processor"] == "Intel i7-13700H"
        assert client_data["cpu"]["usage"] == 14.2
        assert client_data["battery"]["percentage"] == 92

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
        with patch(
            "cloud_server.weather.get_current_weather", return_value=mock_weather
        ):
            resp = await self.client.request("GET", "/api/weather?city=London")
            assert resp.status == 200
            data = await resp.json()
            assert data["location"] == "London"

    async def test_currency_endpoint(self):
        mock_rate = {"base": "USD", "quote": "INR", "rate": 86.5, "date": "2026-11-21"}
        with patch("cloud_server.currency.get_exchange_rate", return_value=mock_rate):
            resp = await self.client.request(
                "GET", "/api/currency?amount=50&from=USD&to=INR"
            )
            assert resp.status == 200
            data = await resp.json()
            assert data["rate"] == 86.5
            assert data["result"] == 4325.0

    async def test_time_endpoint(self):
        resp = await self.client.request("GET", "/api/time?timezone=Asia/Kolkata")
        assert resp.status == 200
        data = await resp.json()
        assert "report" in data
