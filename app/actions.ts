'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { q } from '@/lib/db';
import { checkPin, hashPin, makeSessionToken, SESSION_COOKIE, SESSION_DAYS, verifySessionToken } from '@/lib/auth';
import { todayISO } from '@/lib/dates';
import { DAILY_TEMPLATE, FOLDERS } from '@/lib/vault';

async function requireSession() {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) throw new Error('Not signed in');
}

async function startSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await makeSessionToken(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86400 });
}

/* ── PIN ── */
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

/* ── notes ── */
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export async function saveDaily(date: string, body: string): Promise<{ ok: boolean; id?: string }> {
  await requireSession();
  if (!ISO.test(date) || date > todayISO()) return { ok: false };
  const [r] = await q<{ id: string }>(
    `INSERT INTO notes (folder, title, body, note_date) VALUES ('daily', $1, $2, $3::date)
     ON CONFLICT (note_date) WHERE folder = 'daily' DO UPDATE SET body = EXCLUDED.body, updated_at = now()
     RETURNING id`,
    [date, body.slice(0, 100000), date]
  );
  revalidatePath('/', 'layout');
  return { ok: true, id: r.id };
}

export async function saveNote(input: { id: string; title: string; body: string; sealed?: boolean; opensOn?: string | null }): Promise<{ ok: boolean }> {
  await requireSession();
  const opens = input.sealed && input.opensOn && ISO.test(input.opensOn) ? input.opensOn : null;
  await q(`UPDATE notes SET title = $2, body = $3, sealed = $4, opens_on = $5, updated_at = now() WHERE id = $1 AND folder <> 'daily'`,
    [input.id, input.title.trim().slice(0, 200) || 'பெயரிடாத குறிப்பு', input.body.slice(0, 100000), !!opens, opens]);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function createNote(folder: string, title?: string) {
  await requireSession();
  if (folder === 'daily') redirect(`/daily/${todayISO()}`);
  const f = FOLDERS.some((x) => x.id === folder) ? folder : 'moments';
  const name = (title ?? '').trim() || (f === 'letters' ? 'பாரிக்கு ஒரு கடிதம்' : 'புதிய குறிப்பு');
  const body = f === 'letters' ? 'என் பாரிக்கு,\n\n\n\n— அப்பா' : '';
  const [r] = await q<{ id: string }>(`INSERT INTO notes (folder, title, body) VALUES ($1, $2, $3) RETURNING id`, [f, name, body]);
  revalidatePath('/', 'layout');
  redirect(`/note/${r.id}?new=1`);
}

/** Open the note a [[link]] points to, creating it in Moments if it does not exist yet (like Obsidian). */
export async function openLink(title: string) {
  await requireSession();
  const t = title.trim();
  if (ISO.test(t)) redirect(`/daily/${t}`);
  const [hit] = await q<{ id: string }>(`SELECT id FROM notes WHERE lower(title) = lower($1) AND folder <> 'daily' LIMIT 1`, [t]);
  if (hit) redirect(`/note/${hit.id}`);
  const [r] = await q<{ id: string }>(`INSERT INTO notes (folder, title, body) VALUES ('moments', $1, '') RETURNING id`, [t.slice(0, 200)]);
  revalidatePath('/', 'layout');
  redirect(`/note/${r.id}?new=1`);
}

export async function deleteNote(id: string) {
  await requireSession();
  await q(`DELETE FROM notes WHERE id = $1`, [id]);
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function uploadImage(dataUrl: string): Promise<{ ok: boolean; id?: string }> {
  await requireSession();
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl) || dataUrl.length > 7_500_000) return { ok: false };
  const [r] = await q<{ id: string }>(`INSERT INTO images (data) VALUES ($1) RETURNING id`, [dataUrl]);
  return { ok: true, id: r.id };
}

/** Used by the together timer: adds a line to today's note under "Our time". */
export async function appendTogether(minutes: number, activity: string) {
  await requireSession();
  const date = todayISO();
  const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  const line = `**${time}** — ${Math.max(1, Math.round(minutes))} நிமிடம் ஒன்றாக · ${activity} #நம்நேரம்`;
  const [cur] = await q<{ body: string }>(`SELECT body FROM notes WHERE folder = 'daily' AND note_date = $1`, [date]);
  let body = cur?.body ?? DAILY_TEMPLATE;
  const heading = '## நம் நேரம் · Our time';
  if (body.includes(heading)) {
    const at = body.indexOf(heading) + heading.length;
    const next = body.indexOf('\n## ', at);
    const end = next === -1 ? body.length : next;
    body = body.slice(0, end).trimEnd() + `\n${line}\n` + (next === -1 ? '' : '\n' + body.slice(next + 1));
  } else {
    body = `${body.trimEnd()}\n\n${heading}\n${line}\n`;
  }
  await saveDaily(date, body);
  redirect(`/daily/${date}`);
}

export async function saveSettings(paariBirth: string | null, readingDay?: string | null) {
  await requireSession();
  if (readingDay !== undefined) {
    if (readingDay && ISO.test(readingDay)) await q(`INSERT INTO settings (key, value) VALUES ('reading_day', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [readingDay]);
    else await q(`DELETE FROM settings WHERE key = 'reading_day'`);
  }
  if (paariBirth && ISO.test(paariBirth)) await q(`INSERT INTO settings (key, value) VALUES ('paari_birth', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [paariBirth]);
  else await q(`DELETE FROM settings WHERE key = 'paari_birth'`);
  revalidatePath('/', 'layout');
  return { ok: true };
}
