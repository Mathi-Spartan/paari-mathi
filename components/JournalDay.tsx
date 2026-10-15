'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { AnalogClock, timeLabel } from './Clocks';
import { KindChip } from './MemoryCard';
import { ACTIVITIES, FEELINGS, formatDuration } from '@/lib/kinds';
import { describeDate } from '@/lib/dates';
import { dur, ease } from '@/lib/motion';

export type JournalEntry = {
  id: string; kind: string; body: string; has_photo: boolean; locked: boolean; opens_on: string | null;
  memory_date: string; created_at: string; feeling: string | null; duration_seconds: number | null; activity: string | null;
};

/** One day of the journal: a date column on the left, timestamped entries on a ruled line to the right. */
export function JournalDay({ iso, entries, index = 0, chapter }: { iso: string; entries: JournalEntry[]; index?: number; chapter?: string | null }) {
  const d = describeDate(iso);
  return (
    <>
    {chapter && (
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: dur.slow, ease: ease.out }}
        className="row gap-3" style={{ marginTop: index ? 10 : 0 }}>
        <span className="title-ta" style={{ fontSize: 18, whiteSpace: 'nowrap' }}>{chapter}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--line-2)' }} />
      </motion.div>
    )}
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: dur.slow, ease: ease.out, delay: Math.min(index, 3) * 0.05 }}
      style={{ display: 'grid', gridTemplateColumns: '58px minmax(0, 1fr)', gap: 14 }}>
      <div className="stack" style={{ alignItems: 'center', position: 'sticky', top: 16, alignSelf: 'start' }}>
        <span className="num" style={{ fontSize: 44, lineHeight: 0.9 }}>{d.day}</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{d.monthTa.slice(0, 4)}</span>
        <span className="muted" style={{ fontSize: 11 }}>{d.weekdayTa}</span>
      </div>
      <div className="stack gap-5" style={{ borderLeft: '1.5px dashed var(--line-2)', paddingLeft: 16, paddingBottom: 6 }}>
        {entries.map((m) => <Entry key={m.id} m={m} />)}
      </div>
    </motion.section>
    </>
  );
}

function Entry({ m }: { m: JournalEntry }) {
  const feeling = FEELINGS.find((f) => f.id === m.feeling);
  const act = ACTIVITIES.find((a) => a.id === m.activity);
  return (
    <Link href={`/m/${m.id}`} className="stack gap-3" style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: -27, top: 2, background: 'var(--paper)', borderRadius: '50%', padding: 1 }}>
        <AnalogClock size={20} at={m.created_at} />
      </span>
      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.02em' }}>{timeLabel(m.created_at)}</span>
        <KindChip kind={m.kind} />
        {feeling && <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--ink-2)', height: 26 }}>{feeling.ta}</span>}
      </div>
      {m.locked ? (
        <div className="row gap-3" style={{ padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--ink)', color: '#fff' }}>
          <Icon name="lock" size={18} />
          <span style={{ fontSize: 14 }}>பாரிக்காக முத்திரையிடப்பட்ட கடிதம்{m.opens_on ? ` · opens ${describeDate(m.opens_on).shortEn}` : ''}</span>
        </div>
      ) : (
        <>
          {m.duration_seconds ? (
            <div className="row gap-3" style={{ padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'var(--k-together-soft)', color: 'var(--k-together)' }}>
              <Icon name="timer" size={20} />
              <span className="stack" style={{ lineHeight: 1.25 }}>
                <span style={{ fontWeight: 700 }}>{formatDuration(m.duration_seconds).ta} ஒன்றாக</span>
                <span style={{ fontSize: 12.5 }}>{act ? `${act.ta} · ${act.en}` : 'Time together'}</span>
              </span>
            </div>
          ) : null}
          {m.has_photo && (
            <div className="mem-photo" style={{ aspectRatio: '4 / 3.4', borderRadius: 'var(--r-md)' }}>
              <img src={`/api/photo/${m.id}`} alt="" loading="lazy" />
            </div>
          )}
          {m.body && <p className="mem-body clamp-4" style={{ color: 'var(--ink)' }}>{m.body}</p>}
        </>
      )}
    </Link>
  );
}

export function groupByDay(list: JournalEntry[]) {
  const map = new Map<string, JournalEntry[]>();
  for (const m of list) map.set(m.memory_date, [...(map.get(m.memory_date) ?? []), m]);
  let prev = '';
  return [...map.entries()].map(([iso, entries]) => {
    const month = iso.slice(0, 7);
    const d = describeDate(iso);
    const chapter = month !== prev ? `${d.monthTa} ${d.year}` : null;
    prev = month;
    return { iso, chapter, entries: entries.sort((a, b) => a.created_at.localeCompare(b.created_at)) };
  });
}
