import type { IconName } from '@/components/Icon';

export type MomentId = 'proud' | 'first' | 'milestone' | 'together' | 'hard';

export type Moment = { id: MomentId; en: string; ta: string; color: string; soft: string; icon: IconName };

/** The five kinds of day Appa can mark. Colour always means the kind, nothing else. */
export const MOMENTS: Moment[] = [
  { id: 'proud', en: 'Proud', ta: 'பெருமை', color: '#F2672A', soft: '#FFEFE6', icon: 'proud' },
  { id: 'first', en: 'First time', ta: 'முதல் முறை', color: '#2457E6', soft: '#EBF0FF', icon: 'moment' },
  { id: 'milestone', en: 'Milestone', ta: 'மைல்கல்', color: '#7A4FD8', soft: '#F1ECFC', icon: 'milestone' },
  { id: 'together', en: 'Our time', ta: 'நம் நேரம்', color: '#0E9F76', soft: '#E3F6EF', icon: 'together' },
  { id: 'hard', en: 'Hard day', ta: 'கடினமான நாள்', color: '#6B7280', soft: '#EEF0F3', icon: 'sun' },
];

export const momentOf = (id: string) => MOMENTS.find((m) => m.id === id);

export const ACTIVITIES = [
  { id: 'play', en: 'Play' },
  { id: 'read', en: 'Reading' },
  { id: 'walk', en: 'A walk' },
  { id: 'therapy', en: 'Therapy practice' },
  { id: 'music', en: 'Music' },
  { id: 'quiet', en: 'Quietly together' },
] as const;

export const activityOf = (id: string) => ACTIVITIES.find((a) => a.id === id)?.en ?? 'Together';

export function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${Math.max(1, m)} min`;
}
