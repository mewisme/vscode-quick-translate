import type { HistoryEntry } from '../types/internal-types';

export interface TranslationHistory {
  add(entry: HistoryEntry): void;
  getAll(): HistoryEntry[];
  clear(): void;
  size(): number;
}

export function createTranslationHistory(maxSize: number = 20): TranslationHistory {
  const entries: HistoryEntry[] = [];
  let limit = maxSize;

  return {
    add(entry: HistoryEntry): void {
      entries.unshift(entry);
      if (entries.length > limit) {
        entries.splice(limit);
      }
    },
    getAll(): HistoryEntry[] {
      return entries.slice();
    },
    clear(): void {
      entries.length = 0;
    },
    size(): number {
      return entries.length;
    },
  };
}
