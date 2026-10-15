'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AnalogClock, LifeClock, LiveTime, ReadingCountdown, Roll, useNow } from '@/components/Clocks';
import { TogetherTimer } from '@/components/TogetherTimer';
import { describeDate } from '@/lib/dates';
import { ease, spring } from '@/lib/motion';

const card = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: ease.out, delay: i * 0.08 } });

export function ClocksView({ today, birth, readingDay, readingLabel, written, thisYear, streak, togetherMin }: {
  today: string; birth: string | null; readingDay: string | null; readingLabel: string | null; written: number; thisYear: number; streak: number; togetherMin: number;
}) {
  const now = useNow(1000);
  const d = describeDate(today);
  const start = Date.UTC(Number(today.slice(0, 4)), 0, 1) - 19800000;
  const end = Date.UTC(Number(today.slice(0, 4)) + 1, 0, 1) - 19800000;
  const yearPct = now === null ? 0 : ((now - start) / (end - start)) * 100;
  const dayOfYear = Math.floor(((now ?? start) - start) / 86400000) + 1;
  const R = 54, C = 2 * Math.PI * R;

  return (
    <main className="page">
      <div className="stack" style={{ marginBottom: 18 }}>
        <span className="eyebrow">Clocks</span>
        <h1 className="title-ta" style={{ fontSize: 24 }}>காலத்தின் கடிகாரங்கள் · The clocks of our time</h1>
        <span className="muted" style={{ fontSize: 13.5 }}>Every clock here measures something about you and Paari.</span>
      </div>

      <div className="grid-cards">
        {/* now */}
        <motion.section {...card(0)} className="card stack gap-3" style={{ padding: 22, alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <span className="eyebrow">இப்போது · Now, in India</span>
          <motion.div initial={{ rotate: -30, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={spring.soft} style={{ borderRadius: '50%', boxShadow: '0 26px 50px -26px rgba(0,0,0,.45)' }}>
            <AnalogClock size={190} live />
          </motion.div>
          <LiveTime size={30} />
          <span className="title-ta" style={{ fontSize: 17 }}>{d.weekdayTa}, {d.day} {d.monthTa} {d.year}</span>
        </motion.section>

        {/* Paari's life */}
        <motion.section {...card(1)} className="card stack gap-4" style={{ padding: 22 }}>
          <span className="eyebrow" style={{ color: 'var(--paari)' }}>பாரியின் வாழ்க்கைக் கடிகாரம் · Paari&apos;s life clock</span>
          {birth ? <LifeClock birth={birth} /> : <Link href="/you" className="btn btn-ghost">Add Paari&apos;s birthday to start his clock →</Link>}
          <div className="stack gap-2" style={{ paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <span className="eyebrow">இந்த ஆண்டு · This year</span>
            <div className="row gap-4">
              <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
                <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true">
                  <circle cx="64" cy="64" r={R} fill="none" stroke="var(--paper-2)" strokeWidth="10" />
                  <motion.circle cx="64" cy="64" r={R} fill="none" stroke="var(--paari)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} transform="rotate(-90 64 64)" initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - yearPct / 100) }} transition={{ duration: 1.6, ease: ease.out }} />
                </svg>
                <span className="stack" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <span className="num" style={{ fontSize: 26 }}>{yearPct.toFixed(1)}%</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>நாள் {dayOfYear}</span>
                </span>
              </div>
              <span className="stack gap-1" style={{ fontSize: 13.5 }}>
                <span><b>{thisYear}</b> பக்கங்கள் இந்த ஆண்டு</span>
                <span className="muted">{thisYear} of {dayOfYear} days of {today.slice(0, 4)} have a page for Paari.</span>
              </span>
            </div>
          </div>
        </motion.section>

        {/* until he reads */}
        {readingDay && (
          <motion.section {...card(2)} className="stack gap-4" style={{ padding: 22, borderRadius: 'var(--r-lg)', background: '#1C1C1C', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <span className="light" style={{ width: 260, height: 260, right: -90, top: -120, background: 'var(--paari)', opacity: 0.4 }} />
            <span className="eyebrow" style={{ color: '#CFCBC4', position: 'relative' }}>பாரி இதைப் படிக்கும் நாள் வரை · Until {readingLabel}</span>
            <div style={{ position: 'relative' }}><ReadingCountdown target={readingDay} birth={birth} dark /></div>
          </motion.section>
        )}

        {/* journal streak */}
        <motion.section {...card(3)} className="card stack gap-4" style={{ padding: 22 }}>
          <span className="eyebrow" style={{ color: 'var(--appa)' }}>நாட்குறிப்பு · The journal so far</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            {[{ v: written, ta: 'பக்கங்கள்', en: 'pages' }, { v: streak, ta: 'தொடர் நாட்கள்', en: 'day streak' }, { v: togetherMin, ta: 'நிமிடங்கள்', en: 'together' }].map((s) => (
              <div key={s.en} className="stack" style={{ alignItems: 'center', padding: '14px 4px', borderRadius: 'var(--r-md)', background: 'var(--side)' }}>
                <Roll value={String(s.v)} size={34} color="var(--appa)" />
                <span style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>{s.ta}</span>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{s.en}</span>
              </div>
            ))}
          </div>
          <Link href={`/daily/${today}`} className="btn btn-blue">இன்றைய பக்கம் எழுது · Write today</Link>
        </motion.section>

        {/* together */}
        <motion.div {...card(4)}><TogetherTimer todaySeconds={0} /></motion.div>
      </div>
    </main>
  );
}
