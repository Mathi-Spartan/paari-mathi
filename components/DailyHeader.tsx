'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { AnalogClock, useNow } from './Clocks';
import { describeDate } from '@/lib/dates';
import { ease, spring } from '@/lib/motion';

const IST = 5.5 * 3600 * 1000;

export function DailyHeader({ date, isToday, prev, next, age, dayNo, lastEdit, words }: {
  date: string; isToday: boolean; prev: string; next: string | null; age: { ta: string; en: string } | null; dayNo: number | null; lastEdit: string | null; words: number;
}) {
  const d = describeDate(date);
  const now = useNow(1000);
  const dayPct = now === null ? 0 : (((now + IST) % 86400000) / 86400000) * 100;

  return (
    <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: ease.out }}
      style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', columnGap: 20, rowGap: 14, alignItems: 'center', marginBottom: 26 }}>
      <motion.div initial={{ rotate: -40, scale: 0.7, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ ...spring.soft, delay: 0.1 }}
        style={{ borderRadius: '50%', boxShadow: '0 22px 44px -24px rgba(0,0,0,.45)', position: 'relative' }}>
        <AnalogClock size={104} live={isToday} at={isToday ? undefined : lastEdit ?? `${date}T12:00:00+05:30`} />
        {isToday && (
          <svg width="112" height="112" viewBox="0 0 126 126" aria-hidden="true" style={{ position: 'absolute', left: -4, top: -4, pointerEvents: 'none' }}>
            <circle cx="63" cy="63" r="61" fill="none" stroke="var(--paari)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 61} strokeDashoffset={2 * Math.PI * 61 * (1 - dayPct / 100)} transform="rotate(-90 63 63)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
        )}
      </motion.div>
      <div className="stack gap-2" style={{ minWidth: 0 }}>
        <div className="row gap-3" style={{ alignItems: 'flex-end' }}>
          <motion.span className="num" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring.soft, delay: 0.15 }} style={{ fontSize: 66, lineHeight: 0.82 }}>{d.day}</motion.span>
          <span className="stack" style={{ minWidth: 0, paddingBottom: 2 }}>
            <span className="title-ta" style={{ fontSize: 19 }}>{d.monthTa} {d.year}</span>
            <span className="muted" style={{ fontSize: 13 }}>{d.weekdayTa} · {d.weekdayEn}</span>
          </span>
        </div>
      </div>
      <div className="stack gap-3" style={{ gridColumn: '1 / -1' }}>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {isToday && <span className="chip" style={{ background: 'var(--paari-soft)', color: 'var(--paari)' }}>இன்று · {dayPct.toFixed(0)}% of today</span>}
          {age && <span className="chip" style={{ background: 'var(--appa-soft)', color: 'var(--appa)' }}>பாரி · {age.ta}</span>}
          {dayNo ? <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--ink-2)' }}>நாட்குறிப்பு நாள் {dayNo}</span> : null}
          {words > 0 && <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--ink-2)' }}>{words} சொற்கள்</span>}
        </div>
        <div className="row gap-1" style={{ marginTop: 2 }}>
          <Link href={`/daily/${prev}`} className="icon-btn" aria-label="Previous day" style={{ border: '1px solid var(--line)' }}><Icon name="back" size={16} stroke={2.2} /></Link>
          {next ? <Link href={`/daily/${next}`} className="icon-btn" aria-label="Next day" style={{ border: '1px solid var(--line)' }}><Icon name="next" size={16} stroke={2.2} /></Link> : null}
          {!isToday && <Link href="/" className="btn btn-ghost" style={{ minHeight: 36, padding: '0 12px', fontSize: 12.5, marginLeft: 4 }}>இன்றுக்குச் செல் · Today</Link>}
        </div>
      </div>
    </motion.header>
  );
}
