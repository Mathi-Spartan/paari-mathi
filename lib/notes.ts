import 'server-only';
import { q } from './db';
import { todayISO } from './dates';
import { excerpt, extractLinks, extractTags, wordCount } from './md';
import type { NoteMeta } from './vault';

export type Note = NoteMeta & { body: string };

const COLS = `id, folder, title, body, sealed,
  to_char(note_date, 'YYYY-MM-DD') AS note_date,
  to_char(opens_on, 'YYYY-MM-DD') AS opens_on,
  to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at,
  to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at`;

type Row = Omit<Note, 'locked' | 'tags' | 'links' | 'excerpt' | 'words'>;

function enrich(r: Row): Note {
  const locked = !!(r.sealed && r.opens_on && r.opens_on > todayISO());
  return { ...r, locked, tags: locked ? [] : extractTags(r.body), links: locked ? [] : extractLinks(r.body), excerpt: locked ? '' : excerpt(r.body), words: wordCount(r.body) };
}

export async function allNotes(): Promise<Note[]> {
  const rows = await q<Row>(`SELECT ${COLS} FROM notes ORDER BY COALESCE(note_date, created_at::date) DESC, created_at DESC`);
  return rows.map(enrich);
}

/** Lightweight list for the sidebar, graph and switcher (no bodies). */
export function toMeta(n: Note): NoteMeta {
  const { body: _b, ...meta } = n;
  void _b;
  return meta;
}

export async function getDaily(date: string) {
  const [r] = await q<Row>(`SELECT ${COLS} FROM notes WHERE folder = 'daily' AND note_date = $1`, [date]);
  return r ? enrich(r) : null;
}

export async function getNote(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [r] = await q<Row>(`SELECT ${COLS} FROM notes WHERE id = $1`, [id]);
  return r ? enrich(r) : null;
}

export async function getSettings() {
  const rows = await q<{ key: string; value: string }>(`SELECT key, value FROM settings WHERE key <> 'pin'`);
  const map: Record<string, string> = {};
  rows.forEach((r) => (map[r.key] = r.value));
  return { paariBirth: map.paari_birth ?? null, readingDay: map.reading_day ?? null };
}

/** Backlinks: notes whose body links to this note's title (or date for daily notes). */
export function backlinksFor(target: Note, all: Note[]) {
  const keys = new Set([target.title, target.note_date].filter(Boolean) as string[]);
  return all.filter((n) => n.id !== target.id && n.links.some((l) => keys.has(l)));
}
