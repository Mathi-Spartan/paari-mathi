'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Lights, Wordmark } from '@/components/Lights';
import { Icon, type IconName } from '@/components/Icon';
import { CountUp } from '@/components/CountUp';
import { MemoryCard, type CardMemory } from '@/components/MemoryCard';
import { KINDS } from '@/lib/kinds';
import { describeDate } from '@/lib/dates';
import { dur, ease, rise, spring } from '@/lib/motion';

type Props = {
  today: string;
  date: ReturnType<typeof describeDate>;
  age: { ta: string; en: string } | null;
  prompt: { ta: string; en: string };
  stats: { total: number; photos: number; proud: number; letters: number; first: string | null; days: number };
  dayNumber: number;
  recent: CardMemory[];
  todays: CardMemory[];
  onThisDay: CardMemory[];
  coverId: string | null;
  saved: number | null;
};

export function TodayView(p: Props) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);
  const [toast, setToast] = useState(p.saved);

  useEffect(() => {
    if (p.saved === null) return;
    const t = setTimeout(() => { setToast(null); router.replace('/', { scroll: false }); }, 3800);
    return () => clearTimeout(t);
  }, [p.saved, router]);

  const empty = p.stats.total === 0;
  const hasPhoto = !!p.coverId;

  return (
    <main className="shell stack gap-8">
      {/* saved toast */}
      <AnimatePresence>
        {toast !== null && (
          <motion.div initial={{ y: -90, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -90, opacity: 0 }} transition={spring.bouncy}
            className="row gap-3" role="status"
            style={{ position: 'fixed', top: 14, left: '50%', x: '-50%', zIndex: 60, background: 'var(--ink)', color: '#fff', padding: '12px 18px 12px 12px', borderRadius: 'var(--r-pill)', boxShadow: 'var(--shadow-2)', width: 'max-content', maxWidth: 'calc(100% - 28px)' }}>
            <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ delay: 0.15, duration: 0.6, ease: ease.out }}
              style={{ width: 34, height: 34, borderRadius: 17, background: 'var(--paari)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={18} stroke={2.6} />
            </motion.span>
            <span className="stack" style={{ lineHeight: 1.25 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>பாரியின் புத்தகத்தில் சேர்ந்தது</span>
              <span style={{ fontSize: 12, color: '#CFCBC4' }}>Saved to Paari&apos;s book{toast ? ` · page ${toast}` : ''}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* header */}
      <motion.header className="row between" initial="hidden" animate="show" variants={rise} custom={0}>
        <Wordmark />
        <Link href="/you" className="icon-btn" aria-label="Appa's settings" style={{ background: 'var(--appa)', color: '#fff', border: 0, fontWeight: 700 }}>ம</Link>
      </motion.header>

      {/* hero */}
      <div ref={heroRef} style={{ position: 'relative' }}>
        <motion.section initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: dur.cinematic, ease: ease.out, delay: 0.05 }}
          style={{ position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden', minHeight: 420, background: hasPhoto ? 'var(--ink)' : 'var(--surface)', border: hasPhoto ? 0 : '1px solid var(--line)', boxShadow: 'var(--shadow-2)', color: hasPhoto ? '#fff' : 'var(--ink)' }}>
          {hasPhoto ? (
            <motion.div style={{ position: 'absolute', inset: 0, y: heroY, scale: heroScale }}>
              <img src={`/api/photo/${p.coverId}`} alt="" className="kenburns" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.7) 100%)' }} />
            </motion.div>
          ) : (
            <motion.div style={{ position: 'absolute', inset: 0, opacity: heroFade }}><Lights /></motion.div>
          )}
          <div className="stack" style={{ position: 'relative', padding: 26, minHeight: 420 }}>
            <div className="row between">
              <span className="eyebrow" style={{ color: hasPhoto ? 'rgba(255,255,255,.85)' : undefined }}>{p.date.weekdayEn} · {p.date.shortEn}</span>
              {p.age && <span className="chip" style={{ background: hasPhoto ? 'rgba(255,255,255,.18)' : 'var(--paari-soft)', color: hasPhoto ? '#fff' : 'var(--k-moment)', backdropFilter: 'blur(8px)' }}>பாரி · {p.age.ta}</span>}
            </div>
            <div className="stack gap-3" style={{ marginTop: 'auto' }}>
              <span className="eyebrow-ta" style={{ color: hasPhoto ? 'rgba(255,255,255,.85)' : undefined }}>
                {empty ? 'முதல் பக்கம் காத்திருக்கிறது' : `அப்பாவின் புத்தகம் · நாள் ${p.dayNumber}`}
              </span>
              <h1 className="display" style={{ fontSize: 'clamp(50px, 14vw, 68px)' }}>
                {empty ? <>The first page<br />is <em>waiting.</em></> : <>Day <CountUp to={p.dayNumber} /><br /><em style={{ color: hasPhoto ? '#FFB48F' : undefined }}>for Paari.</em></>}
              </h1>
              <p className="title-ta" style={{ fontSize: 18, fontWeight: 500, color: hasPhoto ? 'rgba(255,255,255,.92)' : 'var(--ink-2)' }}>
                {empty ? 'ஒவ்வொரு நாளும் ஒரு பக்கம். இன்று தொடங்கு.' : 'ஒவ்வொரு நாளும் ஒரு பக்கம் — உனக்காக, அன்புடன்.'}
              </p>
            </div>
          </div>
        </motion.section>
      </div>

      {/* today's page */}
      <motion.section className="card stack gap-5" initial="hidden" animate="show" variants={rise} custom={3} style={{ padding: 24, gap: 18, borderRadius: 'var(--r-xl)' }}>
        <div className="row between">
          <span className="eyebrow">Today&apos;s quiet question</span>
          <span className="row gap-1" style={{ fontSize: 13, fontWeight: 600, color: p.todays.length ? 'var(--k-milestone)' : 'var(--muted)' }}>
            {p.todays.length ? <><Icon name="check" size={16} stroke={2.4} /> இன்று {p.todays.length} பதிவு</> : 'இன்னும் எழுதவில்லை'}
          </span>
        </div>
        <div className="stack gap-2">
          <p className="title-ta" style={{ fontSize: 24 }}>{p.prompt.ta}</p>
          <p className="en-italic" style={{ margin: 0 }}>{p.prompt.en}</p>
        </div>
        <div className="row gap-3">
          <Link href="/new" className="btn btn-ink shine" style={{ flex: 1 }}>
            <Icon name="moment" size={18} /> இன்றைய பக்கம் எழுது
          </Link>
          <Link href="/new?photo=1" className="icon-btn" aria-label="Add a photo" style={{ width: 52, height: 52 }}>
            <Icon name="photo" size={22} />
          </Link>
        </div>
      </motion.section>

      {/* kinds */}
      <section className="stack gap-3">
        <motion.div className="row between" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise}>
          <h2 className="title-ta" style={{ fontSize: 20 }}>இன்று எதைச் சேமிப்பாய்?</h2>
          <span className="muted" style={{ fontSize: 13 }}>What will you keep?</span>
        </motion.div>
        <div className="hscroll">
          {KINDS.map((k, i) => (
            <motion.div key={k.id} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ...spring.soft, delay: i * 0.06 }} whileTap={{ scale: 0.95 }}>
              <Link href={`/new?kind=${k.id}`} className="stack" style={{ width: 148, height: 156, padding: 16, borderRadius: 'var(--r-lg)', background: k.soft, justifyContent: 'space-between' }}>
                <span style={{ width: 46, height: 46, borderRadius: 15, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color, boxShadow: 'var(--shadow-1)' }}>
                  <Icon name={k.id as IconName} size={22} />
                </span>
                <span className="stack">
                  <span className="title-ta" style={{ fontSize: 17, color: 'var(--ink)' }}>{k.ta}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{k.en}</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* on this day */}
      {p.onThisDay.length > 0 && (
        <section className="stack gap-3">
          <div className="stack">
            <span className="eyebrow">On this day</span>
            <h2 className="title-ta" style={{ fontSize: 22 }}>இதே நாளில், முன்பு</h2>
          </div>
          <div className="hscroll">
            {p.onThisDay.map((m, i) => (
              <div key={m.id} style={{ width: 260 }}><MemoryCard m={m} index={i} compact /></div>
            ))}
          </div>
        </section>
      )}

      {/* stats */}
      {!empty && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {[
            { n: p.stats.total, ta: 'நினைவுகள்', en: 'memories', c: 'var(--ink)' },
            { n: p.stats.photos, ta: 'புகைப்படங்கள்', en: 'photos', c: 'var(--appa)' },
            { n: p.stats.proud, ta: 'பெருமைகள்', en: 'proud moments', c: 'var(--k-proud)' },
            { n: p.stats.letters, ta: 'கடிதங்கள்', en: 'letters for later', c: 'var(--paari)' },
          ].map((s, i) => (
            <motion.div key={s.en} className="card stack" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring.soft, delay: i * 0.07 }} style={{ padding: 18, borderRadius: 'var(--r-lg)' }}>
              <CountUp to={s.n} className="num" style={{ fontSize: 48, lineHeight: 1, color: s.c }} />
              <span style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{s.ta}</span>
              <span className="muted" style={{ fontSize: 12.5 }}>{s.en}</span>
            </motion.div>
          ))}
        </section>
      )}

      {/* recent */}
      {!empty && (
        <section className="stack gap-4">
          <div className="row between" style={{ alignItems: 'flex-end' }}>
            <div className="stack">
              <span className="eyebrow">Recently written</span>
              <h2 className="title-ta" style={{ fontSize: 22 }}>சமீபத்திய பக்கங்கள்</h2>
            </div>
            <Link href="/book" className="row gap-1" style={{ fontSize: 14, fontWeight: 600, color: 'var(--appa)' }}>புத்தகம் <Icon name="arrow" size={16} /></Link>
          </div>
          <div className="stack gap-6">
            {p.recent.map((m, i) => <MemoryCard key={m.id} m={m} index={i} />)}
          </div>
        </section>
      )}

      {empty && (
        <motion.section className="stack gap-3" initial="hidden" animate="show" variants={rise} custom={5} style={{ textAlign: 'center', padding: '10px 10px 0' }}>
          <p className="en-italic" style={{ fontSize: 19 }}>“One day he will open this, and know he was watched with love — every single day.”</p>
          <span className="muted" style={{ fontSize: 13 }}>Tap + to write the very first page.</span>
        </motion.section>
      )}
    </main>
  );
}
