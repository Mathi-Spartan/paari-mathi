import { LettersView } from './LettersView';
import { getBirth, letters } from '@/lib/notes';
import { todayISO } from '@/lib/dates';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Letters · Paari's journal" };

export default async function LettersPage() {
  const today = todayISO();
  const [birth, ls] = await Promise.all([getBirth(), letters(today)]);
  return <LettersView today={today} birth={birth} letters={ls} />;
}
