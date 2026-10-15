'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { Icon } from '@/components/Icon';
import { Lights } from '@/components/Lights';
import { KindChip } from '@/components/MemoryCard';
import { FEELINGS, formatDuration } from '@/lib/kinds';
import { AnalogClock, timeLabel } from '@/components/Clocks';
import type { describeDate } from '@/lib/dates';
import { dur, ease, spring } from '@/lib/motion';

export type BookPage = {
  iso: string;
  number: number;
  date: ReturnType<typeof describeDate>;
  age: { ta: string; en: string } | null;
  memories: { id: string; kind: string; body: string; has_photo: boolean; locked: boolean; opens_on: string | null; feeling: string | null; created_at: string; duration_seconds: number | null }[];
};

const turn = {
  enter: (dir: number) => ({ rotateY: dir > 0 ? 70 : -70, x: dir > 0 ? 60 : -60, opacity: 0, transformOrigin: dir > 0 ? '0% 50%' : '100% 50%' }),
  center: { rotateY: 0, x: 0, opacity: 1, transition: { ...spring.page } },
  exit: (dir: number) => ({ rotateY: dir > 0 ? -80 : 80, x: dir > 0 ? -40 : 40, opacity: 0, transformOrigin: dir > 0 ? '0% 50%' : '100% 50%', transition: { duration: dur.base, ease: ease.in } }),
};

export function BookReader({ pages, since }: { pages: BookPage[]; since: ReturnType<typeof describeDate> }) {
  // index 0 is the cover; 1..n are days
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const total = pages.length + 1;
  const go = useCallback((delta: number) => setState(([i]) => {
    const n = Math.min(total - 1, Math.max(0, i + delta));
    return n === i ? [i, 0] : [n, delta];
  }), [total]);
  const jump = (n: number) => setState(([i]) => [n, n > i ? 1 : -1]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 70 || info.velocity.x > 400) go(-1);
  };

  const page = index > 0 ? pages[index - 1] : null;

  return (
    <main className="shell stack gap-5">
      <header className="row between">
        <div className="stack">
          <span className="eyebrow">The book</span>
          <h1 className="title-ta" style={{ fontSize: 24 }}>பாரியின் புத்தகம்</h1>
        </div>
        <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--ink-2)' }}>{index === 0 ? 'Cover' : `பக்கம் ${index} / ${pages.length}`}</span>
      </header>

      <div className="book-stage" style={{ marginBottom: 14, marginRight: 12 }}>
        <div className="page-edge two" /><div className="page-edge" />
        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
          <motion.article key={index} custom={dir} variants={turn} initial="enter" animate="center" exit="exit"
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.35} onDragEnd={onDragEnd}
            className="page" style={{ touchAction: 'pan-y', cursor: 'grab', overflow: 'hidden' }}>
            {page ? <DayPage page={page} /> : <Cover since={since} count={pages.length} onOpen={() => go(1)} />}
          </motion.article>
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="row gap-3">
        <motion.button whileTap={{ scale: 0.9 }} className="icon-btn" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous page" style={{ width: 52, height: 52, opacity: index === 0 ? 0.35 : 1 }}>
          <Icon name="back" size={20} stroke={2.2} />
        </motion.button>
        <div className="stack gap-1" style={{ flex: 1 }}>
          <input type="range" min={0} max={total - 1} value={index} onChange={(e) => jump(Number(e.target.value))} aria-label="Scrub through the book"
            style={{ width: '100%', accentColor: 'var(--paari)' }} />
          <span className="muted" style={{ fontSize: 12, textAlign: 'center' }}>{page ? `${page.date.day} ${page.date.monthTa} ${page.date.year}` : 'ஸ்வைப் செய் அல்லது இழு · swipe to turn'}</span>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="icon-btn" onClick={() => go(1)} disabled={index === total - 1} aria-label="Next page" style={{ width: 52, height: 52, opacity: index === total - 1 ? 0.35 : 1, background: 'var(--ink)', color: '#fff', border: 0 }}>
          <Icon name="next" size={20} stroke={2.2} />
        </motion.button>
      </div>
    </main>
  );
}

