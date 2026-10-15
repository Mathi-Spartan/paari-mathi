import { allNotes, getSettings } from '@/lib/notes';
import { YouView } from './YouView';

export const dynamic = 'force-dynamic';

export default async function YouPage() {
  const [settings, notes] = await Promise.all([getSettings(), allNotes()]);
  const dailies = notes.filter((n) => n.folder === 'daily');
  const stats = { total: notes.length, days: dailies.length, photos: 0, first: dailies.at(-1)?.note_date ?? null };
  return <YouView paariBirth={settings.paariBirth} readingDay={settings.readingDay} stats={stats} />;
}
