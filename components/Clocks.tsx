'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ease, spring } from '@/lib/motion';

const IST_OFFSET = 5.5 * 3600 * 1000;

/** Hours/minutes/seconds (fractional) in India time for a timestamp. */
function istParts(ms: number) {
  const t = (ms + IST_OFFSET) / 1000;
  const s = t % 60;
  const m = (t / 60) % 60;
  const h = (t / 3600) % 12;
  return { h, m, s };
}

/**
 * A real analog clock. `live` sweeps the second hand smoothly with rAF;
 * otherwise it freezes at `at` (e.g. the moment an entry was written).
 */
export function AnalogClock({ size = 160, live = false, at, showSeconds = true, face = 'light', ticks = true }: {
  size?: number; live?: boolean; at?: string | number; showSeconds?: boolean; face?: 'light' | 'dark'; ticks?: boolean;
}) {
  const hRef = useRef<SVGLineElement>(null);
  const mRef = useRef<SVGLineElement>(null);
  const sRef = useRef<SVGGElement>(null);
  const fixed = at !== undefined ? (typeof at === 'number' ? at : Date.parse(at)) : Date.now();
  const init = istParts(fixed);
  const ink = face === 'dark' ? '#FFFFFF' : '#131313';
  const bg = face === 'dark' ? 'rgba(255,255,255,.06)' : '#FFFFFF';

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    const tick = () => {
      const { h, m, s } = istParts(Date.now());
      hRef.current?.setAttribute('transform', `rotate(${(h + m / 60) * 30} 50 50)`);
      mRef.current?.setAttribute('transform', `rotate(${(m + s / 60) * 6} 50 50)`);
      sRef.current?.setAttribute('transform', `rotate(${s * 6} 50 50)`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  const small = size < 48;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Clock" style={{ flexShrink: 0, overflow: 'visible' }}>
      <circle cx="50" cy="50" r="48" fill={bg} stroke={ink} strokeOpacity={small ? 0.85 : 0.12} strokeWidth={small ? 5 : 1.2} />
      {ticks && !small && Array.from({ length: 60 }).map((_, i) => {
        const major = i % 5 === 0;
        return <line key={i} x1="50" y1={major ? 6 : 6.5} x2="50" y2={major ? 13 : 9} stroke={ink} strokeOpacity={major ? 0.85 : 0.25} strokeWidth={major ? 1.8 : 0.8} strokeLinecap="round" transform={`rotate(${i * 6} 50 50)`} />;
      })}
      {!small && [12, 3, 6, 9].map((n, i) => {
        const a = (i * 90 - 90) * (Math.PI / 180);
        return <text key={n} x={50 + Math.cos(a) * 29} y={50 + Math.sin(a) * 29 + 4.5} textAnchor="middle" fontFamily="'Instrument Serif', serif" fontSize="13" fill={ink} opacity="0.75">{n}</text>;
      })}
      <line ref={hRef} x1="50" y1="50" x2="50" y2={small ? 28 : 27} stroke={ink} strokeWidth={small ? 7 : 4.2} strokeLinecap="round" transform={`rotate(${(init.h + init.m / 60) * 30} 50 50)`} />
      <line ref={mRef} x1="50" y1="50" x2="50" y2={small ? 16 : 14} stroke={ink} strokeWidth={small ? 5.5 : 2.8} strokeLinecap="round" transform={`rotate(${(init.m + init.s / 60) * 6} 50 50)`} />
      {showSeconds && !small && (
        <g ref={sRef} transform={`rotate(${init.s * 6} 50 50)`}>
          <line x1="50" y1="60" x2="50" y2="10" stroke="var(--paari)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="50" cy="10" r="2.2" fill="var(--paari)" />
        </g>
      )}
      <circle cx="50" cy="50" r={small ? 6 : 3.4} fill="var(--paari)" />
    </svg>
  );
}

/** Each character rolls in like a flip clock when it changes. */
export function Roll({ value, size = 32, color, tile = false }: { value: string; size?: number; color?: string; tile?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', fontFamily: "'Instrument Serif', serif", fontSize: size, lineHeight: 1, color, fontVariantNumeric: 'tabular-nums' }} aria-label={value}>
      {value.split('').map((ch, i) => (
        <span key={i} aria-hidden="true" style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', height: size * 1.08, width: /\d/.test(ch) ? size * 0.52 : 'auto', textAlign: 'center', ...(tile ? { background: 'rgba(19,19,19,.05)', borderRadius: 6, margin: '0 1px', width: size * 0.62 } : {}) }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={ch} initial={{ y: '-100%', opacity: 0, filter: 'blur(2px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }} exit={{ y: '100%', opacity: 0 }} transition={{ ...spring.snappy }}
              style={{ display: 'inline-block', paddingTop: size * 0.04 }}>
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

const pad = (n: number) => String(n).padStart(2, '0');
/** Digital India-time readout, ticking. */
export function LiveTime({ size = 15, color }: { size?: number; color?: string }) {
  const now = useNow();
  if (now === null) return <span style={{ fontSize: size }}>&nbsp;</span>;
  const { h, m, s } = istParts(now);
  const hh = Math.floor(h) === 0 ? 12 : Math.floor(h);
  const pm = Math.floor(((now + IST_OFFSET) / 3600000) % 24) >= 12;
  return (
    <span className="row" style={{ alignItems: 'baseline', gap: 4 }}>
      <Roll value={`${hh}:${pad(Math.floor(m))}:${pad(Math.floor(s))}`} size={size} color={color} />
      <span style={{ fontSize: size * 0.55, fontWeight: 600, color: color ?? 'var(--muted)' }}>{pm ? 'PM' : 'AM'}</span>
    </span>
  );
}

/** "6:40 PM" for a timestamp, in India time. */
export function timeLabel(at: string) {
  return new Date(at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
}

function istMidnight(iso: string) { return new Date(`${iso}T00:00:00+05:30`).getTime(); }

/** Paari's age, live: years, months and days, plus a ticking clock of today's hours with him. */
export function LifeClock({ birth }: { birth: string }) {
  const now = useNow();
  if (now === null) return <div style={{ height: 132 }} />;
  const n = new Date(now + IST_OFFSET);
  const [by, bm, bd] = birth.split('-').map(Number);
  let years = n.getUTCFullYear() - by;
  let months = n.getUTCMonth() + 1 - bm;
  let days = n.getUTCDate() - bd;
  if (days < 0) { months -= 1; days += new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 0)).getUTCDate(); }
  if (months < 0) { years -= 1; months += 12; }
  const total = Math.floor((now - istMidnight(birth)) / 86400000);
  const secToday = Math.floor(((now + IST_OFFSET) / 1000) % 86400);
  const unit = (v: number, label: string) => (
    <span className="row" style={{ alignItems: 'baseline', gap: 6 }}>
      <Roll value={String(v)} size={44} />
      <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
    </span>
  );
  return (
    <div className="stack gap-3">
      <div className="row" style={{ alignItems: 'baseline', flexWrap: 'wrap', columnGap: 18, rowGap: 4 }}>
        {unit(years, years === 1 ? 'year' : 'years')}
        {unit(months, months === 1 ? 'month' : 'months')}
        {unit(days, days === 1 ? 'day' : 'days')}
      </div>
      <div className="row gap-2" style={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Roll value={total.toLocaleString('en-IN')} size={22} color="var(--appa)" />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>days of Paari ·</span>
        <Roll value={`${pad(Math.floor(secToday / 3600))}:${pad(Math.floor((secToday % 3600) / 60))}:${pad(secToday % 60)}`} size={18} color="var(--paari)" />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>into today</span>
      </div>
    </div>
  );
}

/** Flip-tile countdown to an opening day, with a bar from the day it was written. */
export function Countdown({ target, from, compact = false }: { target: string; from?: string; compact?: boolean }) {
  const now = useNow();
  if (now === null) return <div style={{ height: compact ? 58 : 96 }} />;
  const end = istMidnight(target);
  let s = Math.max(0, Math.floor((end - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); const sec = s - m * 60;
  const cells = [{ v: d.toLocaleString('en-IN'), l: 'days' }, { v: pad(h), l: 'hours' }, { v: pad(m), l: 'min' }, { v: pad(sec), l: 'sec' }];
  const start = from ? istMidnight(from) : null;
  const pct = start !== null && end > start ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100)) : null;
  const size = compact ? 20 : 28;
  return (
    <div className="stack gap-3">
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 6 }}>
        {cells.map((c, i) => (
          <div key={c.l} className="stack" style={{ alignItems: 'center', padding: compact ? '8px 0 6px' : '12px 0 8px', borderRadius: 12, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', left: 6, right: 6, top: '45%', height: 1, background: 'rgba(19,19,19,.06)' }} />
            <Roll value={c.v} size={size} color={i === 3 ? 'var(--paari)' : 'var(--ink)'} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{c.l}</span>
          </div>
        ))}
      </div>
      {pct !== null && (
        <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'var(--paper-2)', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.6, ease: ease.out, delay: 0.2 }}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3, background: 'linear-gradient(90deg, var(--appa), var(--paari))' }} />
        </div>
      )}
    </div>
  );
}
