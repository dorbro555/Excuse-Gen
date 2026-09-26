import { getStore } from '@netlify/blobs';
import { saveExcuse as saveLocalMock, getExcuse as getLocalMock } from './mockStore';
import type { ExcuseRecord } from './types';

const STORE_NAME = 'excuses';

let blobStoreInstance: ReturnType<typeof getStore> | null = null;
let useLocalFallback = false;

function getBlobStore() {
  if (useLocalFallback) {
    return null;
  }

  if (!blobStoreInstance) {
    try {
      blobStoreInstance = getStore({
        name: STORE_NAME,
        consistency: 'strong'
      });
    } catch (err) {
      console.info(
        'ℹ️ [Storage] Netlify Blobs context not active locally. Using resilient in-memory store.'
      );
      useLocalFallback = true;
      return null;
    }
  }

  return blobStoreInstance;
}

/**
 * Saves an excuse record to Netlify Blobs (or local fallback in offline dev).
 */
export async function saveExcuseRecord(record: ExcuseRecord): Promise<void> {
  const store = getBlobStore();

  if (store) {
    try {
      await store.setJSON(record.id, record);
      return;
    } catch (err) {
      console.warn(
        '⚠️ [Storage] Netlify Blobs setJSON failed, falling back to local store:',
        err
      );
      useLocalFallback = true;
    }
  }

  saveLocalMock(record);
}

/**
 * Retrieves an excuse record by ID from Netlify Blobs (or local fallback in offline dev).
 */
export async function getExcuseRecord(id: string): Promise<ExcuseRecord | null> {
  const store = getBlobStore();

  if (store) {
    try {
      const data = await store.get(id, { type: 'json' });
      if (data) {
        return data as ExcuseRecord;
      }
    } catch (err) {
      console.warn(
        '⚠️ [Storage] Netlify Blobs get failed, falling back to local store:',
        err
      );
      useLocalFallback = true;
    }
  }

  return getLocalMock(id);
}
