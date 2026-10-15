import { notFound } from 'next/navigation';
import { getMemory, getSettings } from '@/lib/data';
import { ageOn, describeDate } from '@/lib/dates';
import { q } from '@/lib/db';
import { MemoryView } from './MemoryView';

export const dynamic = 'force-dynamic';

export default async function MemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [m, settings] = await Promise.all([getMemory(id), getSettings()]);
  if (!m) notFound();
  // Appa may choose to peek at his own sealed letter; it is fetched only here.
  const [raw] = m.locked ? await q<{ body: string }>(`SELECT body FROM memories WHERE id = $1`, [id]) : [{ body: m.body }];
  return <MemoryView m={{ ...m, body: raw.body }} date={describeDate(m.memory_date)} age={ageOn(settings.paariBirth, m.memory_date)} opens={m.opens_on ? describeDate(m.opens_on).shortEn : null} />;
}
