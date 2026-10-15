'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { q } from '@/lib/db';
import { checkPin, hashPin, makeSessionToken, SESSION_COOKIE, SESSION_DAYS, verifySessionToken } from '@/lib/auth';
import { todayISO } from '@/lib/dates';

async function requireSession() {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) throw new Error('Not signed in');
}

async function startSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await makeSessionToken(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86400 });
}

export async function hasPin() {
  return (await q(`SELECT 1 FROM settings WHERE key = 'pin'`)).length > 0;
}

export async function unlock(pin: string): Promise<{ ok: boolean; error?: string }> {
  if (!/^\d{6}$/.test(pin)) return { ok: false, error: 'PIN must be 6 digits' };
  const rows = await q<{ value: string }>(`SELECT value FROM settings WHERE key = 'pin'`);
  if (!rows.length) return { ok: false, error: 'No PIN yet' };
  if (!(await checkPin(pin, rows[0].value))) return { ok: false, error: 'wrong' };
  await startSession();
  return { ok: true };
}

export async function createPin(pin: string): Promise<{ ok: boolean; error?: string }> {
  if (!/^\d{6}$/.test(pin)) return { ok: false, error: 'PIN must be 6 digits' };
  const inserted = await q(`INSERT INTO settings (key, value) VALUES ('pin', $1) ON CONFLICT (key) DO NOTHING RETURNING key`, [await hashPin(pin)]);
  if (!inserted.length) return { ok: false, error: 'A PIN already exists' };
  await startSession();
  return { ok: true };
}

export async function lockNow() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/lock');
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const MOMENT_IDS = ['proud', 'first', 'milestone', 'together', 'hard'];

/** Remove a day's row once it has neither words nor moments. */
async function tidy(date: string) {
  await q(`DELETE FROM notes WHERE folder = 'daily' AND note_date = $1 AND btrim(body) = '' AND cardinality(moments) = 0`, [date]);
}

/** Save the journal page for one day. */
export async function saveDay(date: string, body: string): Promise<{ ok: boolean; at?: string }> {
  await requireSession();
  if (!ISO.test(date) || date > todayISO()) return { ok: false };
  const text = body.slice(0, 100000);
  await q(
    `INSERT INTO notes (folder, title, body, note_date) VALUES ('daily', $1, $2, $3::date)
     ON CONFLICT (note_date) WHERE folder = 'daily' DO UPDATE SET body = EXCLUDED.body, updated_at = now()`,
    [date, text, date]
  );
  await tidy(date);
  revalidatePath('/', 'layout');
  return { ok: true, at: new Date().toISOString() };
}

/** Mark which moments a day holds: proud, first time, milestone, our time, hard day. */
export async function setMoments(date: string, moments: string[]): Promise<{ ok: boolean }> {
  await requireSession();
  if (!ISO.test(date) || date > todayISO()) return { ok: false };
  const clean = MOMENT_IDS.filter((m) => moments.includes(m));
  await q(
    `INSERT INTO notes (folder, title, body, note_date, moments) VALUES ('daily', $1, '', $2::date, $3::text[])
     ON CONFLICT (note_date) WHERE folder = 'daily' DO UPDATE SET moments = EXCLUDED.moments, updated_at = now()`,
    [date, date, clean]
  );
  await tidy(date);
  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Log time spent with Paari from the together timer. The day is marked "Our time" too. */
export async function addTogether(seconds: number, activity: string): Promise<{ ok: boolean }> {
  await requireSession();
  const date = todayISO();
  const secs = Math.min(24 * 3600, Math.max(60, Math.round(seconds)));
  await q(`INSERT INTO together (note_date, seconds, activity) VALUES ($1::date, $2, $3)`, [date, secs, activity.slice(0, 40)]);
  await q(
    `INSERT INTO notes (folder, title, body, note_date, moments) VALUES ('daily', $1, '', $2::date, ARRAY['together'])
     ON CONFLICT (note_date) WHERE folder = 'daily' DO UPDATE
     SET moments = CASE WHEN 'together' = ANY(notes.moments) THEN notes.moments ELSE notes.moments || 'together'::text END, updated_at = now()`,
    [date, date]
  );
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function removeTogether(id: number): Promise<{ ok: boolean }> {
  await requireSession();
  await q(`DELETE FROM together WHERE id = $1`, [id]);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function saveBirthday(date: string): Promise<{ ok: boolean }> {
  await requireSession();
  if (!ISO.test(date) || date > todayISO()) return { ok: false };
  await q(`INSERT INTO settings (key, value) VALUES ('paari_birth', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [date]);
  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Seal a letter for grown-up Paari. It cannot be read again until its opening day. */
export async function sealLetter(title: string, body: string, opensOn: string): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!body.trim()) return { ok: false, error: 'Write the letter first.' };
  if (!ISO.test(opensOn) || opensOn <= todayISO()) return { ok: false, error: 'Pick an opening day in the future.' };
  await q(`INSERT INTO notes (folder, title, body, sealed, opens_on) VALUES ('letter', $1, $2, true, $3::date)`,
    [title.trim().slice(0, 120) || 'A letter for Paari', body.slice(0, 100000), opensOn]);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function deleteLetter(id: string): Promise<{ ok: boolean }> {
  await requireSession();
  await q(`DELETE FROM notes WHERE folder = 'letter' AND id = $1::uuid`, [id]);
  revalidatePath('/', 'layout');
  return { ok: true };
}
