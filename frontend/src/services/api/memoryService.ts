import type { MemoryCategory, MemoryItem } from '../../types';
import { getApiBaseUrl } from './apiConfig';

class MemoryService {
  public getCompanionUrl(): string {
    return getApiBaseUrl();
  }

  public async fetchMemories(): Promise<{ memories: MemoryItem[]; isLiveBackend: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.getCompanionUrl()}/api/memories`, {
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        return { memories: data, isLiveBackend: true };
      }
    } catch {
      // Backend companion REST endpoint is not running
    }

    return {
      memories: [],
      isLiveBackend: false,
      error: 'Backend SQLite memory service offline. Start companion API to load memories.',
    };
  }

  public async createMemory(
    category: MemoryCategory,
    content: string
  ): Promise<{ success: boolean; memory?: MemoryItem; error?: string }> {
    try {
      const response = await fetch(`${this.getCompanionUrl()}/api/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content }),
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const saved = await response.json();
        return { success: true, memory: saved };
      }
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || `HTTP ${response.status}` };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Companion API unreachable.',
      };
    }
  }

  public async deleteMemory(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.getCompanionUrl()}/api/memories/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        return { success: true };
      }
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || `HTTP ${response.status}` };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Companion API unreachable.',
      };
    }
  }
}

export const memoryService = new MemoryService();
