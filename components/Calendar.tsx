'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { describeDate } from '@/lib/dates';
import { momentOf } from '@/lib/moments';
import { ease, spring } from '@/lib/motion';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Obsidian-style month calendar: slides between months, written days glow, today pulses, the open day morphs between cells. */
export function Calendar({ today, selected, marks, size = 'sm', id = 'cal' }: { today: string; selected: string | null; marks: Record<string, string[]>; size?: 'sm' | 'lg'; id?: string }) {
  const base = selected ?? today;
  const [[y, m, dir], setYM] = useState<[number, number, number]>([Number(base.slice(0, 4)), Number(base.slice(5, 7)), 0]);
  useEffect(() => { if (selected) setYM(([yy, mm]) => { const ny = Number(selected.slice(0, 4)), nm = Number(selected.slice(5, 7)); return ny === yy && nm === mm ? [yy, mm, 0] : [ny, nm, ny * 12 + nm > yy * 12 + mm ? 1 : -1]; }); }, [selected]);
  const shift = (d: number) => setYM(([yy, mm]) => { let n = mm + d, yr = yy; if (n < 1) { n = 12; yr--; } if (n > 12) { n = 1; yr++; } return [yr, n, d]; });

  const set = new Set(Object.keys(marks));
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`)];
  const monthWritten = cells.filter((c) => c && set.has(c)).length;
  const label = describeDate(`${y}-${pad(m)}-01`);
  const lg = size === 'lg';
  const cell = lg ? 52 : 34;
  const atToday = y === Number(today.slice(0, 4)) && m === Number(today.slice(5, 7));

  return (
    <div className="stack" style={{ gap: lg ? 14 : 8 }}>
      <div className="row between">
        <div className="stack" style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.span key={`${y}-${m}`} initial={{ opacity: 0, y: dir * 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: dir * -8 }} transition={{ duration: 0.22, ease: ease.out }}
              style={{ fontFamily: 'var(--font-display)', fontSize: lg ? 30 : 20, lineHeight: 1.1 }}>
              {label.monthEn} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{y}</span>
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="row" style={{ gap: 2 }}>
          {!atToday && (
            <button className="icon-btn" onClick={() => setYM(([yy, mm]) => { const ty = Number(today.slice(0, 4)), tm = Number(today.slice(5, 7)); return [ty, tm, ty * 12 + tm > yy * 12 + mm ? 1 : -1]; })}
              style={{ width: 'auto', padding: '0 8px', fontSize: 12, fontWeight: 600, color: 'var(--paari)' }}>Today</button>
          )}
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month" style={{ width: 30, height: 30 }}><Icon name="back" size={16} stroke={2.2} /></button>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month" style={{ width: 30, height: 30 }}><Icon name="next" size={16} stroke={2.2} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: lg ? 6 : 2 }}>
        {WEEK.map((w, i) => <span key={i} style={{ textAlign: 'center', fontSize: lg ? 12.5 : 10.5, fontWeight: 600, color: 'var(--faint)', paddingBottom: 2 }}>{w}</span>)}
      </div>

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div key={`${y}-${m}`} custom={dir}
            initial={{ x: dir * 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: dir * -60, opacity: 0 }} transition={{ ...spring.soft }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: lg ? 6 : 2 }}>
            {cells.map((c, i) => {
              if (!c) return <span key={`e${i}`} />;
              const has = set.has(c), isToday = c === today, isSel = c === selected, future = c > today;
              const inner = (
                <>
                  {isSel && <motion.span layoutId={`${id}-sel`} transition={spring.snappy} style={{ position: 'absolute', inset: 0, borderRadius: lg ? 14 : 9, background: 'var(--appa)', boxShadow: '0 8px 18px -10px var(--appa)' }} />}
                  {isToday && !isSel && <motion.span animate={{ scale: [1, 1.12, 1], opacity: [0.9, 0.35, 0.9] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }} style={{ position: 'absolute', inset: 1, borderRadius: lg ? 13 : 8, border: '1.6px solid var(--paari)' }} />}
                  <span style={{ position: 'relative', fontSize: lg ? 15 : 12.5, fontWeight: isToday || isSel ? 700 : 500, color: isSel ? '#fff' : future ? 'var(--faint)' : has ? 'var(--appa)' : 'var(--ink-2)' }}>{Number(c.slice(8))}</span>
                  {has && (
                    <span style={{ position: 'relative', display: 'flex', gap: 2 }}>
                      {(marks[c].length ? marks[c].slice(0, 3) : ['']).map((id, k) => (
                        <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.bouncy, delay: 0.05 + i * 0.008 + k * 0.04 }}
                          style={{ width: lg ? 6 : 4, height: lg ? 6 : 4, borderRadius: 3, background: isSel ? '#fff' : momentOf(id)?.color ?? 'var(--appa)' }} />
                      ))}
                    </span>
                  )}
                </>
              );
              const style: React.CSSProperties = { position: 'relative', height: cell, borderRadius: lg ? 14 : 9, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: lg ? 4 : 1, background: has && !isSel ? 'var(--appa-soft)' : 'transparent' };
              return future ? <span key={c} style={style}>{inner}</span> : (
                <motion.div key={c} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.9 }} transition={spring.snappy}
                  initial={dir ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transitionDelay: `${i * 8}ms` }}>
                  <Link href={`/daily/${c}`} style={style} aria-label={`${describeDate(c).shortEn}${has ? ' — written' : ''}`} aria-current={isSel ? 'date' : undefined}>{inner}</Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="row gap-2" style={{ fontSize: lg ? 13 : 11.5, color: 'var(--muted)' }}>
        <span style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--appa)' }} />
        {monthWritten} {monthWritten === 1 ? 'day' : 'days'} written in {label.monthEn}
      </div>
    </div>
  );
}
