import { Shell } from '@/components/Shell';
import { allNotes, getSettings, toMeta } from '@/lib/notes';
import { todayISO } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [notes, settings] = await Promise.all([allNotes(), getSettings()]);
  return (
    <Shell notes={notes.map(toMeta)} today={todayISO()} birth={settings.paariBirth}>
      {children}
    </Shell>
  );
}
