'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { saveDay } from '@/app/actions';
import { describeDate } from '@/lib/dates';
import { ease, spring } from '@/lib/motion';

export function JournalPage({ date, today, body, prev, next }: { date: string; today: string; body: string; prev: string; next: string | null }) {
  const [text, setText] = useState(body);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const first = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const d = describeDate(date);
  const isToday = date === today;

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => { await saveDay(date, text); setStatus('saved'); }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [text, date]);

  const words = (text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length;

  return (
    <motion.article className="journal" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: ease.out }}>
      <header className="row between gap-3" style={{ alignItems: 'flex-end', marginBottom: 28 }}>
        <div className="row gap-4" style={{ alignItems: 'flex-end', minWidth: 0 }}>
          <motion.span className="num" key={date} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft} style={{ fontSize: 72, lineHeight: 0.8 }}>{d.day}</motion.span>
          <span className="stack" style={{ minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 21, lineHeight: 1.3 }}>{d.monthTa} {d.year}</span>
            <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{d.weekdayTa} · {d.weekdayEn}{isToday ? ' · இன்று' : ''}</span>
          </span>
        </div>
        <div className="row" style={{ gap: 4, flexShrink: 0 }}>
          <Link href={`/daily/${prev}`} className="icon-btn" aria-label="Previous day"><Icon name="back" size={18} stroke={2.2} /></Link>
          {next ? <Link href={`/daily/${next}`} className="icon-btn" aria-label="Next day"><Icon name="next" size={18} stroke={2.2} /></Link> : <span style={{ width: 36 }} />}
        </div>
      </header>

      <label htmlFor="page" style={{ position: 'absolute', left: -9999 }}>Journal entry for {d.longTa}</label>
      <textarea id="page" className="writer" value={text} onChange={(e) => setText(e.target.value)} autoFocus={isToday && !body}
        placeholder={isToday ? 'இன்று பாரியைப் பற்றி… · Write about Paari today' : 'இந்த நாளைப் பற்றி எழுது… · Write about this day'} />

      <footer className="row between" style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: 12.5, color: 'var(--muted)' }}>
        <span>{words} சொற்கள்</span>
        <AnimatePresence mode="wait">
          <motion.span key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="row gap-1">
            {status === 'saving' && <><motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--paari)' }} /> சேமிக்கிறது…</>}
            {status === 'saved' && <><Icon name="check" size={13} stroke={2.6} color="var(--appa)" /> சேமிக்கப்பட்டது</>}
            {status === 'idle' && 'தானாகச் சேமிக்கப்படும் · saves as you type'}
          </motion.span>
        </AnimatePresence>
      </footer>
    </motion.article>
  );
}
