'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { q } from '@/lib/db';
import { checkPin, hashPin, makeSessionToken, SESSION_COOKIE, SESSION_DAYS, verifySessionToken } from '@/lib/auth';
import { KINDS } from '@/lib/kinds';
import { todayISO } from '@/lib/dates';

async function requireSession() {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) throw new Error('Not signed in');
}

async function startSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await makeSessionToken(), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86400,
  });
}

export async function hasPin() {
  const rows = await q(`SELECT 1 FROM settings WHERE key = 'pin'`);
  return rows.length > 0;
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
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect('/lock');
}

export type SaveInput = {
  kind: string;
  body: string;
  photo: string | null;
  feeling: string | null;
  sealed: boolean;
  opensOn: string | null;
  memoryDate: string;
};

export async function saveMemory(input: SaveInput): Promise<{ ok: boolean; id?: string; day?: number; error?: string }> {
  await requireSession();
  const kind = KINDS.some((k) => k.id === input.kind) ? input.kind : 'moment';
  const body = (input.body ?? '').trim().slice(0, 20000);
  const photo = input.photo && /^data:image\/(jpeg|png|webp);base64,/.test(input.photo) && input.photo.length < 7_500_000 ? input.photo : null;
  if (!body && !photo) return { ok: false, error: 'Write something or add a photo' };
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.memoryDate) && input.memoryDate <= todayISO() ? input.memoryDate : todayISO();
  const opensOn = input.sealed && input.opensOn && /^\d{4}-\d{2}-\d{2}$/.test(input.opensOn) ? input.opensOn : null;
  const [row] = await q<{ id: string }>(
    `INSERT INTO memories (kind, body, photo, feeling, sealed, opens_on, memory_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [kind, body, photo, input.feeling || null, !!opensOn, opensOn, date]
  );
  const [d] = await q<{ days: number }>(`SELECT count(DISTINCT memory_date)::int AS days FROM memories`);
  revalidatePath('/', 'layout');
  return { ok: true, id: row.id, day: d.days };
}

export async function deleteMemory(id: string) {
  await requireSession();
  await q(`DELETE FROM memories WHERE id = $1`, [id]);
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function saveSettings(paariBirth: string | null) {
  await requireSession();
  if (paariBirth && /^\d{4}-\d{2}-\d{2}$/.test(paariBirth)) {
    await q(`INSERT INTO settings (key, value) VALUES ('paari_birth', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [paariBirth]);
  } else {
    await q(`DELETE FROM settings WHERE key = 'paari_birth'`);
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}
