import { getSettings, getStats } from '@/lib/data';
import { YouView } from './YouView';

export const dynamic = 'force-dynamic';

export default async function YouPage() {
  const [settings, stats] = await Promise.all([getSettings(), getStats()]);
  return <YouView paariBirth={settings.paariBirth} stats={stats} />;
}
