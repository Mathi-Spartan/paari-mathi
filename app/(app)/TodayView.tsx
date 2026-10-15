'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Lights, Wordmark } from '@/components/Lights';
import { Icon, type IconName } from '@/components/Icon';
import { CountUp } from '@/components/CountUp';
import { AnalogClock, LifeClock, LiveTime, ReadingCountdown } from '@/components/Clocks';
import { TogetherTimer } from '@/components/TogetherTimer';
import { JournalDay, groupByDay, type JournalEntry } from '@/components/JournalDay';
import { MemoryCard } from '@/components/MemoryCard';
import { saveSettings } from '@/app/actions';
import { KINDS, formatDuration } from '@/lib/kinds';
import type { describeDate } from '@/lib/dates';
import { dur, ease, rise, spring } from '@/lib/motion';

type Props = {
  date: ReturnType<typeof describeDate>;
  birth: string | null;
  readingDay: string | null;
  readingDayLabel: string | null;
  prompt: { ta: string; en: string };
  stats: { total: number; photos: number; proud: number; letters: number; first: string | null; days: number; together_all: number; together_today: number; together_month: number };
  dayNumber: number;
  recent: JournalEntry[];
  todayCount: number;
  onThisDay: JournalEntry[];
  saved: number | null;
};

export function TodayView(p: Props) {
  const router = useRouter();
  const [toast, setToast] = useState(p.saved);
  const [birthInput, setBirthInput] = useState('');
  const [pending, start] = useTransition();
  useEffect(() => {
    if (p.saved === null) return;
    const t = setTimeout(() => { setToast(null); router.replace('/', { scroll: false }); }, 3800);
    return () => clearTimeout(t);
  }, [p.saved, router]);

  const days = groupByDay(p.recent);
  const together = formatDuration(p.stats.together_month);

  return (
    <main className="shell stack gap-6">
      <AnimatePresence>
        {toast !== null && (
          <motion.div initial={{ y: -90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -90, opacity: 0 }} transition={spring.bouncy} role="status"
            style={{ position: 'fixed', top: 14, left: 14, right: 14, margin: '0 auto', maxWidth: 420, zIndex: 60, background: 'var(--ink)', color: '#fff', padding: '12px 16px 12px 12px', borderRadius: 'var(--r-pill)', boxShadow: 'var(--shadow-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ delay: 0.15, duration: 0.6, ease: ease.out }}
              style={{ width: 34, height: 34, borderRadius: 17, background: 'var(--paari)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={18} stroke={2.6} />
            </motion.span>
            <span className="stack" style={{ lineHeight: 1.25 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>நாட்குறிப்பில் சேர்ந்தது</span>
              <span style={{ fontSize: 12, color: '#CFCBC4' }}>Saved to Paari&apos;s journal{toast ? ` · page ${toast}` : ''}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header className="row between" initial="hidden" animate="show" variants={rise}>
        <Wordmark />
        <Link href="/you" className="icon-btn" aria-label="Settings"><Icon name="you" size={20} /></Link>
      </motion.header>

      {/* ── hero: the clock of today ── */}
      <motion.section initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: dur.cinematic, ease: ease.out }}
        className="stack" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-xl)', background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-2)', padding: '26px 22px 24px', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <Lights style={{ opacity: 0.7 }} />
        <span className="eyebrow" style={{ position: 'relative' }}>{p.date.weekdayEn} · {p.date.shortEn}</span>
        <motion.div initial={{ scale: 0.6, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ ...spring.soft, delay: 0.2 }}
          style={{ position: 'relative', borderRadius: '50%', boxShadow: '0 30px 60px -28px rgba(19,19,19,.45), inset 0 0 0 1px rgba(19,19,19,.04)' }}>
          <AnalogClock size={210} live />
        </motion.div>
        <div className="stack gap-1" style={{ position: 'relative', alignItems: 'center' }}>
          <LiveTime size={30} />
          <span className="title-ta" style={{ fontSize: 22 }}>{p.date.weekdayTa}, {p.date.day} {p.date.monthTa}</span>
        </div>
        <div className="row gap-2" style={{ position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="chip" style={{ background: 'var(--ink)', color: '#fff' }}>அப்பாவின் நாட்குறிப்பு · நாள் <CountUp to={p.dayNumber} /></span>
          <span className="chip" style={{ background: p.todayCount ? 'var(--k-milestone-soft)' : 'var(--paari-soft)', color: p.todayCount ? 'var(--k-milestone)' : 'var(--k-moment)' }}>
            {p.todayCount ? `இன்று ${p.todayCount} பதிவு` : 'இன்றைய பக்கம் காலியாக உள்ளது'}
          </span>
        </div>
      </motion.section>

      {/* ── today's page ── */}
      <motion.section className="card stack gap-4" initial="hidden" animate="show" variants={rise} custom={2} style={{ padding: 22, borderRadius: 'var(--r-xl)' }}>
        <span className="eyebrow">Today&apos;s quiet question</span>
        <p className="title-ta" style={{ fontSize: 23 }}>{p.prompt.ta}</p>
        <p className="en-italic" style={{ margin: 0 }}>{p.prompt.en}</p>
        <div className="row gap-3" style={{ marginTop: 4 }}>
          <Link href="/new" className="btn btn-ink shine" style={{ flex: 1, minHeight: 54 }}>
            <Icon name="letter" size={18} /> இன்று எழுது
          </Link>
          <Link href="/new?photo=1" className="icon-btn" aria-label="Add a photo" style={{ width: 54, height: 54 }}><Icon name="photo" size={22} /></Link>
        </div>
        <div className="hscroll" style={{ marginTop: 2 }}>
          {KINDS.filter((k) => k.id !== 'together').map((k, i) => (
            <motion.div key={k.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring.soft, delay: 0.4 + i * 0.05 }}>
              <Link href={`/new?kind=${k.id}`} className="row gap-2" style={{ height: 42, padding: '0 14px', borderRadius: 'var(--r-pill)', background: k.soft, color: k.color, fontWeight: 600, fontSize: 13.5 }}>
                <Icon name={k.id as IconName} size={17} /> {k.ta}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Paari's life clock ── */}
      <motion.section className="card stack gap-4" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: dur.slow, ease: ease.out }} style={{ padding: 22, borderRadius: 'var(--r-xl)' }}>
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div className="stack">
            <span className="eyebrow" style={{ color: 'var(--k-moment)' }}>Paari&apos;s life clock</span>
            <span className="title-ta" style={{ fontSize: 20 }}>பாரியின் வாழ்க்கைக் கடிகாரம்</span>
          </div>
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex', color: 'var(--paari)' }}>
            <Icon name="sun" size={26} />
          </motion.span>
        </div>
        {p.birth ? <LifeClock birth={p.birth} /> : (
          <div className="stack gap-3">
            <span className="muted" style={{ fontSize: 14 }}>Add Paari&apos;s birthday and his life clock starts ticking — every second he has been in this world.</span>
            <div className="row gap-2">
              <input type="date" className="input" value={birthInput} onChange={(e) => setBirthInput(e.target.value)} aria-label="Paari's birthday" style={{ flex: 1 }} />
              <button className="btn btn-ink" disabled={!birthInput || pending} onClick={() => start(async () => { await saveSettings(birthInput); router.refresh(); })}>சேமி</button>
            </div>
          </div>
        )}
      </motion.section>

      {/* ── until Paari reads this ── */}
      {p.readingDay && (
        <motion.section className="stack gap-4" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: dur.slow, ease: ease.out }}
          style={{ position: 'relative', overflow: 'hidden', padding: 22, borderRadius: 'var(--r-xl)', background: 'var(--ink)', color: '#fff', boxShadow: 'var(--shadow-2)' }}>
          <span className="light paari" style={{ position: 'absolute', width: 260, height: 260, right: -90, top: -120, borderRadius: '50%', filter: 'blur(50px)', opacity: 0.45, mixBlendMode: 'screen' }} />
          <div className="stack" style={{ position: 'relative' }}>
            <span className="eyebrow" style={{ color: '#CFCBC4' }}>Until Paari reads this · {p.readingDayLabel}</span>
            <span className="title-ta" style={{ fontSize: 20 }}>பாரி இதைப் படிக்கும் நாள் வரை</span>
          </div>
          <div style={{ position: 'relative' }}><ReadingCountdown target={p.readingDay} birth={p.birth} dark /></div>
          <span style={{ position: 'relative', fontSize: 13.5, color: '#CFCBC4' }}>
            Every page you write before then is waiting for him. So far: <b style={{ color: '#fff' }}>{p.stats.days} days, {p.stats.total} memories</b>.
          </span>
        </motion.section>
      )}

      {/* ── together timer ── */}
      <TogetherTimer todaySeconds={p.stats.together_today} />

      {/* ── stats ── */}
      {p.stats.total > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {[
            { n: p.stats.total, ta: 'நினைவுகள்', en: 'memories', c: 'var(--ink)' },
            { n: p.stats.days, ta: 'எழுதிய நாட்கள்', en: 'days written', c: 'var(--appa)' },
            { n: Math.round(p.stats.together_month / 60), ta: 'நிமிடங்கள் ஒன்றாக', en: `this month · ${together.en}`, c: 'var(--k-together)' },
            { n: p.stats.proud, ta: 'பெருமைகள்', en: 'proud moments', c: 'var(--k-proud)' },
          ].map((s, i) => (
            <motion.div key={s.ta} className="card stack" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring.soft, delay: i * 0.07 }} style={{ padding: 18 }}>
              <CountUp to={s.n} className="num" style={{ fontSize: 46, lineHeight: 1, color: s.c }} />
              <span style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{s.ta}</span>
              <span className="muted" style={{ fontSize: 12.5 }}>{s.en}</span>
            </motion.div>
          ))}
        </section>
      )}

      {/* ── on this day ── */}
      {p.onThisDay.length > 0 && (
        <section className="stack gap-3">
          <div className="stack"><span className="eyebrow">On this day</span><h2 className="title-ta" style={{ fontSize: 21 }}>இதே நாளில், முன்பு</h2></div>
          <div className="hscroll">
            {p.onThisDay.map((m, i) => <div key={m.id} style={{ width: 260 }}><MemoryCard m={m} index={i} compact /></div>)}
          </div>
        </section>
      )}

      {/* ── the journal ── */}
      <section className="stack gap-5">
        <div className="row between" style={{ alignItems: 'flex-end' }}>
          <div className="stack"><span className="eyebrow">The journal</span><h2 className="title-ta" style={{ fontSize: 22 }}>அப்பாவின் நாட்குறிப்பு</h2></div>
          <Link href="/book" className="row gap-1" style={{ fontSize: 14, fontWeight: 600, color: 'var(--appa)' }}>புத்தகமாக <Icon name="arrow" size={16} /></Link>
        </div>
        {days.length ? days.map((d, i) => <JournalDay key={d.iso} iso={d.iso} entries={d.entries} index={i} chapter={d.chapter} />) : (
          <div className="card stack gap-2" style={{ padding: 24, textAlign: 'center' }}>
            <span className="title-ta" style={{ fontSize: 19 }}>முதல் பக்கம் காத்திருக்கிறது</span>
            <span className="en-italic">“One day he will open this, and know he was watched with love — every single day.”</span>
          </div>
        )}
      </section>
    </main>
  );
}
