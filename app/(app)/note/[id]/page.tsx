import { notFound } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { allNotes, backlinksFor } from '@/lib/notes';
import { todayISO } from '@/lib/dates';
import { linkMap, toBacklinks } from '@/lib/linking';

export const dynamic = 'force-dynamic';

export default async function NotePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const notes = await allNotes();
  const note = notes.find((n) => n.id === id);
  if (!note) notFound();
  return (
    <Editor
      key={note.id}
      mode="note"
      id={note.id}
      folder={note.folder}
      title={note.title}
      body={note.body}
      sealed={note.sealed}
      opensOn={note.opens_on}
      locked={note.locked}
      updatedAt={note.updated_at}
      links={linkMap(notes)}
      backlinks={toBacklinks(backlinksFor(note, notes))}
      tags={note.tags}
      startInEdit={sp.new === '1' || !note.body.trim()}
      minOpenDate={todayISO()}
    />
  );
}
