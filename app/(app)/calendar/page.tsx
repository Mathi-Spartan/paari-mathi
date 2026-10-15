import { allDays } from '@/lib/notes';
import { todayISO } from '@/lib/dates';
import { CalendarView } from './CalendarView';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const days = await allDays();
  return <CalendarView today={todayISO()} written={days.map((d) => d.date)} />;
}
