import { allDays } from '@/lib/notes';
import { todayISO } from '@/lib/dates';
import { CalendarView } from './CalendarView';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Calendar · Paari's journal" };

export default async function CalendarPage() {
  const days = await allDays();
  return <CalendarView today={todayISO()} marks={Object.fromEntries(days.map((d) => [d.date, d.moments]))} />;
}
