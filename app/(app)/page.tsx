import { getOnDate, getOnThisDay, getRecent, getSettings, getStats } from '@/lib/data';
import { addYears, daysBetween, describeDate, todayISO } from '@/lib/dates';
import { DAILY_PROMPTS } from '@/lib/kinds';
import { TodayView } from './TodayView';

export const dynamic = 'force-dynamic';

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ saved?: string; day?: string }> }) {
  const sp = await searchParams;
  const today = todayISO();
  const [stats, recent, todays, onThisDay, settings] = await Promise.all([
    getStats(), getRecent(30), getOnDate(today), getOnThisDay(today), getSettings(),
  ]);
  const doy = daysBetween(`${today.slice(0, 4)}-01-01`, today);
  const readingDay = settings.readingDay ?? (settings.paariBirth ? addYears(settings.paariBirth, 18) : null);
  return (
    <TodayView
      date={describeDate(today)}
      birth={settings.paariBirth}
      readingDay={readingDay}
      readingDayLabel={readingDay ? describeDate(readingDay).shortEn : null}
      prompt={DAILY_PROMPTS[doy % DAILY_PROMPTS.length]}
      stats={stats}
      dayNumber={stats.first ? daysBetween(stats.first, today) + 1 : 1}
      recent={recent}
      todayCount={todays.length}
      onThisDay={onThisDay}
      saved={sp.saved === '1' ? Number(sp.day ?? 0) : null}
    />
  );
}
