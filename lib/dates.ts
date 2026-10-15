export const TZ = 'Asia/Kolkata';

const MONTHS_TA = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Today's date in India as YYYY-MM-DD. */
export function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d, date: new Date(Date.UTC(y, m - 1, d)) };
}

export function describeDate(iso: string) {
  const { y, m, d, date } = parts(iso);
  const wd = date.getUTCDay();
  return {
    day: d,
    year: y,
    monthTa: MONTHS_TA[m - 1],
    monthEn: MONTHS_EN[m - 1],
    weekdayTa: DAYS_TA[wd],
    weekdayEn: DAYS_EN[wd],
    shortEn: `${d} ${MONTHS_EN[m - 1].slice(0, 3)} ${y}`,
    longTa: `${d} ${MONTHS_TA[m - 1]} ${y}`,
  };
}

export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((parts(toIso).date.getTime() - parts(fromIso).date.getTime()) / 86400000);
}

/** "6 வயது 3 மாதம்" style age of Paari on a given date. */
export function ageOn(birthIso: string | null | undefined, onIso: string) {
  if (!birthIso) return null;
  const b = parts(birthIso), o = parts(onIso);
  let months = (o.y - b.y) * 12 + (o.m - b.m);
  if (o.d < b.d) months -= 1;
  if (months < 0) return null;
  const years = Math.floor(months / 12), rem = months % 12;
  const ta = years > 0 ? `${years} வயது${rem ? ` ${rem} மாதம்` : ''}` : `${rem} மாதம்`;
  const en = years > 0 ? `${years} yr${years > 1 ? 's' : ''}${rem ? ` ${rem} mo` : ''}` : `${rem} months`;
  return { ta, en };
}

export function addYears(iso: string, n: number) {
  const { y, m, d } = parts(iso);
  return `${y + n}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
