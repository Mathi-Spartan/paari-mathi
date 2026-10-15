import { redirect } from 'next/navigation';
import { JournalPage } from '@/components/JournalPage';
import { q } from '@/lib/db';
import { describeDate, todayISO } from '@/lib/dates';

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
  const [row] = await q<{ body: string }>(`SELECT body FROM notes WHERE folder = 'daily' AND note_date = $1`, [date]);
  return <JournalPage key={date} date={date} today={today} body={row?.body ?? ''} prev={shift(date, -1)} next={date === today ? null : shift(date, 1)} />;
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? { title: `${describeDate(date).longTa} · பாரிக்கு, அப்பா` } : {};
}
