import { getAll, getSettings } from '@/lib/data';
import { ageOn, describeDate, todayISO } from '@/lib/dates';
import { BookReader, type BookPage } from './BookReader';

export const dynamic = 'force-dynamic';

export default async function BookPageRoute() {
  const [all, settings] = await Promise.all([getAll(), getSettings()]);
  const byDay = new Map<string, typeof all>();
  for (const m of all) byDay.set(m.memory_date, [...(byDay.get(m.memory_date) ?? []), m]);
  const pages: BookPage[] = [...byDay.entries()].map(([iso, memories], i) => ({
    iso, number: i + 1, date: describeDate(iso), age: ageOn(settings.paariBirth, iso),
    memories: memories.map((m) => ({ id: m.id, kind: m.kind, body: m.body, has_photo: m.has_photo, locked: m.locked, opens_on: m.opens_on, feeling: m.feeling, created_at: m.created_at, duration_seconds: m.duration_seconds })),
  }));
  const first = all[0]?.memory_date ?? todayISO();
  return <BookReader pages={pages} since={describeDate(first)} />;
}
