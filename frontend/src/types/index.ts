export type ThemeMode = 'dark' | 'light';

export type AssistantState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'
  | 'disconnected';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'system';
  text: string;
  timestamp: string;
  category?: string;
  toolCall?: {
    name: string;
    params?: Record<string, unknown>;
    result?: string;
  };
}

export type MemoryCategory =
  | 'Education'
  | 'Career'
  | 'Projects'
  | 'Preferences'
  | 'Personal';

export interface MemoryItem {
  id: number;
  category: MemoryCategory;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface SystemMetrics {
  cpu: {
    processor: string;
    usage: number;
    cores: number;
    logical_processors: number;
  };
  memory: {
    total_gb: number;
    used_gb: number;
    available_gb: number;
    usage_percent: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    usage_percent: number;
  };
  battery: {
    available: boolean;
    percentage?: number;
    plugged_in?: boolean;
    status: string;
    time_left_seconds?: number;
  };
  os: {
    platform: string;
    release: string;
    arch: string;
    hostname?: string;
  };
  timestamp: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  weather_code: number;
  humidity?: number;
  wind_speed?: number;
  min_temp?: number;
  max_temp?: number;
  precipitation_probability?: number;
  timestamp: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  link: string;
  published: string;
  snippet?: string;
}

export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  rate: number;
  result: number;
  date: string;
}

export interface TimeData {
  timezone: string;
  formatted_time: string;
  formatted_date: string;
  utc_offset: string;
  is_dst?: boolean;
}

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  domain: string;
}

export interface UserPreferences {
  theme: ThemeMode;
  language: 'English' | 'Tamil' | 'Tanglish';
  autoSpeak: boolean;
  voiceSpeed: number;
  livekitServerUrl: string;
  livekitToken: string;
  companionApiUrl: string;
  lowPowerMode: boolean;
  soundEffects: boolean;
}
