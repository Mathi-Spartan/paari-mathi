'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { kindOf } from '@/lib/kinds';
import { describeDate } from '@/lib/dates';
import { dur, ease } from '@/lib/motion';

export type CardMemory = {
  id: string; kind: string; body: string; has_photo: boolean; locked: boolean; opens_on: string | null; memory_date: string; feeling: string | null;
};

export function KindChip({ kind, onDark = false }: { kind: string; onDark?: boolean }) {
  const k = kindOf(kind);
  return (
    <span className="chip" style={{ background: onDark ? 'rgba(255,255,255,.92)' : k.soft, color: k.color }}>
      <span className="kind-dot" style={{ background: k.color }} />
      {k.ta}
    </span>
  );
}

export function MemoryCard({ m, index = 0, compact = false }: { m: CardMemory; index?: number; compact?: boolean }) {
  const d = describeDate(m.memory_date);
  const reveal = { initial: { opacity: 0, y: 28, scale: 0.98 }, whileInView: { opacity: 1, y: 0, scale: 1 }, viewport: { once: true, margin: '-40px' }, transition: { duration: dur.slow, ease: ease.out, delay: Math.min(index, 4) * 0.05 } };

  if (m.locked) {
    const o = m.opens_on ? describeDate(m.opens_on) : null;
    return (
      <motion.div {...reveal}>
        <Link href={`/m/${m.id}`} className="stack gap-3" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)', background: 'var(--ink)', color: '#fff', padding: 22 }}>
          <span className="light paari" style={{ position: 'absolute', width: 180, height: 180, right: -40, top: -60, filter: 'blur(40px)', borderRadius: '50%', opacity: 0.55, mixBlendMode: 'screen' }} />
          <span className="row gap-2" style={{ position: 'relative', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#CFCBC4' }}>
            <Icon name="lock" size={16} /> பாரிக்காக முத்திரையிடப்பட்டது
          </span>
          <span className="display" style={{ position: 'relative', fontSize: 30 }}>A letter, sealed for Paari.</span>
          <span style={{ position: 'relative', fontSize: 14, color: '#CFCBC4' }}>Written {d.shortEn}{o ? ` · opens ${o.shortEn}` : ''}</span>
        </Link>
      </motion.div>
    );
  }

  if (m.has_photo) {
    return (
      <motion.div {...reveal} whileTap={{ scale: 0.98 }}>
        <Link href={`/m/${m.id}`} className="stack gap-3">
          <div className="mem-photo" style={{ aspectRatio: compact ? '4 / 5' : '4 / 4.6' }}>
            <img src={`/api/photo/${m.id}`} alt="" loading="lazy" />
            <div className="scrim" />
            <div className="row between" style={{ position: 'absolute', left: 14, right: 14, top: 14 }}>
              <KindChip kind={m.kind} onDark />
            </div>
            <div className="stack" style={{ position: 'absolute', left: 18, right: 18, bottom: 16, color: '#fff' }}>
              <span className="num" style={{ fontSize: 40, lineHeight: 1 }}>{d.day}</span>
              <span style={{ fontSize: 13, opacity: 0.9 }}>{d.monthTa} {d.year} · {d.weekdayTa}</span>
            </div>
          </div>
          {m.body && <p className={`mem-body ${compact ? 'clamp-3' : 'clamp-4'}`} style={{ padding: '0 4px' }}>{m.body}</p>}
        </Link>
      </motion.div>
    );
  }

  const k = kindOf(m.kind);
  return (
    <motion.div {...reveal} whileTap={{ scale: 0.98 }}>
      <Link href={`/m/${m.id}`} className="card stack gap-4" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
        <span aria-hidden="true" className="num" style={{ position: 'absolute', right: 16, top: -18, fontSize: 120, color: k.soft, lineHeight: 1, fontStyle: 'italic' }}>“</span>
        <div className="row between" style={{ position: 'relative' }}>
          <KindChip kind={m.kind} />
          <span className="muted" style={{ fontSize: 13 }}>{d.day} {d.monthTa}</span>
        </div>
        <p className={`mem-body ${compact ? 'clamp-3' : 'clamp-4'}`} style={{ position: 'relative', fontSize: compact ? 17 : 19, color: 'var(--ink)' }}>{m.body}</p>
      </Link>
    </motion.div>
  );
}
