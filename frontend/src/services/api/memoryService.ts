import type { MemoryCategory, MemoryItem } from '../../types';
import { INITIAL_MEMORIES } from '../../utils/constants';

class MemoryService {
  private companionUrl: string;

  constructor() {
    this.companionUrl = 'http://127.0.0.1:8000';
  }

  public setCompanionUrl(url: string) {
    this.companionUrl = url;
  }

  public async fetchMemories(): Promise<{ memories: MemoryItem[]; isLiveBackend: boolean }> {
    try {
      const response = await fetch(`${this.companionUrl}/api/memories`, {
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok) {
        const data = await response.json();
        return { memories: data, isLiveBackend: true };
      }
    } catch {
      // Backend companion REST endpoint is not running
    }

    // Fallback to local storage or defaults
    const local = localStorage.getItem('jarvis-memories');
    if (local) {
      try {
        return { memories: JSON.parse(local), isLiveBackend: false };
      } catch {
        // ignore
      }
    }

    return { memories: INITIAL_MEMORIES, isLiveBackend: false };
  }

  public async createMemory(
    category: MemoryCategory,
    content: string
  ): Promise<{ success: boolean; memory: MemoryItem }> {
    const newMemory: MemoryItem = {
      id: Date.now(),
      category,
      content: content.trim(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    try {
      const response = await fetch(`${this.companionUrl}/api/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content }),
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok) {
        const saved = await response.json();
        return { success: true, memory: saved };
      }
    } catch {
      // Offline fallback
    }

    return { success: true, memory: newMemory };
  }

  public async deleteMemory(id: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.companionUrl}/api/memories/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok) {
        return { success: true };
      }
    } catch {
      // Offline fallback
    }
    return { success: true };
  }
}

export const memoryService = new MemoryService();
