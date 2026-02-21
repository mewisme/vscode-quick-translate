import type { TranslateBackendVersion } from '../types/internal-types';

interface CacheKey {
  text: string;
  from: string;
  to: string;
  version: TranslateBackendVersion;
}

function buildKey(key: CacheKey): string {
  return `${key.version}|${key.from}|${key.to}|${key.text}`;
}

export interface TranslationCacheEntry {
  text: string[];
  fromLang: string;
  toLang: string;
  version: TranslateBackendVersion;
}

export interface TranslationCache {
  get(key: CacheKey): TranslationCacheEntry | undefined;
  set(key: CacheKey, value: TranslationCacheEntry): void;
  clear(): void;
  size(): number;
}

export function createTranslationCache(): TranslationCache {
  const store = new Map<string, TranslationCacheEntry>();

  return {
    get(key: CacheKey): TranslationCacheEntry | undefined {
      return store.get(buildKey(key));
    },
    set(key: CacheKey, value: TranslationCacheEntry): void {
      store.set(buildKey(key), value);
    },
    clear(): void {
      store.clear();
    },
    size(): number {
      return store.size;
    },
  };
}
