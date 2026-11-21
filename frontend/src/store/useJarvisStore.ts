import { create } from 'zustand';
import type {
  AssistantState,
  ChatMessage,
  MemoryItem,
  SystemMetrics,
  ThemeMode,
  UserPreferences,
} from '../types';
import { DEFAULT_PREFERENCES } from '../utils/constants';

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
  setMemories: (memories: MemoryItem[]) => void;
  addMemoryRecord: (memory: MemoryItem) => void;
  deleteMemoryRecord: (id: number) => void;
  isLoadingMemories: boolean;
  setIsLoadingMemories: (loading: boolean) => void;

  // System Metrics
  systemMetrics: SystemMetrics | null;
  setSystemMetrics: (metrics: SystemMetrics | null) => void;
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

const getStoredPreferences = (): UserPreferences => {
  try {
    const saved = localStorage.getItem('jarvis-preferences');
    if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
  } catch {
    // fallback
  }
  return DEFAULT_PREFERENCES;
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

  messages: [],
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

  memories: [],
  isLoadingMemories: false,
  setIsLoadingMemories: (isLoadingMemories) => set({ isLoadingMemories }),
  setMemories: (memories) => set({ memories }),
  addMemoryRecord: (memory) =>
    set((state) => ({
      memories: [memory, ...state.memories.filter((m) => m.id !== memory.id)],
    })),
  deleteMemoryRecord: (id) =>
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    })),

  systemMetrics: null,
  setSystemMetrics: (systemMetrics) => set({ systemMetrics }),
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
