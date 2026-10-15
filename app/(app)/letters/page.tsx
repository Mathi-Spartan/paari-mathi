import Link from 'next/link';
import { allNotes } from '@/lib/notes';
import { describeDate } from '@/lib/dates';
import { createNote } from '@/app/actions';
import { Icon } from '@/components/Icon';
import { LetterCountdown } from './LetterCountdown';

export const dynamic = 'force-dynamic';

export default async function LettersPage() {
  const letters = (await allNotes()).filter((n) => n.folder === 'letters');
  return (
    <main className="page" style={{ maxWidth: 760 }}>
      <div className="stack gap-2" style={{ marginBottom: 20 }}>
        <span className="eyebrow">Letters to grown-up Paari</span>
        <h1 className="title-ta" style={{ fontSize: 26 }}>கடிதங்கள் — இன்று முத்திரை, ஒருநாள் திறப்பு</h1>
        <span className="muted" style={{ fontSize: 14 }}>Sealed today. Opened by Paari someday. Each one counts down to its day.</span>
      </div>
      <form action={createNote.bind(null, 'letters', undefined)} style={{ marginBottom: 20 }}>
        <button className="btn btn-ink" style={{ width: '100%', minHeight: 50 }}><Icon name="letter" size={18} /> புதிய கடிதம் எழுது · Write a new letter</button>
      </form>
      <div className="stack gap-4">
        {letters.length === 0 && <div className="card" style={{ padding: 22, color: 'var(--muted)' }}>இன்னும் கடிதம் இல்லை. Write the first one — choose the day he may open it.</div>}
        {letters.map((l, i) => (
          <Link key={l.id} href={`/note/${l.id}`} className="stack gap-3" style={{ padding: 20, borderRadius: 'var(--r-lg)', background: l.locked ? '#1C1C1C' : 'var(--bg)', color: l.locked ? '#fff' : 'var(--ink)', border: l.locked ? 0 : '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
            {l.locked && <span className="light" style={{ width: 220, height: 220, right: -70, top: -100, background: 'var(--paari)', opacity: 0.4 }} />}
            <div className="row between" style={{ position: 'relative' }}>
              <span className="row gap-2" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', color: l.locked ? '#CFCBC4' : 'var(--muted)' }}>
                <Icon name={l.locked ? 'lock' : 'letter'} size={15} /> {l.locked ? 'SEALED' : 'OPEN'} · எழுதியது {describeDate(l.created_at.slice(0, 10)).shortEn}
              </span>
            </div>
            <span style={{ position: 'relative', fontFamily: 'var(--font-head)', fontSize: 21, fontWeight: 700 }}>{l.title}</span>
            {l.locked && l.opens_on ? (
              <div style={{ position: 'relative' }}><LetterCountdown target={l.opens_on} label={describeDate(l.opens_on).shortEn} delay={i * 0.1} /></div>
            ) : (
              <span style={{ position: 'relative', fontSize: 14, color: 'var(--muted)' }}>{l.excerpt}</span>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
