'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, animate } from 'motion/react';
import { Icon } from '@/components/Icon';
import { AnalogClock, Countdown, LifeClock, LiveTime } from '@/components/Clocks';
import { saveBirthday } from '@/app/actions';
import { describeDate } from '@/lib/dates';
import { formatDuration, momentOf } from '@/lib/moments';
import { ease, rise } from '@/lib/motion';

type Recent = { date: string; excerpt: string; moments: string[] };
type NextLetter = { title: string; opensOn: string; writtenOn: string } | null;

function CountUp({ to, format }: { to: number; format?: (n: number) => string }) {
  const [v, setV] = useState(0);
  useEffect(() => { const c = animate(0, to, { duration: 1.4, ease: ease.out, onUpdate: (x) => setV(x) }); return () => c.stop(); }, [to]);
  return <>{format ? format(v) : Math.round(v).toLocaleString('en-IN')}</>;
}

export function CoverView({ today, birth, writtenToday, stats, recent, nextLetter }: {
  today: string; birth: string | null; writtenToday: boolean;
  stats: { days: number; moments: number; together: number; letters: number };
  recent: Recent[]; nextLetter: NextLetter;
}) {
  const d = describeDate(today);
  const router = useRouter();
  const [bday, setBday] = useState('');
  const [pending, start] = useTransition();

  const tiles = [
    { label: 'Pages written', value: stats.days, icon: 'book' as const, color: 'var(--appa)' },
    { label: 'Moments marked', value: stats.moments, icon: 'moment' as const, color: 'var(--paari)' },
    { label: 'Time together', value: stats.together, icon: 'timer' as const, color: '#0E9F76', fmt: (n: number) => (stats.together ? formatDuration(n) : '0 min') },
    { label: 'Letters sealed', value: stats.letters, icon: 'letter' as const, color: '#7A4FD8' },
  ];

  return (
    <main className="home">
      <motion.section className="cover" variants={rise} initial="hidden" animate="show" custom={0}>
        <div className="lights" aria-hidden="true"><span className="light appa" /><span className="light paari" /></div>
        <div className="cover-text">
          <span className="eyebrow">{d.weekdayEn}, {d.day} {d.monthEn} {d.year}</span>
          <h1 className="display" style={{ fontSize: 'clamp(46px, 7vw, 76px)' }}>For Paari,<br /><em>with love.</em></h1>
          <p className="title-ta" style={{ fontSize: 17, color: 'var(--ink-2)' }}>பாரிக்கு, அன்புடன் அப்பா</p>
          <p style={{ margin: 0, color: 'var(--muted)', maxWidth: 420, fontSize: 15 }}>Every page here is a day I watched you grow. One day you will read them all, and know how much you were loved.</p>
          <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            <Link href={`/daily/${today}`} className="btn btn-blue"><Icon name="pen" size={17} />{writtenToday ? "Continue today's page" : "Write today's page"}</Link>
            <Link href="/letters" className="btn btn-line"><Icon name="letter" size={17} />Letters</Link>
          </div>
        </div>
        <div className="cover-clock">
          <AnalogClock size={210} live />
          <LiveTime size={22} />
        </div>
      </motion.section>

      <motion.section className="card stack gap-3" style={{ padding: 22 }} variants={rise} initial="hidden" animate="show" custom={1}>
        <div className="row gap-3">
          <span className="badge" style={{ background: 'var(--paari-soft)', color: 'var(--paari)' }}><Icon name="clock" size={18} /></span>
          <span className="stack">
            <span style={{ fontWeight: 650, fontSize: 15 }}>Paari&apos;s clock <span className="ta-note">பாரியின் காலம்</span></span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{birth ? `Born ${describeDate(birth).day} ${describeDate(birth).monthEn} ${describeDate(birth).year}` : 'Add his birthday to start his clock'}</span>
          </span>
        </div>
        {birth ? <LifeClock birth={birth} /> : (
          <form className="row gap-2" style={{ flexWrap: 'wrap' }} onSubmit={(e) => { e.preventDefault(); if (bday) start(async () => { await saveBirthday(bday); router.refresh(); }); }}>
            <label htmlFor="bday" style={{ position: 'absolute', left: -9999 }}>Paari&apos;s birthday</label>
            <input id="bday" type="date" className="input" max={today} value={bday} onChange={(e) => setBday(e.target.value)} />
            <button className="btn btn-blue" disabled={!bday || pending}>Save birthday</button>
          </form>
        )}
      </motion.section>

      <section className="stat-grid">
        {tiles.map((t, i) => (
          <motion.div key={t.label} className="card stat" variants={rise} initial="hidden" animate="show" custom={2 + i * 0.5}>
            <span style={{ color: t.color, display: 'flex' }}><Icon name={t.icon} size={20} /></span>
            <span className="num" style={{ fontSize: 36, lineHeight: 1 }}><CountUp to={t.value} format={t.fmt} /></span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{t.label}</span>
          </motion.div>
        ))}
      </section>

      <div className="home-two">
        <motion.section className="card stack gap-2" style={{ padding: 20 }} variants={rise} initial="hidden" animate="show" custom={4}>
          <div className="row between">
            <span style={{ fontWeight: 650, fontSize: 15 }}>Latest moments</span>
            <Link href="/moments" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--appa)' }}>See all →</Link>
          </div>
          {recent.length === 0 && <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>Mark a day as Proud, First time or Milestone and it will appear here.</p>}
          {recent.map((r, i) => {
            const rd = describeDate(r.date);
            return (
              <motion.div key={r.date} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.07 }}>
                <Link href={`/daily/${r.date}`} className="entry" style={{ alignItems: 'flex-start' }}>
                  <span className="stack" style={{ alignItems: 'center', width: 36, flexShrink: 0 }}>
                    <span className="num" style={{ fontSize: 24, lineHeight: 1 }}>{rd.day}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{rd.monthEn.slice(0, 3)}{rd.year !== d.year ? ` '${String(rd.year).slice(2)}` : ''}</span>
                  </span>
                  <span className="stack gap-1" style={{ minWidth: 0 }}>
                    <span className="row" style={{ gap: 5, flexWrap: 'wrap' }}>
                      {r.moments.map((id) => { const m = momentOf(id); return m ? <span key={id} className="mini-chip" style={{ background: m.soft, color: m.color }}>{m.en}</span> : null; })}
                    </span>
                    {r.excerpt && <span className="clamp-2" style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{r.excerpt}</span>}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.section>

        <motion.section className="card stack gap-3" style={{ padding: 20 }} variants={rise} initial="hidden" animate="show" custom={4.5}>
          <div className="row between">
            <span style={{ fontWeight: 650, fontSize: 15 }}>Next letter opens in</span>
            <Link href="/letters" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--appa)' }}>Letters →</Link>
          </div>
          {nextLetter ? (
            <>
              <span className="row gap-2" style={{ fontSize: 14 }}><Icon name="letter" size={16} color="#7A4FD8" /><strong style={{ fontWeight: 650 }}>{nextLetter.title}</strong></span>
              <Countdown target={nextLetter.opensOn} from={nextLetter.writtenOn} compact />
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Opens on {describeDate(nextLetter.opensOn).shortEn}</span>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>Write a letter for grown-up Paari and seal it until a day you choose, like his 18th birthday.</p>
              <Link href="/letters" className="btn btn-line" style={{ alignSelf: 'flex-start' }}><Icon name="plus" size={16} />Write the first letter</Link>
            </>
          )}
        </motion.section>
      </div>
    </main>
  );
}
