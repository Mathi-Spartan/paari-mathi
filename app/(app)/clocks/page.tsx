import { allNotes, getSettings } from '@/lib/notes';
import { addYears, describeDate, todayISO } from '@/lib/dates';
import { ClocksView } from './ClocksView';

export const dynamic = 'force-dynamic';

export default async function ClocksPage() {
  const [notes, settings] = await Promise.all([allNotes(), getSettings()]);
  const today = todayISO();
  const dailies = notes.filter((n) => n.folder === 'daily' && n.note_date && n.body.trim()).map((n) => n.note_date!);
  const yearStart = `${today.slice(0, 4)}-01-01`;
  const thisYear = dailies.filter((d) => d >= yearStart).length;
  let streak = 0;
  const set = new Set(dailies);
  for (let d = new Date(`${today}T00:00:00Z`); set.has(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() - 1)) streak++;
  const readingDay = settings.readingDay ?? (settings.paariBirth ? addYears(settings.paariBirth, 18) : null);
  const togetherMin = notes.reduce((a, n) => a + [...(n.folder === 'daily' ? (n.body.match(/(\d+) நிமிடம் ஒன்றாக/g) ?? []) : [])].reduce((x, m) => x + Number(m.match(/\d+/)![0]), 0), 0);
  return (
    <ClocksView
      today={today}
      birth={settings.paariBirth}
      readingDay={readingDay}
      readingLabel={readingDay ? describeDate(readingDay).shortEn : null}
      written={dailies.length}
      thisYear={thisYear}
      streak={streak}
      togetherMin={togetherMin}
    />
  );
}
