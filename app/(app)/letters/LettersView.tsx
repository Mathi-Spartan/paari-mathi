'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { dur, ease, rise, spring } from '@/lib/motion';

type Letter = { id: string; locked: boolean; opens_on: string | null; body: string; written: string; opens: string | null };

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function Countdown({ iso }: { iso: string }) {
  const now = useNow();
  if (now === null) return <span style={{ height: 66 }} />;
  let s = Math.max(0, Math.floor((new Date(`${iso}T00:00:00+05:30`).getTime() - now) / 1000));
  const y = Math.floor(s / 31557600); s -= y * 31557600;
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); const sec = s - m * 60;
  const cells = [{ v: y, ta: 'ஆண்டு' }, { v: d, ta: 'நாள்' }, { v: h, ta: 'மணி' }, { v: m, ta: 'நிமிடம்' }, { v: sec, ta: 'நொடி' }];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
      {cells.map((c, i) => (
        <div key={c.ta} className="stack" style={{ alignItems: 'center', padding: '10px 0', borderRadius: 14, background: 'rgba(255,255,255,.08)' }}>
          <motion.span key={i === 4 ? c.v : 'x'} className="num" initial={i === 4 ? { y: -8, opacity: 0.3 } : false} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, ease: ease.out }}
            style={{ fontSize: 26, lineHeight: 1, color: i === 4 ? '#FFB48F' : '#fff' }}>{String(c.v).padStart(i > 1 ? 2 : 1, '0')}</motion.span>
          <span style={{ fontSize: 10.5, color: '#BDB8B0', marginTop: 4 }}>{c.ta}</span>
        </div>
      ))}
    </div>
  );
}

export function LettersView({ letters }: { letters: Letter[] }) {
  const sealed = letters.filter((l) => l.locked);
  const open = letters.filter((l) => !l.locked);
  return (
    <main className="shell stack gap-8">
      <motion.header className="stack gap-3" initial="hidden" animate="show" variants={rise}>
        <span className="eyebrow">Letters to grown‑up Paari</span>
        <h1 className="display" style={{ fontSize: 'clamp(44px, 12vw, 60px)' }}>Sealed today.<br /><em>Opened someday.</em></h1>
        <p className="title-ta" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink-2)' }}>அவன் வளர்ந்த பிறகு திறக்க, அப்பா எழுதி வைத்த கடிதங்கள்.</p>
      </motion.header>

      <Link href="/new?kind=letter" className="btn btn-paari shine btn-block" style={{ minHeight: 58 }}>
        <Icon name="letter" size={20} /> புதிய கடிதம் எழுது
      </Link>

      {letters.length === 0 && (
        <motion.div className="card stack gap-2" initial="hidden" animate="show" variants={rise} custom={2} style={{ padding: 24, textAlign: 'center' }}>
          <span className="title-ta" style={{ fontSize: 19 }}>இன்னும் கடிதம் இல்லை</span>
          <span className="muted" style={{ fontSize: 14 }}>Write one now. Choose the day he may open it — his 18th birthday, or a day he might need you.</span>
        </motion.div>
      )}

      {sealed.map((l, i) => (
        <motion.article key={l.id} initial={{ opacity: 0, y: 30, rotateX: 12 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true }} transition={{ ...spring.soft, delay: i * 0.08 }}
          className="stack gap-4" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-xl)', background: 'var(--ink)', color: '#fff', padding: 22, boxShadow: 'var(--shadow-2)', transformPerspective: 900 }}>
          <span className="light paari" style={{ position: 'absolute', width: 220, height: 220, right: -60, top: -90, filter: 'blur(50px)', borderRadius: '50%', opacity: 0.5, mixBlendMode: 'screen' }} />
          <div className="row between" style={{ position: 'relative' }}>
            <span className="row gap-2" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#CFCBC4' }}><Icon name="lock" size={16} /> Sealed</span>
            <motion.span animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2, ease: ease.inOut }}
              style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--paari)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -8px var(--paari)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="#fff" /></svg>
            </motion.span>
          </div>
          <div className="stack gap-1" style={{ position: 'relative' }}>
            <span className="display" style={{ fontSize: 30 }}>Opens {l.opens}</span>
            <span style={{ fontSize: 13.5, color: '#CFCBC4' }}>Written {l.written}</span>
          </div>
          {l.opens_on && <div style={{ position: 'relative' }}><Countdown iso={l.opens_on} /></div>}
        </motion.article>
      ))}

      {open.length > 0 && (
        <section className="stack gap-4">
          <span className="eyebrow">Open letters</span>
          {open.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: dur.slow, ease: ease.out, delay: i * 0.05 }}>
              <Link href={`/m/${l.id}`} className="card stack gap-3" style={{ padding: 22 }}>
                <span className="muted" style={{ fontSize: 13 }}>{l.written}</span>
                <p className="mem-body clamp-4" style={{ color: 'var(--ink)' }}>{l.body}</p>
              </Link>
            </motion.div>
          ))}
        </section>
      )}
    </main>
  );
}
