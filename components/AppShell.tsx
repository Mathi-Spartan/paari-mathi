'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Icon, type IconName } from './Icon';
import { Calendar } from './Calendar';
import { lockNow } from '@/app/actions';
import { describeDate } from '@/lib/dates';
import { momentOf } from '@/lib/moments';
import { spring } from '@/lib/motion';

type Entry = { date: string; excerpt: string; moments: string[] };

function Mark() {
  return (
    <span style={{ position: 'relative', width: 26, height: 18, flexShrink: 0 }} aria-hidden="true">
      <span style={{ position: 'absolute', left: 0, width: 18, height: 18, borderRadius: 9, background: 'var(--appa)' }} />
      <span style={{ position: 'absolute', left: 8, width: 18, height: 18, borderRadius: 9, background: 'var(--paari)', mixBlendMode: 'multiply' }} />
    </span>
  );
}

export function AppShell({ today, entries, children }: { today: string; entries: Entry[]; children: React.ReactNode }) {
  const path = usePathname();
  const selected = path.startsWith('/daily/') ? path.slice(7, 17) : null;
  const marks = Object.fromEntries(entries.map((e) => [e.date, e.moments]));

  const nav: { href: string; label: string; icon: IconName; active: boolean }[] = [
    { href: '/', label: 'Home', icon: 'home', active: path === '/' },
    { href: `/daily/${today}`, label: 'Today', icon: 'pen', active: selected === today },
    { href: '/moments', label: 'Moments', icon: 'moment', active: path.startsWith('/moments') },
    { href: '/letters', label: 'Letters', icon: 'letter', active: path.startsWith('/letters') },
    { href: '/calendar', label: 'Calendar', icon: 'calendar', active: path.startsWith('/calendar') },
  ];

  return (
    <div className="app">
      <aside className="side" aria-label="Journal navigation">
        <div className="side-inner">
          <div className="row between" style={{ padding: '18px 16px 10px 18px' }}>
            <Link href="/" className="row gap-2">
              <Mark />
              <span className="stack" style={{ lineHeight: 1.2 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>Paari&apos;s Journal</span>
                <span className="ta-note" style={{ fontSize: 12, marginLeft: 0 }}>பாரிக்கு, அப்பா</span>
              </span>
            </Link>
            <form action={lockNow}><button className="icon-btn" aria-label="Lock the journal" title="Lock"><Icon name="lock" size={17} /></button></form>
          </div>

          <nav className="stack" style={{ padding: '6px 10px 12px', gap: 2 }}>
            {nav.map((n) => (
              <Link key={n.label} href={n.href} className={`nav-item ${n.active ? 'on' : ''}`}>
                {n.active && <motion.span layoutId="nav-on" className="nav-on" transition={spring.snappy} />}
                <Icon name={n.icon} size={18} />
                <span style={{ position: 'relative' }}>{n.label}</span>
              </Link>
            ))}
          </nav>

          <div style={{ padding: '14px 16px 16px', borderTop: '1px solid var(--line)' }}>
            <Calendar today={today} selected={selected} marks={marks} id="cal-side" />
          </div>

          <div className="row between" style={{ padding: '12px 18px 6px', borderTop: '1px solid var(--line)' }}>
            <span className="eyebrow">Recent pages</span>
          </div>
          <div className="stack" style={{ padding: '0 8px 18px', gap: 2 }}>
            {entries.length === 0 && <span style={{ padding: '6px 10px', fontSize: 13, color: 'var(--faint)' }}>Your first page is waiting.</span>}
            {entries.slice(0, 30).map((e, i) => {
              const d = describeDate(e.date);
              return (
                <motion.div key={e.date} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}>
                  <Link href={`/daily/${e.date}`} className={`entry ${e.date === selected ? 'active' : ''}`}>
                    <span className="stack" style={{ alignItems: 'center', width: 32, flexShrink: 0 }}>
                      <span className="num" style={{ fontSize: 22, lineHeight: 1 }}>{d.day}</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{d.monthEn.slice(0, 3)}{d.year !== Number(today.slice(0, 4)) ? ` '${String(d.year).slice(2)}` : ''}</span>
                    </span>
                    <span className="stack" style={{ minWidth: 0, flex: 1 }}>
                      <span className="row gap-1" style={{ fontSize: 12, fontWeight: 600 }}>
                        {d.weekdayEn}{e.date === today ? ' · Today' : ''}
                        {e.moments.map((id) => <span key={id} style={{ width: 6, height: 6, borderRadius: 3, background: momentOf(id)?.color }} />)}
                      </span>
                      <span style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.excerpt || 'Marked, not written'}</span>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <Link href="/" className="row gap-2" style={{ flex: 1, minWidth: 0 }}>
            <Mark />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Paari&apos;s Journal</span>
          </Link>
          <form action={lockNow}><button className="icon-btn" aria-label="Lock the journal"><Icon name="lock" size={18} /></button></form>
        </header>
        {children}
      </div>

      <nav className="tabbar" aria-label="Journal sections">
        {nav.map((n) => (
          <Link key={n.label} href={n.href} className={`tab ${n.active ? 'on' : ''}`} aria-current={n.active ? 'page' : undefined}>
            {n.active && <motion.span layoutId="tab-on" className="tab-on" transition={spring.snappy} />}
            <Icon name={n.icon} size={21} stroke={n.active ? 2.1 : 1.8} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
