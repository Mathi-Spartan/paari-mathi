import { allNotes, toMeta } from '@/lib/notes';
import { GraphView } from './GraphView';

export const dynamic = 'force-dynamic';

export default async function GraphPage() {
  const notes = await allNotes();
  return <GraphView notes={notes.filter((n) => n.body.trim() || n.folder !== 'daily').map(toMeta)} />;
}
