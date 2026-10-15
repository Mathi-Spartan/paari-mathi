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

function istDate(iso: string) { return new Date(`${iso}T00:00:00+05:30`).getTime(); }

/** Paari's life clock: years, days and a ticking hh:mm:ss since he was born. */
export function LifeClock({ birth }: { birth: string }) {
  const now = useNow();
  if (now === null) return <div style={{ height: 120 }} />;
  const b = new Date(istDate(birth));
  const n = new Date(now + IST_OFFSET);
  let years = n.getUTCFullYear() - b.getUTCFullYear();
  const lastBirthday = Date.UTC(n.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()) - IST_OFFSET;
  let since = now - lastBirthday;
  if (since < 0) { years -= 1; since = now - (Date.UTC(n.getUTCFullYear() - 1, b.getUTCMonth(), b.getUTCDate()) - IST_OFFSET); }
  const days = Math.floor(since / 86400000);
  const rest = Math.floor((since % 86400000) / 1000);
  const totalDays = Math.floor((now - b.getTime()) / 86400000);
  return (
    <div className="stack gap-2">
      <div className="row gap-3" style={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span className="row" style={{ alignItems: 'baseline', gap: 6 }}><Roll value={String(years)} size={46} /><span className="title-ta" style={{ fontSize: 15 }}>வயது</span></span>
        <span className="row" style={{ alignItems: 'baseline', gap: 6 }}><Roll value={String(days)} size={46} /><span className="title-ta" style={{ fontSize: 15 }}>நாட்கள்</span></span>
      </div>
      <div className="row gap-2" style={{ alignItems: 'baseline' }}>
        <Roll value={`${pad(Math.floor(rest / 3600))}:${pad(Math.floor((rest % 3600) / 60))}:${pad(rest % 60)}`} size={26} color="var(--paari)" />
        <span className="muted" style={{ fontSize: 13 }}>· {totalDays.toLocaleString('en-IN')} days of Paari</span>
      </div>
    </div>
  );
}

/** Flip-tile countdown to the day Paari reads the journal, with a journey bar from birth to that day. */
export function ReadingCountdown({ target, birth, dark = false }: { target: string; birth: string | null; dark?: boolean }) {
  const now = useNow();
  if (now === null) return <div style={{ height: 150 }} />;
  const end = istDate(target);
  let s = Math.max(0, Math.floor((end - now) / 1000));
  const y = Math.floor(s / 31557600); s -= y * 31557600;
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); const sec = s - m * 60;
  const start = birth ? istDate(birth) : null;
  const pct = start ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100)) : null;
  const ink = dark ? '#fff' : 'var(--ink)';
  const cells = [{ v: String(y), ta: 'ஆண்டு' }, { v: String(d), ta: 'நாள்' }, { v: pad(h), ta: 'மணி' }, { v: pad(m), ta: 'நிமி' }, { v: pad(sec), ta: 'நொடி' }];
  return (
    <div className="stack gap-4">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
        {cells.map((c, i) => (
          <div key={c.ta} className="stack" style={{ alignItems: 'center', padding: '12px 0 8px', borderRadius: 14, background: dark ? 'rgba(255,255,255,.08)' : 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', left: 6, right: 6, top: '46%', height: 1, background: dark ? 'rgba(255,255,255,.12)' : 'rgba(19,19,19,.06)' }} />
            <Roll value={c.v} size={27} color={i === 4 ? 'var(--paari)' : ink} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: dark ? '#BDB8B0' : 'var(--muted)', marginTop: 4 }}>{c.ta}</span>
          </div>
        ))}
      </div>
      {pct !== null && (
        <div className="stack gap-2">
          <div style={{ position: 'relative', height: 8, borderRadius: 4, background: dark ? 'rgba(255,255,255,.12)' : 'var(--paper-2)', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.8, ease: ease.out, delay: 0.3 }}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4, background: 'linear-gradient(90deg, var(--appa), var(--paari))' }} />
          </div>
          <div className="row between" style={{ fontSize: 12, color: dark ? '#BDB8B0' : 'var(--muted)' }}>
            <span>பிறந்த நாள்</span>
            <span style={{ fontWeight: 600, color: dark ? '#fff' : 'var(--ink)' }}>{pct.toFixed(2)}% of the journey</span>
            <span>படிக்கும் நாள்</span>
          </div>
        </div>
      )}
    </div>
  );
}

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