function Cover({ since, count, onOpen }: { since: ReturnType<typeof describeDate>; count: number; onOpen: () => void }) {
  return (
    <div className="stack" style={{ minHeight: '58dvh', position: 'relative', textAlign: 'center', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <Lights style={{ inset: '-20%', opacity: 0.85 }} />
      <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ position: 'relative' }}>Written by Appa · since {since.shortEn}</motion.span>
      <motion.h2 className="display" initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: dur.cinematic, ease: ease.out, delay: 0.25 }}
        style={{ position: 'relative', fontSize: 'clamp(46px, 13vw, 64px)' }}>
        The Book<br />of <em>Paari</em>
      </motion.h2>
      <motion.p className="title-ta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} style={{ position: 'relative', fontSize: 19 }}>
        என் பாரிக்கு — ஒவ்வொரு நாளும்,<br />அமைதியாக உன்னைப் பார்த்த அப்பா.
      </motion.p>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="muted" style={{ position: 'relative', fontSize: 14 }}>
        {count ? `${count} pages so far` : 'The first page is still to be written'}
      </motion.span>
      {count > 0 && (
        <motion.button onClick={onOpen} className="btn btn-ink shine" whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, ...spring.soft }} style={{ position: 'relative', marginTop: 8 }}>
          திற · Open the book <Icon name="arrow" size={18} />
        </motion.button>
      )}
    </div>
  );
}

function DayPage({ page }: { page: BookPage }) {
  return (
    <div className="stack gap-6">
      <div className="row gap-4" style={{ alignItems: 'flex-end' }}>
        <motion.span className="num" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...spring.soft }} style={{ fontSize: 92, lineHeight: 0.8 }}>{page.date.day}</motion.span>
        <div className="stack" style={{ paddingBottom: 4 }}>
          <span className="title-ta" style={{ fontSize: 18 }}>{page.date.monthTa} {page.date.year}</span>
          <span className="muted" style={{ fontSize: 13 }}>{page.date.weekdayTa} · {page.date.weekdayEn}{page.age ? ` · பாரி ${page.age.ta}` : ''}</span>
        </div>
      </div>
      {page.memories.map((m, i) => {
        const feeling = FEELINGS.find((f) => f.id === m.feeling);
        return (
          <motion.div key={m.id} className="stack gap-3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.12, duration: dur.slow, ease: ease.out }}>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              <span className="row gap-1" style={{ fontSize: 12.5, fontWeight: 700 }}><AnalogClock size={18} at={m.created_at} /> {timeLabel(m.created_at)}</span>
              <KindChip kind={m.kind} />{feeling && <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--ink-2)' }}>{feeling.ta}</span>}
              {m.duration_seconds ? <span className="chip" style={{ background: 'var(--k-together-soft)', color: 'var(--k-together)' }}>{formatDuration(m.duration_seconds).ta}</span> : null}
            </div>
            {m.locked ? (
              <div className="row gap-3" style={{ padding: 16, borderRadius: 'var(--r-md)', background: 'var(--ink)', color: '#fff' }}>
                <Icon name="lock" size={20} />
                <span style={{ fontSize: 14 }}>A sealed letter for Paari{m.opens_on ? ` · opens ${m.opens_on}` : ''}</span>
              </div>
            ) : (
              <>
                {m.has_photo && (
                  <Link href={`/m/${m.id}`} style={{ display: 'block', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-1)', transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)`, border: '6px solid #fff' }}>
                    <img src={`/api/photo/${m.id}`} alt="" loading="lazy" style={{ width: '100%', maxHeight: 360, objectFit: 'cover' }} />
                  </Link>
                )}
                {m.body && <p className="mem-body" style={{ fontSize: 18, color: 'var(--ink)' }}>{m.body}</p>}
              </>
            )}
          </motion.div>
        );
      })}
      <span className="muted" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', textAlign: 'center', fontSize: 15 }}>— {page.number} —</span>
    </div>
  );
}
