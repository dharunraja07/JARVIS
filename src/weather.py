import json
import urllib.parse
import urllib.request
from urllib.error import URLError, HTTPError


WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def fetch_json(url: str) -> dict:
    """Fetch JSON data from an API."""
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "JARVIS-Personal-Assistant/1.0"}
    )

    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def get_coordinates(city: str) -> dict:
    """Find a city's latitude and longitude."""

    if not city or not city.strip():
        raise ValueError("Please provide a city name.")

    params = urllib.parse.urlencode({
        "name": city.strip(),
        "count": 1,
        "language": "en",
        "format": "json"
    })

    url = f"https://geocoding-api.open-meteo.com/v1/search?{params}"
    data = fetch_json(url)

    results = data.get("results", [])

    if not results:
        raise ValueError(f"I couldn't find the location: {city}")

    location = results[0]

    return {
        "name": location.get("name", city),
        "admin": location.get("admin1", ""),
        "country": location.get("country", ""),
        "latitude": location["latitude"],
        "longitude": location["longitude"],
    }


def get_current_weather(city: str) -> dict:
    """Get current weather and today's forecast for a city."""

    location = get_coordinates(city)

    params = urllib.parse.urlencode({
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "current": (
            "temperature_2m,relative_humidity_2m,"
            "apparent_temperature,precipitation,"
            "weather_code,wind_speed_10m"
        ),
        "daily": (
            "temperature_2m_max,temperature_2m_min,"
            "precipitation_probability_max"
        ),
        "timezone": "auto",
        "forecast_days": 1,
    })

    url = f"https://api.open-meteo.com/v1/forecast?{params}"
    data = fetch_json(url)

    current = data.get("current", {})
    daily = data.get("daily", {})

    code = current.get("weather_code")

    return {
        "location": location["name"],
        "region": location["admin"],
        "country": location["country"],
        "temperature": current.get("temperature_2m"),
        "feels_like": current.get("apparent_temperature"),
        "humidity": current.get("relative_humidity_2m"),
        "condition": WEATHER_CODES.get(code, "Unknown conditions"),
        "wind_speed": current.get("wind_speed_10m"),
        "precipitation": current.get("precipitation"),
        "max_temperature": (
            daily.get("temperature_2m_max", [None])[0]
        ),
        "min_temperature": (
            daily.get("temperature_2m_min", [None])[0]
        ),
        "rain_probability": (
            daily.get("precipitation_probability_max", [None])[0]
        ),
        "local_time": current.get("time"),
        "timezone": data.get("timezone"),
    }


def format_weather(city: str) -> str:
    """Return a readable weather report."""

    try:
        weather = get_current_weather(city)

        location_parts = [
            weather["location"],
            weather["region"],
            weather["country"],
        ]
        location_name = ", ".join(
            part for part in location_parts if part
        )

        return (
            f"Weather report for {location_name}\n"
            f"Condition: {weather['condition']}\n"
            f"Temperature: {weather['temperature']}°C\n"
            f"Feels like: {weather['feels_like']}°C\n"
            f"Humidity: {weather['humidity']}%\n"
            f"Wind speed: {weather['wind_speed']} km/h\n"
            f"Precipitation: {weather['precipitation']} mm\n"
            f"Today's high: {weather['max_temperature']}°C\n"
            f"Today's low: {weather['min_temperature']}°C\n"
            f"Rain probability: {weather['rain_probability']}%\n"
            f"Local time: {weather['local_time']}\n"
            f"Timezone: {weather['timezone']}"
        )

    except (ValueError, HTTPError, URLError, TimeoutError) as error:
        return f"Weather service error: {error}"

    except Exception as error:
        return f"Unexpected weather error: {error}"


if __name__ == "__main__":
    city = input("Enter city name: ").strip()
    print("\n" + format_weather(city))