'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { Roll } from './Clocks';
import { ACTIVITIES, formatDuration } from '@/lib/kinds';
import { appendTogether } from '@/app/actions';
import { spring } from '@/lib/motion';

type T = { running: boolean; startedAt: number | null; banked: number; activity: string };
const KEY = 'pm_together_timer';
const EMPTY: T = { running: false, startedAt: null, banked: 0, activity: 'play' };

function load(): T {
  try { const v = localStorage.getItem(KEY); return v ? { ...EMPTY, ...JSON.parse(v) } : EMPTY; } catch { return EMPTY; }
}
function store(t: T) { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* storage unavailable */ } }

const pad = (n: number) => String(n).padStart(2, '0');

/** A stopwatch for time spent with Paari. It survives reloads, and stopping it opens a journal page with the time filled in. */
export function TogetherTimer({ todaySeconds }: { todaySeconds: number }) {
  const [t, setT] = useState<T>(EMPTY);
  const [now, setNow] = useState(0);
  useEffect(() => { setT(load()); setNow(Date.now()); }, []);
  useEffect(() => {
    if (!t.running) return;
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, [t.running]);
  const update = (n: T) => { setT(n); store(n); setNow(Date.now()); };

  const elapsed = Math.floor(t.banked + (t.running && t.startedAt ? (now - t.startedAt) / 1000 : 0));
  const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60;
  const secFrac = t.running && t.startedAt ? ((t.banked + (now - t.startedAt) / 1000) % 60) / 60 : (elapsed % 60) / 60;
  const minFrac = (elapsed % 3600) / 3600;
  const R1 = 88, R2 = 74, C1 = 2 * Math.PI * R1, C2 = 2 * Math.PI * R2;

  const start = () => update({ ...t, running: true, startedAt: Date.now() });
  const pause = () => update({ ...t, running: false, startedAt: null, banked: elapsed });
  const finish = () => {
    const secs = elapsed; const act = t.activity;
    update(EMPTY);
    const a = ACTIVITIES.find((x) => x.id === act);
    appendTogether(Math.max(60, secs) / 60, a ? a.ta : 'ஒன்றாக');
  };
  const started = elapsed > 0 || t.running;
  const today = formatDuration(todaySeconds);

  return (
    <section className="card stack gap-5" style={{ padding: 22, borderRadius: 'var(--r-xl)', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      <div className="row between" style={{ width: '100%' }}>
        <div className="stack">
          <span className="eyebrow" style={{ color: 'var(--k-together)' }}>Together timer</span>
          <span className="title-ta" style={{ fontSize: 19 }}>நம் நேரம்</span>
        </div>
        <span className="chip" style={{ background: 'var(--k-together-soft)', color: 'var(--k-together)' }}>
          <Icon name="timer" size={15} /> இன்று {todaySeconds ? today.ta : '0 நிமிடம்'}
        </span>
      </div>

      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <AnimatePresence>
          {t.running && [0, 1].map((i) => (
            <motion.span key={i} initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1.3, opacity: 0 }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 20, borderRadius: '50%', background: 'var(--k-together-soft)' }} />
          ))}
        </AnimatePresence>
        <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <line key={i} x1="100" y1="2" x2="100" y2={i % 5 ? 6 : 9} stroke="var(--ink)" strokeOpacity={i % 5 ? 0.15 : 0.4} strokeWidth={i % 5 ? 1 : 1.6} transform={`rotate(${i * 6} 100 100)`} />
          ))}
          <circle cx="100" cy="100" r={R1} fill="none" stroke="var(--paper-2)" strokeWidth="8" />
          <circle cx="100" cy="100" r={R1} fill="none" stroke="var(--k-together)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C1} strokeDashoffset={C1 * (1 - secFrac)} transform="rotate(-90 100 100)" style={{ transition: t.running ? 'stroke-dashoffset 250ms linear' : 'none' }} />
          <circle cx="100" cy="100" r={R2} fill="none" stroke="var(--paper-2)" strokeWidth="4" />
          <circle cx="100" cy="100" r={R2} fill="none" stroke="var(--paari)" strokeWidth="4" strokeLinecap="round" strokeDasharray={C2} strokeDashoffset={C2 * (1 - minFrac)} transform="rotate(-90 100 100)" />
        </svg>
        <div className="stack" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Roll value={h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`} size={h ? 36 : 46} />
          <span className="muted" style={{ fontSize: 12.5 }}>{t.running ? 'அவனுடன் இருக்கிறாய்' : started ? 'இடைநிறுத்தப்பட்டது' : 'Phone down. His world.'}</span>
        </div>
      </div>

      <div className="hscroll" style={{ width: 'calc(100% + 44px)', margin: '0 -22px', padding: '2px 22px 6px' }}>
        {ACTIVITIES.map((a) => {
          const on = t.activity === a.id;
          return (
            <motion.button key={a.id} whileTap={{ scale: 0.92 }} onClick={() => update({ ...t, activity: a.id })} aria-pressed={on}
              style={{ height: 38, padding: '0 14px', borderRadius: 'var(--r-pill)', border: '1px solid', borderColor: on ? 'var(--k-together)' : 'var(--line)', background: on ? 'var(--k-together)' : 'var(--surface)', color: on ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 600 }}>
              {a.ta}
            </motion.button>
          );
        })}
      </div>

      <div className="row gap-3" style={{ width: '100%' }}>
        <motion.button layout whileTap={{ scale: 0.95 }} transition={spring.snappy} onClick={t.running ? pause : start} className="btn" style={{ flex: 1, background: t.running ? 'var(--ink)' : 'var(--k-together)', color: '#fff', minHeight: 56 }}>
          <Icon name={t.running ? 'pause' : 'play'} size={18} stroke={2.4} />
          {t.running ? 'இடைநிறுத்து' : started ? 'தொடர்' : 'தொடங்கு · Start'}
        </motion.button>
        <AnimatePresence>
          {started && (
            <motion.button initial={{ opacity: 0, scale: 0.6, width: 0 }} animate={{ opacity: 1, scale: 1, width: 'auto' }} exit={{ opacity: 0, scale: 0.6, width: 0 }} transition={spring.bouncy}
              onClick={finish} className="btn btn-ghost" style={{ minHeight: 56, whiteSpace: 'nowrap' }}>
              <Icon name="check" size={18} stroke={2.4} /> நாட்குறிப்பில் சேர்
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
