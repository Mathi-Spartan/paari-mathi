import { allNotes } from '@/lib/notes';
import { todayISO } from '@/lib/dates';
import { CalendarView } from './CalendarView';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const notes = await allNotes();
  const days = Object.fromEntries(
    notes.filter((n) => n.folder === 'daily' && n.note_date && n.body.trim()).map((n) => [n.note_date!, { words: n.words, excerpt: n.excerpt, tags: n.tags.slice(0, 3) }])
  );
  return <CalendarView today={todayISO()} days={days} />;
}
