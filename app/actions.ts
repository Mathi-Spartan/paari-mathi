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

/** Save (or clear) the journal page for one day. */
export async function saveDay(date: string, body: string): Promise<{ ok: boolean }> {
  await requireSession();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayISO()) return { ok: false };
  const text = body.slice(0, 100000);
  if (!text.trim()) {
    await q(`DELETE FROM notes WHERE folder = 'daily' AND note_date = $1`, [date]);
  } else {
    await q(
      `INSERT INTO notes (folder, title, body, note_date) VALUES ('daily', $1, $2, $3::date)
       ON CONFLICT (note_date) WHERE folder = 'daily' DO UPDATE SET body = EXCLUDED.body, updated_at = now()`,
      [date, text, date]
    );
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}
