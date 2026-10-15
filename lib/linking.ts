import { describeDate } from './dates';
import type { NoteMeta } from './vault';

export function hrefOf(n: Pick<NoteMeta, 'id' | 'folder' | 'note_date'>) {
  return n.folder === 'daily' && n.note_date ? `/daily/${n.note_date}` : `/note/${n.id}`;
}

export function labelOf(n: Pick<NoteMeta, 'folder' | 'note_date' | 'title'>) {
  if (n.folder === 'daily' && n.note_date) { const d = describeDate(n.note_date); return `${d.day} ${d.monthTa} ${d.year}`; }
  return n.title;
}

/** lower-cased title (or date) → href, used to resolve [[links]]. */
export function linkMap(notes: NoteMeta[]) {
  const map: Record<string, string> = {};
  for (const n of notes) {
    map[n.title.toLowerCase()] = hrefOf(n);
    if (n.note_date) map[n.note_date] = hrefOf(n);
  }
  return map;
}

export function toBacklinks(notes: NoteMeta[]) {
  return notes.map((n) => ({ href: hrefOf(n), label: labelOf(n), excerpt: n.excerpt }));
}
