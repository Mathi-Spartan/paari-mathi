'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@/components/Icon';
import { describeDate } from '@/lib/dates';
import { MOMENTS, momentOf } from '@/lib/moments';
import { spring } from '@/lib/motion';

type Item = { date: string; excerpt: string; moments: string[] };

export function MomentsView({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState<string>('all');
  const shown = filter === 'all' ? items : items.filter((i) => i.moments.includes(filter));
  const groups: { key: string; label: string; items: Item[] }[] = [];
  for (const it of shown) {
    const key = it.date.slice(0, 7);
    const d = describeDate(it.date);
    if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, label: `${d.monthEn} ${d.year}`, items: [] });
    groups[groups.length - 1].items.push(it);
  }
  const count = (id: string) => items.filter((i) => i.moments.includes(id)).length;

  return (
    <main className="wide-page stack gap-5">
      <header className="stack gap-1">
        <span className="eyebrow">Proud days, firsts and milestones</span>
        <h1 className="display" style={{ fontSize: 'clamp(38px, 6vw, 56px)' }}>Moments <span className="ta-note" style={{ fontSize: 20, fontFamily: 'var(--font-head)' }}>தருணங்கள்</span></h1>
      </header>

      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {[{ id: 'all', en: 'All', color: 'var(--ink)', soft: 'var(--paper-2)' }, ...MOMENTS].map((m) => {
          const on = filter === m.id;
          return (
            <motion.button key={m.id} type="button" whileTap={{ scale: 0.92 }} onClick={() => setFilter(m.id)} aria-pressed={on} className="moment-chip"
              style={{ borderColor: on ? m.color : 'var(--line)', background: on ? m.soft : 'var(--bg)', color: on ? m.color : 'var(--ink-2)' }}>
              {m.en}<span style={{ opacity: 0.6, fontWeight: 500 }}>{m.id === 'all' ? items.length : count(m.id)}</span>
            </motion.button>
          );
        })}
      </div>

      {shown.length === 0 && (
        <div className="card stack gap-2" style={{ padding: 28, alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 650 }}>No moments here yet</span>
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>On any day&apos;s page, tap Proud, First time, Milestone, Our time or Hard day to mark it.</span>
          <Link href="/daily" className="btn btn-blue" style={{ marginTop: 6 }}><Icon name="pen" size={16} />Open today&apos;s page</Link>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {groups.map((g) => (
          <motion.section key={`${filter}-${g.key}`} layout className="stack gap-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.soft}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>{g.label}</span>
            <div className="timeline">
              {g.items.map((it, i) => {
                const d = describeDate(it.date);
                const lead = momentOf(it.moments[0]);
                return (
                  <motion.div key={it.date} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="tl-item">
                    <span className="tl-dot" style={{ background: lead?.color ?? 'var(--appa)' }} />
                    <Link href={`/daily/${it.date}`} className="card tl-card">
                      <span className="row between gap-2">
                        <span style={{ fontWeight: 650, fontSize: 14.5 }}>{d.weekdayEn}, {d.day} {d.monthEn.slice(0, 3)}</span>
                        <Icon name="next" size={15} color="var(--faint)" />
                      </span>
                      <span className="row" style={{ gap: 5, flexWrap: 'wrap' }}>
                        {it.moments.map((id) => { const m = momentOf(id); return m ? <span key={id} className="mini-chip" style={{ background: m.soft, color: m.color }}>{m.en}</span> : null; })}
                      </span>
                      {it.excerpt && <span className="clamp-2" style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{it.excerpt}</span>}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </AnimatePresence>
    </main>
  );
}
