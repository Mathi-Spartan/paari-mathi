'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar } from '@/components/Calendar';
import { Icon } from '@/components/Icon';
import { describeDate } from '@/lib/dates';
import { ease, spring } from '@/lib/motion';

const pad = (n: number) => String(n).padStart(2, '0');

export function CalendarView({ today, written }: { today: string; written: string[] }) {
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [dir, setDir] = useState(0);
  const set = new Set(written);
  const inYear = written.filter((d) => d.startsWith(String(year))).length;

  return (
    <main className="cal-page">
      <section className="card" style={{ padding: 22 }}>
        <Calendar today={today} selected={null} written={written} size="lg" id="cal-big" />
      </section>

      <section className="stack gap-3" style={{ marginTop: 26 }}>
        <div className="row between">
          <div className="stack">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={year} initial={{ opacity: 0, x: dir * 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }} transition={{ duration: 0.25, ease: ease.out }}
                style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 22 }}>{year}</motion.span>
            </AnimatePresence>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{inYear} நாட்கள் எழுதியது · days written this year</span>
          </div>
          <div className="row" style={{ gap: 2 }}>
            <button className="icon-btn" onClick={() => { setDir(-1); setYear(year - 1); }} aria-label="Previous year"><Icon name="back" size={17} stroke={2.2} /></button>
            <button className="icon-btn" onClick={() => { setDir(1); setYear(year + 1); }} aria-label="Next year"><Icon name="next" size={17} stroke={2.2} /></button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={year} className="year-grid" initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }} transition={spring.soft}>
            {Array.from({ length: 12 }, (_, mi) => {
              const lead = new Date(Date.UTC(year, mi, 1)).getUTCDay();
              const count = new Date(Date.UTC(year, mi + 1, 0)).getUTCDate();
              return (
                <div key={mi} className="stack gap-2" style={{ padding: 12, borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{describeDate(`${year}-${pad(mi + 1)}-01`).monthTa}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3 }}>
                    {Array.from({ length: lead }).map((_, i) => <span key={`e${i}`} />)}
                    {Array.from({ length: count }, (_, di) => {
                      const iso = `${year}-${pad(mi + 1)}-${pad(di + 1)}`;
                      const has = set.has(iso), isToday = iso === today, future = iso > today;
                      const dot = (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring.snappy, delay: mi * 0.03 + di * 0.006 }}
                          style={{ display: 'block', aspectRatio: '1', borderRadius: 3, background: has ? 'var(--appa)' : isToday ? 'var(--paari)' : future ? 'var(--paper-2)' : 'var(--line)' }} />
                      );
                      return future ? <span key={iso}>{dot}</span> : <Link key={iso} href={`/daily/${iso}`} title={describeDate(iso).longTa}>{dot}</Link>;
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}
