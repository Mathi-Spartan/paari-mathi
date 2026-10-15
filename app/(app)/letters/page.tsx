import { getLetters } from '@/lib/data';
import { describeDate } from '@/lib/dates';
import { LettersView } from './LettersView';

export const dynamic = 'force-dynamic';

export default async function LettersPage() {
  const letters = await getLetters();
  return (
    <LettersView
      letters={letters.map((l) => ({ id: l.id, locked: l.locked, opens_on: l.opens_on, body: l.locked ? '' : l.body, written: describeDate(l.memory_date).shortEn, opens: l.opens_on ? describeDate(l.opens_on).shortEn : null }))}
    />
  );
}
