import { create } from 'zustand';
import type {
  AssistantState,
  ChatMessage,
  MemoryCategory,
  MemoryItem,
  SystemMetrics,
  ThemeMode,
  UserPreferences,
} from '../types';
import { DEFAULT_PREFERENCES, INITIAL_MEMORIES } from '../utils/constants';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface JarvisStore {
  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Assistant State
  assistantState: AssistantState;
  setAssistantState: (state: AssistantState) => void;
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  currentTranscript: string;
  setCurrentTranscript: (text: string) => void;

  // Chat Messages
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Memories
  memories: MemoryItem[];
  addMemory: (category: MemoryCategory, content: string) => void;
  deleteMemory: (id: number) => void;

  // System Metrics
  systemMetrics: SystemMetrics;
  setSystemMetrics: (metrics: Partial<SystemMetrics>) => void;
  isSystemMonitoring: boolean;
  setIsSystemMonitoring: (monitoring: boolean) => void;

  // User Preferences
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // Notifications
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const getStoredTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem('jarvis-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore
  }
  return 'dark';
};

const getStoredMemories = (): MemoryItem[] => {
  try {
    const saved = localStorage.getItem('jarvis-memories');
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return INITIAL_MEMORIES;
};

const getStoredPreferences = (): UserPreferences => {
  try {
    const saved = localStorage.getItem('jarvis-preferences');
    if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
  } catch {
    // fallback
  }
  return DEFAULT_PREFERENCES;
};

const initialSystemMetrics: SystemMetrics = {
  cpu: {
    processor: 'Intel(R) Core(TM) i7 / i5 Processor (12th-14th Gen)',
    usage: 18.4,
    cores: 8,
    logical_processors: 16,
  },
  memory: {
    total_gb: 16.0,
    used_gb: 7.2,
    available_gb: 8.8,
    usage_percent: 45.0,
  },
  disk: {
    total_gb: 512.0,
    used_gb: 218.4,
    free_gb: 293.6,
    usage_percent: 42.6,
  },
  battery: {
    available: true,
    percentage: 84,
    plugged_in: true,
    status: 'Charging (AC Connected)',
    time_left_seconds: 9600,
  },
  os: {
    platform: 'Windows',
    release: '11 Pro 64-bit',
    arch: 'x64',
    hostname: 'JARVIS-WORKSTATION',
  },
  timestamp: new Date().toISOString(),
};

export const useJarvisStore = create<JarvisStore>((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme) => {
    localStorage.setItem('jarvis-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('jarvis-theme', nextTheme);
      if (nextTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return { theme: nextTheme };
    }),

  assistantState: 'idle',
  setAssistantState: (assistantState) => set({ assistantState }),
  audioLevel: 0,
  setAudioLevel: (audioLevel) => set({ audioLevel }),
  currentTranscript: '',
  setCurrentTranscript: (currentTranscript) => set({ currentTranscript }),

  messages: [
    {
      id: 'init-1',
      sender: 'jarvis',
      text: 'Good day, Sir. All JARVIS neural sub-systems are online and standing by. How may I be of assistance?',
      timestamp: '17:30:00',
    },
  ],
  addMessage: (msg) =>
    set((state) => {
      const newMessage: ChatMessage = {
        ...msg,
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
      return { messages: [...state.messages, newMessage] };
    }),
  clearMessages: () => set({ messages: [] }),

  memories: getStoredMemories(),
  addMemory: (category, content) =>
    set((state) => {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newMemory: MemoryItem = {
        id: Date.now(),
        category,
        content: content.trim(),
        created_at: now,
        updated_at: now,
      };
      const updated = [newMemory, ...state.memories];
      localStorage.setItem('jarvis-memories', JSON.stringify(updated));
      return { memories: updated };
    }),
  deleteMemory: (id) =>
    set((state) => {
      const updated = state.memories.filter((m) => m.id !== id);
      localStorage.setItem('jarvis-memories', JSON.stringify(updated));
      return { memories: updated };
    }),

  systemMetrics: initialSystemMetrics,
  setSystemMetrics: (metrics) =>
    set((state) => ({
      systemMetrics: { ...state.systemMetrics, ...metrics },
    })),
  isSystemMonitoring: true,
  setIsSystemMonitoring: (isSystemMonitoring) => set({ isSystemMonitoring }),

  preferences: getStoredPreferences(),
  updatePreferences: (newPrefs) =>
    set((state) => {
      const updated = { ...state.preferences, ...newPrefs };
      localStorage.setItem('jarvis-preferences', JSON.stringify(updated));
      return { preferences: updated };
    }),

  toasts: [],
  showToast: (message, type = 'info') =>
    set((state) => {
      const id = `toast-${Date.now()}`;
      setTimeout(() => {
        set((current) => ({
          toasts: current.toasts.filter((t) => t.id !== id),
        }));
      }, 4000);
      return { toasts: [...state.toasts, { id, type, message }] };
    }),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
