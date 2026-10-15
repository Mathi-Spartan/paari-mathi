export type KindId = 'moment' | 'noticed' | 'milestone' | 'proud' | 'letter';

export type Kind = {
  id: KindId;
  ta: string;
  en: string;
  /** CSS custom property holding this kind's colour. Colour means "kind", nothing else. */
  color: string;
  soft: string;
  promptTa: string;
  promptEn: string;
  placeholder: string;
};

export const KINDS: Kind[] = [
  {
    id: 'moment', ta: 'தருணம்', en: 'A moment', color: 'var(--k-moment)', soft: 'var(--k-moment-soft)',
    promptTa: 'இன்று எந்த நொடி என்றும் நினைவில் இருக்க வேண்டும்?', promptEn: 'Which moment from today should live forever?',
    placeholder: 'அவன் என் விரலைப் பிடித்துக்கொண்டே தூங்கிவிட்டான்…',
  },
  {
    id: 'noticed', ta: 'கவனித்தேன்', en: 'I noticed', color: 'var(--k-noticed)', soft: 'var(--k-noticed-soft)',
    promptTa: 'அமைதியாக அவனைக் கவனித்தபோது என்ன கண்டாய்?', promptEn: 'What did you see when you quietly watched him?',
    placeholder: 'சுழலும் மின்விசிறியை நீண்ட நேரம் பார்த்துக்கொண்டிருந்தான்…',
  },
  {
    id: 'milestone', ta: 'முதல் முறை', en: 'First time', color: 'var(--k-milestone)', soft: 'var(--k-milestone-soft)',
    promptTa: 'அவன் இன்று முதல் முறையாகச் செய்தது என்ன?', promptEn: 'What did he do for the very first time?',
    placeholder: 'முதல் முறையாக என்னைப் பார்த்து "அப்பா" என்றான்…',
  },
  {
    id: 'proud', ta: 'பெருமை', en: 'Proud of you', color: 'var(--k-proud)', soft: 'var(--k-proud-soft)',
    promptTa: 'இன்று பாரி உன்னை எப்படிப் பெருமைப்படுத்தினான்?', promptEn: 'How did Paari make you proud today?',
    placeholder: 'கூட்டத்திலும் பயப்படாமல் என் கையைப் பிடித்து நடந்தான்…',
  },
  {
    id: 'letter', ta: 'கடிதம்', en: 'A letter to him', color: 'var(--k-letter)', soft: 'var(--k-letter-soft)',
    promptTa: 'வளர்ந்த பாரிக்கு ஒரு கடிதம்.', promptEn: 'A letter for grown-up Paari to open one day.',
    placeholder: 'என் பாரிக்கு, நீ இதைப் படிக்கும் நாளில்…',
  },
];

export function kindOf(id: string | null | undefined): Kind {
  return KINDS.find((k) => k.id === id) ?? KINDS[0];
}

export const FEELINGS = [
  { id: 'calm', ta: 'அமைதி', en: 'Calm' },
  { id: 'joy', ta: 'சிரிப்பு', en: 'Joy' },
  { id: 'new', ta: 'புதிது', en: 'Something new' },
  { id: 'hard', ta: 'கடினமான நாள்', en: 'A hard day' },
  { id: 'together', ta: 'நாம் இருவர்', en: 'Just us two' },
];

export const DAILY_PROMPTS = [
  { ta: 'இன்று பாரியின் கண்கள் எதைத் தேடின?', en: "What were Paari's eyes looking for today?" },
  { ta: 'இன்று அவன் உன்னை எப்படி அழைத்தான் — சொல்லாமல்?', en: 'How did he reach for you today, without words?' },
  { ta: 'இன்று அவனை அமைதிப்படுத்தியது எது?', en: 'What calmed him today?' },
  { ta: 'இன்று நீ அவனிடம் கற்றுக்கொண்டது என்ன?', en: 'What did he teach you today?' },
  { ta: 'இன்று அவன் சிரித்த அந்த ஒரு நொடி?', en: 'The one moment he smiled today?' },
  { ta: 'வளர்ந்த பாரி இன்றைய நாளைப் பற்றி என்ன தெரிந்துகொள்ள வேண்டும்?', en: 'What should grown-up Paari know about today?' },
  { ta: 'இன்று நீங்கள் இருவரும் சேர்ந்து அமைதியாக இருந்த நேரம்?', en: 'A quiet moment the two of you shared today?' },
];
