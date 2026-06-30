import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DynamicOption } from "@/app/types/searchableSelect";

/* ===============================
   Types
================================ */
export interface CacheItem {
  data: DynamicOption[];
  page: number;
  hasNextPage: boolean;
  timestamp: number;
}

interface CachePayload {
  data: DynamicOption[];
  page: number;
  hasNextPage: boolean;
}

interface CacheState {
  cache: Record<string, CacheItem>;
  hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;

  setCache: (key: string, payload: CachePayload) => void;
  appendToCache: (key: string, payload: CachePayload) => void;
  getCache: (key: string) => CacheItem | undefined;
  clearCache: (key?: string) => void;
}

/* ===============================
   Store
================================ */
export const useCacheStore = create<CacheState>()(
  persist(
    (set, get) => ({
      cache: {},
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      /* ---------- overwrite (page 1) ---------- */
      setCache: (key, payload) =>
        set(state => ({
          cache: {
            ...state.cache,
            [key]: {
              ...payload,
              timestamp: Date.now(),
            },
          },
        })),

      /* ---------- append (page > 1) ---------- */
      appendToCache: (key, payload) =>
        set(state => {
          const existing = state.cache[key];

          if (!existing) {
            return {
              cache: {
                ...state.cache,
                [key]: {
                  ...payload,
                  timestamp: Date.now(),
                },
              },
            };
          }

          const ids = new Set(existing.data.map(i => i.id));
          const merged = [
            ...existing.data,
            ...payload.data.filter(i => !ids.has(i.id)),
          ];

          return {
            cache: {
              ...state.cache,
              [key]: {
                data: merged,
                page: payload.page,
                hasNextPage: payload.hasNextPage,
                timestamp: Date.now(),
              },
            },
          };
        }),

      getCache: (key) => get().cache[key],

      clearCache: (key) =>
        set(state => {
          if (!key) return { cache: {} };
          const copy = { ...state.cache };
          delete copy[key];
          return { cache: copy };
        }),
    }),
    {
      name: "dynamic-select-cache",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/* ===============================
   Helpers
================================ */
export const isCacheValid = (
  cacheItem: CacheItem,
  maxAgeMinutes = 60
): boolean => {
  const age =
    (Date.now() - cacheItem.timestamp) / (1000 * 60);
  return age < maxAgeMinutes;
};

export const getValidCache = (
  key: string,
  maxAgeMinutes = 360
): CacheItem | null => {
  const store = useCacheStore.getState();
  const item = store.getCache(key);

  if (!item || !isCacheValid(item, maxAgeMinutes)) {
    return null;
  }

  return item;
};
