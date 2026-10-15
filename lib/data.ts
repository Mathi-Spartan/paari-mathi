import 'server-only';
import { q } from './db';
import { todayISO } from './dates';

export type Memory = {
  id: string;
  kind: string;
  body: string;
  feeling: string | null;
  sealed: boolean;
  opens_on: string | null;
  memory_date: string;
  created_at: string;
  has_photo: boolean;
  locked: boolean;
};

const COLS = `id, kind, body, feeling, sealed,
  to_char(opens_on, 'YYYY-MM-DD') AS opens_on,
  to_char(memory_date, 'YYYY-MM-DD') AS memory_date,
  created_at::text AS created_at,
  (photo IS NOT NULL) AS has_photo`;

function withLock(rows: Omit<Memory, 'locked'>[]): Memory[] {
  const today = todayISO();
  return rows.map((r) => ({ ...r, locked: !!(r.sealed && r.opens_on && r.opens_on > today) }));
}

export async function getSettings() {
  const rows = await q<{ key: string; value: string }>(`SELECT key, value FROM settings WHERE key <> 'pin'`);
  const map: Record<string, string> = {};
  rows.forEach((r) => (map[r.key] = r.value));
  return { paariBirth: map.paari_birth ?? null };
}

export async function getStats() {
  const [r] = await q<{ total: number; photos: number; proud: number; letters: number; first: string | null; days: number }>(
    `SELECT count(*)::int AS total,
            count(photo)::int AS photos,
            count(*) FILTER (WHERE kind = 'proud')::int AS proud,
            count(*) FILTER (WHERE kind = 'letter')::int AS letters,
            to_char(min(memory_date), 'YYYY-MM-DD') AS first,
            count(DISTINCT memory_date)::int AS days
     FROM memories`
  );
  return r;
}

export async function getRecent(limit = 24) {
  return withLock(await q(`SELECT ${COLS} FROM memories ORDER BY memory_date DESC, created_at DESC LIMIT $1`, [limit]));
}

export async function getOnDate(iso: string) {
  return withLock(await q(`SELECT ${COLS} FROM memories WHERE memory_date = $1 ORDER BY created_at ASC`, [iso]));
}

export async function getOnThisDay(iso: string) {
  return withLock(
    await q(`SELECT ${COLS} FROM memories WHERE to_char(memory_date, 'MM-DD') = $1 AND memory_date < $2 ORDER BY memory_date DESC LIMIT 10`, [iso.slice(5), iso])
  );
}

export async function getAll() {
  return withLock(await q(`SELECT ${COLS} FROM memories ORDER BY memory_date ASC, created_at ASC`));
}

export async function getLetters() {
  return withLock(await q(`SELECT ${COLS} FROM memories WHERE kind = 'letter' ORDER BY COALESCE(opens_on, memory_date) ASC`));
}

export async function getLatestPhotoId() {
  const [r] = await q<{ id: string }>(`SELECT id FROM memories WHERE photo IS NOT NULL AND NOT (sealed AND opens_on > $1::date) ORDER BY memory_date DESC, created_at DESC LIMIT 1`, [todayISO()]);
  return r?.id ?? null;
}

export async function getMemory(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = withLock(await q(`SELECT ${COLS} FROM memories WHERE id = $1`, [id]));
  return rows[0] ?? null;
}
