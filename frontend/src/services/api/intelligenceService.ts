import type { CurrencyConversion, NewsArticle, SearchResult, WeatherData } from '../../types';
import { getApiBaseUrl } from './apiConfig';

// ============================================================================
// WEATHER SERVICE (Uses backend /api/weather with Open-Meteo direct fallback)
// ============================================================================
export async function fetchWeather(city: string): Promise<WeatherData> {
  const cleanCity = city.trim();
  if (!cleanCity) {
    throw new Error('Please enter a city name.');
  }

  // 1. Try backend companion API first
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/weather?city=${encodeURIComponent(cleanCity)}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        city: `${data.location}${data.country ? `, ${data.country}` : ''}`,
        temperature: Math.round(data.temperature),
        condition: data.condition || 'Clear',
        weather_code: 0,
        humidity: data.humidity || 60,
        wind_speed: Math.round(data.wind_speed || 10),
        min_temp: Math.round(data.min_temperature || data.temperature - 4),
        max_temp: Math.round(data.max_temperature || data.temperature + 5),
        precipitation_probability: data.rain_probability || 0,
        timestamp: data.local_time || new Date().toLocaleTimeString(),
      };
    }
  } catch {
    // Companion API unavailable; proceed to direct Open-Meteo API
  }

  // 2. Direct Open-Meteo API (matches backend logic)
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cleanCity
  )}&count=1&language=en&format=json`;

  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) {
    throw new Error(`Failed to locate city: ${cleanCity}`);
  }
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`Location "${cleanCity}" not found. Please verify spelling.`);
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    throw new Error('Failed to retrieve atmospheric telemetry.');
  }
  const data = await weatherRes.json();

  const code = data.current?.weather_code ?? 0;
  const condition = getWeatherCondition(code);

  return {
    city: `${name}${country ? `, ${country}` : ''}`,
    temperature: Math.round(data.current?.temperature_2m ?? 24),
    condition,
    weather_code: code,
    humidity: data.current?.relative_humidity_2m ?? 65,
    wind_speed: Math.round(data.current?.wind_speed_10m ?? 12),
    min_temp: Math.round(data.daily?.temperature_2m_min?.[0] ?? 20),
    max_temp: Math.round(data.daily?.temperature_2m_max?.[0] ?? 29),
    precipitation_probability: data.daily?.precipitation_probability_max?.[0] ?? 10,
    timestamp: new Date().toLocaleTimeString(),
  };
}

function getWeatherCondition(code: number): string {
  const codes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    80: 'Rain showers',
    81: 'Moderate showers',
    82: 'Violent showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
  };
  return codes[code] || 'Clear';
}

// ============================================================================
// CURRENCY SERVICE (Uses backend /api/currency with Frankfurter direct fallback)
// ============================================================================
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<CurrencyConversion> {
  const cleanFrom = from.trim().toUpperCase();
  const cleanTo = to.trim().toUpperCase();

  if (cleanFrom === cleanTo) {
    return {
      from: cleanFrom,
      to: cleanTo,
      amount,
      rate: 1.0,
      result: amount,
      date: new Date().toISOString().split('T')[0],
    };
  }

  // 1. Try backend companion API first
  try {
    const res = await fetch(
      `${getApiBaseUrl()}/api/currency?amount=${amount}&from=${cleanFrom}&to=${cleanTo}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Proceed to direct Frankfurter API
  }

  // 2. Direct Frankfurter API
  const url = `https://api.frankfurter.dev/v2/rate/${cleanFrom}/${cleanTo}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Unable to convert ${cleanFrom} to ${cleanTo}.`);
  }
  const data = await res.json();
  const rate = data.rates?.[cleanTo] ?? 1.0;

  return {
    from: cleanFrom,
    to: cleanTo,
    amount,
    rate,
    result: parseFloat((amount * rate).toFixed(2)),
    date: data.date || new Date().toISOString().split('T')[0],
  };
}

// ============================================================================
// NEWS SERVICE (Calls backend /api/news using real RSS feed parsing)
// ============================================================================
export async function fetchNews(category: string = 'technology'): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/news?category=${encodeURIComponent(category)}&limit=6`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const items = await res.json();
      return items.map((item: { title: string; link: string; published: string; snippet?: string; source?: string }) => ({
        title: item.title,
        source: item.source || 'News Wire',
        link: item.link,
        published: item.published,
        snippet: item.snippet || '',
      }));
    }
  } catch {
    // Companion unreachable
  }

  throw new Error('News feed service unavailable. Ensure JARVIS companion backend is running.');
}

// ============================================================================
// WEB SEARCH SERVICE (Calls backend /api/search using real DDGS)
// ============================================================================
export async function performWebSearch(query: string): Promise<SearchResult[]> {
  const clean = query.trim();
  if (!clean) return [];

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/search?q=${encodeURIComponent(clean)}&limit=5`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        return results.map((r: { title?: string; url?: string; href?: string; snippet?: string; body?: string }) => {
          const url = r.url || r.href || '';
          let domain = 'web';
          try {
            if (url) domain = new URL(url).hostname;
          } catch {
            // ignore
          }
          return {
            title: r.title || clean,
            snippet: r.snippet || r.body || '',
            url,
            domain,
          };
        });
      }
    }
  } catch {
    // Companion unreachable
  }

  throw new Error('Web search service unavailable. Ensure JARVIS companion backend is running.');
}
