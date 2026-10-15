import { getSettings } from '@/lib/data';
import { todayISO } from '@/lib/dates';
import { Composer } from './Composer';

export const dynamic = 'force-dynamic';

export default async function NewPage({ searchParams }: { searchParams: Promise<{ kind?: string; photo?: string }> }) {
  const sp = await searchParams;
  const settings = await getSettings();
  return <Composer today={todayISO()} initialKind={sp.kind ?? 'moment'} openPhoto={sp.photo === '1'} paariBirth={settings.paariBirth} />;
}
