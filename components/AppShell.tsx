'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { Calendar } from './Calendar';
import { lockNow } from '@/app/actions';
import { describeDate } from '@/lib/dates';
import { spring } from '@/lib/motion';

type Entry = { date: string; excerpt: string };

export function AppShell({ today, entries, children }: { today: string; entries: Entry[]; children: React.ReactNode }) {
  const path = usePathname();
  const selected = path.startsWith('/daily/') ? path.slice(7, 17) : null;
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { setDrawer(false); }, [path]);
  const written = entries.map((e) => e.date);

  const side = (id: string) => (
    <div className="side-inner">
      <div className="row between" style={{ padding: '18px 18px 6px' }}>
        <Link href="/" className="row gap-2">
          <span style={{ position: 'relative', width: 24, height: 16 }} aria-hidden="true">
            <span style={{ position: 'absolute', left: 0, width: 16, height: 16, borderRadius: 8, background: 'var(--appa)' }} />
            <span style={{ position: 'absolute', left: 8, width: 16, height: 16, borderRadius: 8, background: 'var(--paari)', mixBlendMode: 'multiply' }} />
          </span>
          <span className="stack" style={{ lineHeight: 1.2 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>பாரிக்கு, அப்பா</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>A journal for Paari</span>
          </span>
        </Link>
        <form action={lockNow}><button className="icon-btn" aria-label="Lock the journal" title="Lock"><Icon name="lock" size={17} /></button></form>
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        <Calendar today={today} selected={selected} written={written} id={id} />
      </div>

      <div className="row between" style={{ padding: '10px 18px 6px', borderTop: '1px solid var(--line)' }}>
        <span className="eyebrow">பக்கங்கள் · Entries</span>
        <Link href="/calendar" style={{ fontSize: 12, fontWeight: 600, color: 'var(--appa)' }}>முழு நாட்காட்டி</Link>
      </div>
      <div className="stack" style={{ padding: '0 8px 16px', gap: 2 }}>
        {entries.length === 0 && <span style={{ padding: '6px 10px', fontSize: 13, color: 'var(--faint)' }}>முதல் பக்கம் இன்னும் எழுதப்படவில்லை.</span>}
        {entries.slice(0, 60).map((e, i) => {
          const d = describeDate(e.date);
          const on = e.date === selected;
          return (
            <motion.div key={e.date} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}>
              <Link href={`/daily/${e.date}`} className={`entry ${on ? 'active' : ''}`}>
                <span className="stack" style={{ alignItems: 'center', width: 34, flexShrink: 0 }}>
                  <span className="num" style={{ fontSize: 22, lineHeight: 1 }}>{d.day}</span>
                  <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{d.monthEn.slice(0, 3)}</span>
                </span>
                <span className="stack" style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{d.weekdayTa}{e.date === today ? ' · இன்று' : ''}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.excerpt}</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="app">
      <aside className="side side-desktop" aria-label="Calendar and entries">{side('cal-d')}</aside>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside className="side side-drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={spring.soft} aria-label="Calendar and entries">{side('cal-m')}</motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setDrawer(true)} aria-label="Open calendar"><Icon name="calendar" size={21} /></button>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>பாரிக்கு, அப்பா</span>
          {selected !== today && <Link href={`/daily/${today}`} className="btn btn-blue" style={{ minHeight: 34, padding: '0 12px', fontSize: 12.5 }}>இன்று</Link>}
        </header>
        {children}
      </div>
    </div>
  );
}
