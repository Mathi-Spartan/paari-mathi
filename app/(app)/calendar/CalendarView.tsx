'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@/components/Icon';
import { AnalogClock, LiveTime, Roll, useNow } from '@/components/Clocks';
import { describeDate } from '@/lib/dates';
import { ease, spring } from '@/lib/motion';

type Day = { words: number; excerpt: string; tags: string[] };
const WEEK_TA = ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'];
const pad = (n: number) => String(n).padStart(2, '0');

export function CalendarView({ today, days }: { today: string; days: Record<string, Day> }) {
  const [ty, tm] = today.split('-').map(Number);
  const [[y, m, dir], setYM] = useState<[number, number, number]>([ty, tm, 0]);
  const [hover, setHover] = useState<string | null>(null);
  const now = useNow(1000);
  const shift = (d: number) => setYM(([yy, mm]) => { let n = mm + d, yr = yy; if (n < 1) { n = 12; yr--; } if (n > 12) { n = 1; yr++; } return [yr, n, d]; });

  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = first.getUTCDay();
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`)];
  const written = cells.filter((c) => c && days[c]).length;
  const monthLabel = describeDate(`${y}-${pad(m)}-01`);
  const isThisMonth = y === ty && m === tm;
  const elapsed = isThisMonth ? Number(today.slice(8)) : (y < ty || (y === ty && m < tm)) ? count : 0;
  const monthPct = isThisMonth && now !== null ? ((Number(today.slice(8)) - 1 + (((now + 19800000) % 86400000) / 86400000)) / count) * 100 : elapsed ? 100 : 0;
  const R = 70, C = 2 * Math.PI * R;
  const preview = hover && days[hover] ? { iso: hover, ...days[hover] } : null;

  // year strip: every day of the selected year as a tiny square
  const yearDays = Array.from({ length: 12 }, (_, mi) => Array.from({ length: new Date(Date.UTC(y, mi + 1, 0)).getUTCDate() }, (_, di) => `${y}-${pad(mi + 1)}-${pad(di + 1)}`));

  return (
    <main className="page">
      <div className="two-col">
        {/* month clock */}
        <motion.section className="card stack gap-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: ease.out }} style={{ padding: 22, alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow">மாதக் கடிகாரம் · Month clock</span>
          <div style={{ position: 'relative', width: 160, height: 160 }}>
            <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="80" cy="80" r={R} fill="none" stroke="var(--paper-2)" strokeWidth="8" />
              <motion.circle key={`${y}-${m}`} cx="80" cy="80" r={R} fill="none" stroke="var(--appa)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} transform="rotate(-90 80 80)"
                initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - monthPct / 100) }} transition={{ duration: 1.4, ease: ease.out }} />
            </svg>
            <div style={{ position: 'absolute', inset: 22 }}><AnalogClock size={116} live ticks={false} /></div>
          </div>
          <LiveTime size={22} />
          <div className="stack">
            <span className="title-ta" style={{ fontSize: 18 }}>{monthLabel.monthTa} {y}</span>
            <span className="muted" style={{ fontSize: 13 }}>{monthPct.toFixed(1)}% of the month has passed</span>
          </div>
          <div className="row gap-3" style={{ justifyContent: 'center' }}>
            <span className="stack" style={{ alignItems: 'center' }}><Roll value={String(written)} size={34} color="var(--appa)" /><span style={{ fontSize: 12, color: 'var(--muted)' }}>எழுதிய நாட்கள்</span></span>
            <span style={{ width: 1, height: 36, background: 'var(--line)' }} />
            <span className="stack" style={{ alignItems: 'center' }}><Roll value={String(Math.max(0, elapsed - written))} size={34} color="var(--paari)" /><span style={{ fontSize: 12, color: 'var(--muted)' }}>காத்திருக்கும் பக்கங்கள்</span></span>
          </div>
        </motion.section>

        {/* month grid */}
        <section className="card stack gap-3" style={{ padding: 18, minWidth: 0 }}>
          <div className="row between">
            <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month" style={{ border: '1px solid var(--line)' }}><Icon name="back" size={17} stroke={2.2} /></button>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={`${y}-${m}`} className="stack" style={{ alignItems: 'center' }} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -30 }} transition={{ duration: 0.3, ease: ease.out }}>
                <span className="title-ta" style={{ fontSize: 22 }}>{monthLabel.monthTa} {y}</span>
                <span className="muted" style={{ fontSize: 12.5 }}>{monthLabel.monthEn} · {written} pages written</span>
              </motion.div>
            </AnimatePresence>
            <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month" style={{ border: '1px solid var(--line)' }}><Icon name="next" size={17} stroke={2.2} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
            {WEEK_TA.map((w) => <span key={w} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--muted)', padding: '4px 0' }}>{w}</span>)}
          </div>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={`${y}-${m}`} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }} transition={{ duration: 0.3, ease: ease.out }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
              {cells.map((c, i) => {
                if (!c) return <span key={i} />;
                const has = !!days[c]; const isToday = c === today; const future = c > today;
                const content = (
                  <>
                    {isToday && <motion.span animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }} transition={{ repeat: Infinity, duration: 2.2 }} style={{ position: 'absolute', inset: -2, borderRadius: 12, border: '2px solid var(--paari)' }} />}
                    <span style={{ fontSize: 14, fontWeight: isToday ? 700 : 500 }}>{Number(c.slice(8))}</span>
                    {has && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.bouncy, delay: 0.1 + i * 0.012 }} style={{ width: Math.min(14, 5 + days[c].words / 25), height: 5, borderRadius: 3, background: 'var(--appa)' }} />}
                  </>
                );
                const style: React.CSSProperties = { position: 'relative', aspectRatio: '1', minHeight: 44, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: has ? 'var(--appa-soft)' : 'transparent', color: future ? 'var(--faint)' : has ? 'var(--appa)' : 'var(--ink)', border: '1px solid', borderColor: has ? 'transparent' : 'var(--line)' };
                return future ? <span key={c} style={style}>{content}</span> : (
                  <motion.div key={c} whileHover={{ y: -2 }} whileTap={{ scale: 0.92 }} onHoverStart={() => setHover(c)} onHoverEnd={() => setHover(null)}>
                    <Link href={`/daily/${c}`} style={style} aria-label={`${c}${has ? ', has a note' : ''}`}>{content}</Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {preview && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--side)', fontSize: 13.5 }}>
                <b>{describeDate(preview.iso).longTa}</b> — {preview.excerpt || '…'}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* year of love */}
      <section className="card stack gap-3" style={{ padding: 18, marginTop: 22, overflowX: 'auto' }}>
        <div className="row between">
          <span className="title-ta" style={{ fontSize: 17 }}>{y} — அன்பின் ஆண்டு · A year of pages</span>
          <span className="muted" style={{ fontSize: 12.5 }}>{yearDays.flat().filter((d) => days[d]).length} days written</span>
        </div>
        <div className="stack" style={{ gap: 4, minWidth: 560 }}>
          {yearDays.map((row, mi) => (
            <div key={mi} className="row" style={{ gap: 3 }}>
              <span style={{ width: 78, fontSize: 11, color: 'var(--muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{describeDate(`${y}-${pad(mi + 1)}-01`).monthTa}</span>
              {row.map((d, di) => (
                <motion.span key={d} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: mi * 0.03 + di * 0.004, ...spring.snappy }} title={d}
                  style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0, background: days[d] ? 'var(--appa)' : d === today ? 'var(--paari)' : d > today ? 'var(--paper-2)' : 'var(--line)' }} />
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
