import { CoverView } from './CoverView';
import { allDays, getBirth, letters, stats } from '@/lib/notes';
import { todayISO } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const today = todayISO();
  const [days, birth, s, ls] = await Promise.all([allDays(), getBirth(), stats(), letters(today)]);
  const next = ls.find((l) => !l.open);
  return (
    <CoverView today={today} birth={birth} stats={s}
      writtenToday={days.some((d) => d.date === today && d.body.trim() !== '')}
      recent={days.filter((d) => d.moments.length > 0).slice(0, 5).map((d) => ({ date: d.date, excerpt: d.excerpt, moments: d.moments }))}
      nextLetter={next ? { title: next.title, opensOn: next.opensOn, writtenOn: next.writtenOn } : null} />
  );
}
