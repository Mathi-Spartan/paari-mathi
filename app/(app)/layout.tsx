import { AppShell } from '@/components/AppShell';
import { allDays } from '@/lib/notes';
import { todayISO } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const days = await allDays();
  return (
    <AppShell today={todayISO()} entries={days.map((d) => ({ date: d.date, excerpt: d.excerpt }))}>
      {children}
    </AppShell>
  );
}
