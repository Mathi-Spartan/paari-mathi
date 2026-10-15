import 'server-only';
import { q } from './db';
import { excerpt, wordCount } from './md';

export type Day = { date: string; body: string; excerpt: string; words: number; updated_at: string };

/** Every written journal day, newest first. */
export async function allDays(): Promise<Day[]> {
  const rows = await q<{ date: string; body: string; updated_at: string }>(
    `SELECT to_char(note_date, 'YYYY-MM-DD') AS date, body,
            to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
     FROM notes WHERE folder = 'daily' AND note_date IS NOT NULL AND btrim(body) <> ''
     ORDER BY note_date DESC`
  );
  return rows.map((r) => ({ ...r, excerpt: excerpt(r.body, 90), words: wordCount(r.body) }));
}
