'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { Roll, timeLabel } from './Clocks';
import { ACTIVITIES, activityOf, formatDuration } from '@/lib/moments';
import { addTogether, removeTogether } from '@/app/actions';
import { spring } from '@/lib/motion';

type T = { running: boolean; startedAt: number | null; banked: number; activity: string };
const KEY = 'pm_together_timer_v2';
const EMPTY: T = { running: false, startedAt: null, banked: 0, activity: 'play' };
const GREEN = '#0E9F76', GREEN_SOFT = '#E3F6EF';

function load(): T {
  try { const v = localStorage.getItem(KEY); return v ? { ...EMPTY, ...JSON.parse(v) } : EMPTY; } catch { return EMPTY; }
}
function store(t: T) { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* storage unavailable */ } }
const pad = (n: number) => String(n).padStart(2, '0');

type Session = { id: number; seconds: number; activity: string; at: string };

/** A stopwatch for time spent with Paari. It survives reloads; saving logs the session on today's page. */
export function TogetherTimer({ sessions, live }: { sessions: Session[]; live: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
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
  const R1 = 80, R2 = 67, C1 = 2 * Math.PI * R1, C2 = 2 * Math.PI * R2;
  const started = elapsed > 0 || t.running;
  const total = sessions.reduce((a, x) => a + x.seconds, 0);

  const save = () => {
    const secs = elapsed, act = t.activity;
    update(EMPTY);
    start(async () => { await addTogether(secs, act); router.refresh(); });
  };

  return (
    <section className="card stack gap-4" style={{ padding: 20 }}>
      <div className="row between gap-3">
        <div className="row gap-3">
          <span className="badge" style={{ background: GREEN_SOFT, color: GREEN }}><Icon name="timer" size={18} /></span>
          <span className="stack">
            <span style={{ fontWeight: 650, fontSize: 15 }}>Time together <span className="ta-note">நம் நேரம்</span></span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{total ? `${formatDuration(total)} with Paari on this day` : live ? 'Phone down. Start the clock when you are with him.' : 'No time logged on this day.'}</span>
          </span>
        </div>
      </div>

      {live && (
        <div className="timer-body">
          <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
            <AnimatePresence>
              {t.running && [0, 1].map((i) => (
                <motion.span key={i} initial={{ scale: 0.8, opacity: 0.55 }} animate={{ scale: 1.25, opacity: 0 }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
                  style={{ position: 'absolute', inset: 18, borderRadius: '50%', background: GREEN_SOFT }} />
              ))}
            </AnimatePresence>
            <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
              {Array.from({ length: 60 }).map((_, i) => (
                <line key={i} x1="90" y1="2" x2="90" y2={i % 5 ? 5 : 8} stroke="var(--ink)" strokeOpacity={i % 5 ? 0.15 : 0.4} strokeWidth={i % 5 ? 1 : 1.6} transform={`rotate(${i * 6} 90 90)`} />
              ))}
              <circle cx="90" cy="90" r={R1} fill="none" stroke="var(--paper-2)" strokeWidth="8" />
              <circle cx="90" cy="90" r={R1} fill="none" stroke={GREEN} strokeWidth="8" strokeLinecap="round" strokeDasharray={C1} strokeDashoffset={C1 * (1 - secFrac)} transform="rotate(-90 90 90)" style={{ transition: t.running ? 'stroke-dashoffset 250ms linear' : 'none' }} />
              <circle cx="90" cy="90" r={R2} fill="none" stroke="var(--paper-2)" strokeWidth="4" />
              <circle cx="90" cy="90" r={R2} fill="none" stroke="var(--paari)" strokeWidth="4" strokeLinecap="round" strokeDasharray={C2} strokeDashoffset={C2 * (1 - minFrac)} transform="rotate(-90 90 90)" />
            </svg>
            <div className="stack" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Roll value={h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`} size={h ? 32 : 40} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.running ? 'with Paari' : started ? 'paused' : 'ready'}</span>
            </div>
          </div>

          <div className="stack gap-3" style={{ flex: 1, minWidth: 0, width: '100%' }}>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {ACTIVITIES.map((a) => {
                const on = t.activity === a.id;
                return (
                  <motion.button key={a.id} type="button" whileTap={{ scale: 0.92 }} onClick={() => update({ ...t, activity: a.id })} aria-pressed={on} className="pill"
                    style={{ borderColor: on ? GREEN : 'var(--line)', background: on ? GREEN : 'var(--bg)', color: on ? '#fff' : 'var(--ink-2)' }}>
                    {a.en}
                  </motion.button>
                );
              })}
            </div>
            <div className="row gap-2">
              <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={t.running ? () => update({ ...t, running: false, startedAt: null, banked: elapsed }) : () => update({ ...t, running: true, startedAt: Date.now() })}
                className="btn" style={{ flex: 1, background: t.running ? 'var(--ink)' : GREEN, color: '#fff' }}>
                <Icon name={t.running ? 'pause' : 'play'} size={17} stroke={2.4} />
                {t.running ? 'Pause' : started ? 'Resume' : 'Start'}
              </motion.button>
              <AnimatePresence>
                {started && (
                  <motion.button type="button" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={spring.bouncy}
                    onClick={save} disabled={pending} className="btn btn-line">
                    <Icon name="check" size={17} stroke={2.4} /> Save
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="stack" style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
          <AnimatePresence initial={false}>
            {sessions.map((x) => (
              <motion.div key={x.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="row between" style={{ padding: '7px 0', fontSize: 13.5 }}>
                <span className="row gap-2"><span style={{ width: 7, height: 7, borderRadius: 4, background: GREEN }} />{activityOf(x.activity)}<span style={{ color: 'var(--faint)' }}>· {timeLabel(x.at)}</span></span>
                <span className="row gap-2">
                  <strong style={{ fontWeight: 650 }}>{formatDuration(x.seconds)}</strong>
                  <button type="button" className="icon-btn" style={{ width: 28, height: 28 }} aria-label="Remove this session" onClick={() => start(async () => { await removeTogether(x.id); router.refresh(); })}><Icon name="close" size={14} /></button>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
