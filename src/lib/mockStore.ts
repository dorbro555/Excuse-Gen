import type { ExcuseRecord } from './types';

// Use globalThis to persist store across Vite HMR reloads during development
const globalStore = globalThis as unknown as {
  __EXCUSE_STORE__?: Map<string, ExcuseRecord>;
};

if (!globalStore.__EXCUSE_STORE__) {
  globalStore.__EXCUSE_STORE__ = new Map<string, ExcuseRecord>();

  // Seed with initial sample records
  const initialRecords: ExcuseRecord[] = [
    {
      id: "initial-dispatch",
      target: "Boss",
      scenario: "Missing a meeting",
      tone: "Overly Dramatic",
      excuse: "A catastrophe of unspeakable gravity has befell my morning routine: the fabric of my trousers has surrendered entirely to entropy, rendering my presence in polite company a legal impossibility.",
      signOff: "With profound and tragic remorse,",
      dateIssued: "Sep 25, 2026",
      createdAt: new Date().toISOString()
    },
    {
      id: "sample-broadside",
      target: "Friends",
      scenario: "Skipping a party",
      tone: "Absolute Absurdity",
      excuse: "A council of belligerent municipal swans has established an unauthorized sovereignty across my front porch, and local maritime law forbids me from dispersing them until sundown.",
      signOff: "Under hostage conditions,",
      dateIssued: "Sep 25, 2026",
      createdAt: new Date().toISOString()
    }
  ];

  for (const record of initialRecords) {
    globalStore.__EXCUSE_STORE__.set(record.id, record);
  }
}

const store = globalStore.__EXCUSE_STORE__;

export function saveExcuse(record: ExcuseRecord): void {
  store.set(record.id, record);
}

export function getExcuse(id: string): ExcuseRecord | null {
  return store.get(id) || null;
}

export function listRecentExcuses(limit = 10): ExcuseRecord[] {
  return Array.from(store.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
