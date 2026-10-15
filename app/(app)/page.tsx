import { getLatestPhotoId, getOnDate, getOnThisDay, getRecent, getSettings, getStats } from '@/lib/data';
import { ageOn, daysBetween, describeDate, todayISO } from '@/lib/dates';
import { DAILY_PROMPTS } from '@/lib/kinds';
import { TodayView } from './TodayView';

export const dynamic = 'force-dynamic';

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ saved?: string; day?: string }> }) {
  const sp = await searchParams;
  const today = todayISO();
  const [stats, recent, todays, onThisDay, settings, coverId] = await Promise.all([
    getStats(), getRecent(20), getOnDate(today), getOnThisDay(today), getSettings(), getLatestPhotoId(),
  ]);
  const doy = daysBetween(`${today.slice(0, 4)}-01-01`, today);
  return (
    <TodayView
      today={today}
      date={describeDate(today)}
      age={ageOn(settings.paariBirth, today)}
      prompt={DAILY_PROMPTS[doy % DAILY_PROMPTS.length]}
      stats={stats}
      dayNumber={stats.first ? daysBetween(stats.first, today) + 1 : 0}
      recent={recent}
      todays={todays}
      onThisDay={onThisDay}
      coverId={coverId}
      saved={sp.saved === '1' ? Number(sp.day ?? 0) : null}
    />
  );
}
