export type FolderId = 'daily' | 'moments' | 'firsts' | 'proud' | 'letters';

export const FOLDERS: { id: FolderId; ta: string; en: string; icon: 'calendar' | 'moment' | 'milestone' | 'proud' | 'letter'; color: string }[] = [
  { id: 'daily', ta: 'தினக்குறிப்பு', en: 'Daily notes', icon: 'calendar', color: 'var(--appa)' },
  { id: 'moments', ta: 'தருணங்கள்', en: 'Moments', icon: 'moment', color: 'var(--paari)' },
  { id: 'firsts', ta: 'முதல் முறைகள்', en: 'Firsts', icon: 'milestone', color: 'var(--green)' },
  { id: 'proud', ta: 'பெருமைகள்', en: 'Proud of you', icon: 'proud', color: 'var(--gold)' },
  { id: 'letters', ta: 'கடிதங்கள்', en: 'Letters to Paari', icon: 'letter', color: 'var(--ink)' },
];

export function folderOf(id: string) {
  return FOLDERS.find((f) => f.id === id) ?? FOLDERS[1];
}

export const DAILY_TEMPLATE = `## இன்று நான் கவனித்தது · What I noticed


## பாரியின் சிறு வெற்றி · Today's win
- [ ]

## நம் நேரம் · Our time


## அவனுக்கு ஒரு வரி · One line for him
> `;

export type NoteMeta = {
  id: string;
  folder: string;
  title: string;
  note_date: string | null;
  updated_at: string;
  created_at: string;
  sealed: boolean;
  opens_on: string | null;
  locked: boolean;
  tags: string[];
  links: string[];
  excerpt: string;
  words: number;
};
