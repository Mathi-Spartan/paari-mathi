import { redirect } from 'next/navigation';
import { JournalPage } from '@/components/JournalPage';
import { getBirth, getDay, onThisDay, togetherOn } from '@/lib/notes';
import { ageText, describeDate, todayISO } from '@/lib/dates';

export const dynamic = 'force-dynamic';

function shift(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const today = todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) redirect(`/daily/${today}`);
  const [day, birth, sessions, past] = await Promise.all([getDay(date), getBirth(), togetherOn(date), onThisDay(date)]);
  return (
    <JournalPage key={date} date={date} today={today} body={day.body} moments={day.moments} updatedAt={day.body.trim() ? day.updatedAt : null}
      prev={shift(date, -1)} next={date === today ? null : shift(date, 1)} age={ageText(birth, date)} hasBirth={!!birth} sessions={sessions} past={past} />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? { title: `${describeDate(date).shortEn} · Paari's journal` } : {};
}
