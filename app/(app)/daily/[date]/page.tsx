import { redirect } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { DailyHeader } from '@/components/DailyHeader';
import { allNotes, backlinksFor, getSettings } from '@/lib/notes';
import { addYears, ageOn, daysBetween, describeDate, todayISO } from '@/lib/dates';
import { linkMap, toBacklinks } from '@/lib/linking';
import { DAILY_TEMPLATE } from '@/lib/vault';

export const dynamic = 'force-dynamic';

function shift(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default async function DailyPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const today = todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) redirect(`/daily/${today}`);
  const [notes, settings] = await Promise.all([allNotes(), getSettings()]);
  const note = notes.find((n) => n.folder === 'daily' && n.note_date === date) ?? null;
  const dailies = notes.filter((n) => n.folder === 'daily' && n.note_date).map((n) => n.note_date!).sort();
  const first = dailies[0];
  const virtual = { id: '', title: date, note_date: date } as Parameters<typeof backlinksFor>[0];
  const backs = backlinksFor(note ?? virtual, notes);
  const isToday = date === today;
  return (
    <Editor
      key={date}
      mode="daily"
      id={note?.id ?? null}
      date={date}
      folder="daily"
      title={date}
      body={note?.body ?? ''}
      sealed={false}
      opensOn={null}
      locked={false}
      updatedAt={note?.updated_at ?? null}
      links={linkMap(notes)}
      backlinks={toBacklinks(backs)}
      tags={note?.tags ?? []}
      startInEdit={!note || !note.body.trim() || note.body.trim() === DAILY_TEMPLATE.trim()}
      minOpenDate={addYears(today, 0)}
      header={
        <DailyHeader date={date} isToday={isToday} prev={shift(date, -1)} next={isToday ? null : shift(date, 1)} age={ageOn(settings.paariBirth, date)}
          dayNo={first ? daysBetween(first, date) + 1 : null} lastEdit={note?.updated_at ?? null} words={note?.words ?? 0} />
      }
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return {};
  return { title: `${describeDate(date).longTa} · Paari & Appa` };
}
