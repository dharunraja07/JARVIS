import type { UserPreferences } from '../types';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'English',
  autoSpeak: true,
  voiceSpeed: 1.0,
  livekitServerUrl: '',
  livekitToken: '',
  companionApiUrl: 'http://127.0.0.1:8000',
  lowPowerMode: false,
  soundEffects: true,
};

export const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
];

export const POPULAR_TIMEZONES = [
  { id: 'Asia/Kolkata', name: 'India Standard Time (IST)', offset: 'UTC+5:30' },
  { id: 'UTC', name: 'Coordinated Universal Time (UTC)', offset: 'UTC+0:00' },
  { id: 'America/New_York', name: 'New York (EST/EDT)', offset: 'UTC-5:00' },
  { id: 'America/Los_Angeles', name: 'Los Angeles (PST/PDT)', offset: 'UTC-8:00' },
  { id: 'Europe/London', name: 'London (GMT/BST)', offset: 'UTC+0:00' },
  { id: 'Asia/Tokyo', name: 'Tokyo (JST)', offset: 'UTC+9:00' },
  { id: 'Asia/Dubai', name: 'Dubai (GST)', offset: 'UTC+4:00' },
  { id: 'Australia/Sydney', name: 'Sydney (AEST)', offset: 'UTC+10:00' },
];

export const NEWS_CATEGORIES = [
  { id: 'technology', label: 'Technology' },
  { id: 'india', label: 'India' },
  { id: 'world', label: 'World' },
  { id: 'business', label: 'Business' },
  { id: 'science', label: 'Science & Space' },
  { id: 'ai', label: 'Artificial Intelligence' },
];
