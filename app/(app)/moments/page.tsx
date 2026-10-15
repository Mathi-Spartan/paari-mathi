import { MomentsView } from './MomentsView';
import { allDays } from '@/lib/notes';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Moments · Paari's journal" };

export default async function MomentsPage() {
  const days = await allDays();
  return <MomentsView items={days.filter((d) => d.moments.length > 0).map((d) => ({ date: d.date, excerpt: d.excerpt, moments: d.moments }))} />;
}
