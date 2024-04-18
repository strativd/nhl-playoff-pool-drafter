import { DrafterDb } from '@/database/db';

const db = new DrafterDb();

export function useDatabase() {
  return db;
}
