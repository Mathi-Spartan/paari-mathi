import 'server-only';
import { q } from './db';
import { excerpt, wordCount } from './md';

export type Day = { date: string; body: string; excerpt: string; words: number; moments: string[]; updated_at: string };

/** Every journal day that has writing or a marked moment, newest first. */
export async function allDays(): Promise<Day[]> {
  const rows = await q<{ date: string; body: string; moments: string[]; updated_at: string }>(
    `SELECT to_char(note_date, 'YYYY-MM-DD') AS date, body, moments,
            to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
     FROM notes WHERE folder = 'daily' AND note_date IS NOT NULL AND (btrim(body) <> '' OR cardinality(moments) > 0)
     ORDER BY note_date DESC`
  );
  return rows.map((r) => ({ ...r, moments: r.moments ?? [], excerpt: excerpt(r.body, 120), words: wordCount(r.body) }));
}

export async function getDay(date: string) {
  const [row] = await q<{ body: string; moments: string[]; updated_at: string }>(
    `SELECT body, moments, to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
     FROM notes WHERE folder = 'daily' AND note_date = $1`, [date]);
  return { body: row?.body ?? '', moments: row?.moments ?? [], updatedAt: row?.updated_at ?? null };
}

/** Pages written on this same calendar date in earlier years. */
export async function onThisDay(date: string) {
  const rows = await q<{ date: string; body: string; moments: string[] }>(
    `SELECT to_char(note_date, 'YYYY-MM-DD') AS date, body, moments FROM notes
     WHERE folder = 'daily' AND to_char(note_date, 'MM-DD') = $1 AND note_date < $2::date AND btrim(body) <> ''
     ORDER BY note_date DESC LIMIT 3`, [date.slice(5), date]);
  return rows.map((r) => ({ date: r.date, excerpt: excerpt(r.body, 220), moments: r.moments ?? [] }));
}

export async function getBirth(): Promise<string | null> {
  const [row] = await q<{ value: string }>(`SELECT value FROM settings WHERE key = 'paari_birth'`);
  return row?.value ?? null;
}

export type Session = { id: number; seconds: number; activity: string; at: string };

export async function togetherOn(date: string): Promise<Session[]> {
  return q<Session>(
    `SELECT id, seconds, activity, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS at
     FROM together WHERE note_date = $1 ORDER BY created_at`, [date]);
}

export type Letter = { id: string; title: string; body: string | null; opensOn: string; writtenOn: string; open: boolean };

/** Letters for grown-up Paari. A sealed letter's words never leave the database before its day. */
export async function letters(today: string): Promise<Letter[]> {
  const rows = await q<{ id: string; title: string; body: string; opens_on: string; written_on: string }>(
    `SELECT id, title, CASE WHEN opens_on <= $1::date THEN body ELSE NULL END AS body,
            to_char(opens_on, 'YYYY-MM-DD') AS opens_on, to_char(created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS written_on
     FROM notes WHERE folder = 'letter' ORDER BY opens_on`, [today]);
  return rows.map((r) => ({ id: r.id, title: r.title, body: r.body, opensOn: r.opens_on, writtenOn: r.written_on, open: r.opens_on <= today }));
}

export async function stats() {
  const [r] = await q<{ days: number; moments: number; together: number; letters: number }>(
    `SELECT (SELECT count(*)::int FROM notes WHERE folder = 'daily' AND btrim(body) <> '') AS days,
            (SELECT coalesce(sum(cardinality(moments)), 0)::int FROM notes WHERE folder = 'daily') AS moments,
            (SELECT coalesce(sum(seconds), 0)::int FROM together) AS together,
            (SELECT count(*)::int FROM notes WHERE folder = 'letter') AS letters`);
  return r;
}
