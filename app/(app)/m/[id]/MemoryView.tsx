'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@/components/Icon';
import { KindChip } from '@/components/MemoryCard';
import { deleteMemory } from '@/app/actions';
import { FEELINGS } from '@/lib/kinds';
import type { describeDate } from '@/lib/dates';
import type { Memory } from '@/lib/data';
import { dur, ease, spring } from '@/lib/motion';

export function MemoryView({ m, date, age, opens }: { m: Memory; date: ReturnType<typeof describeDate>; age: { ta: string; en: string } | null; opens: string | null }) {
  const router = useRouter();
  const [peek, setPeek] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const feeling = FEELINGS.find((f) => f.id === m.feeling);
  const hidden = m.locked && !peek;

  return (
    <main className="shell stack gap-6">
      <div className="row between">
        <motion.button whileTap={{ scale: 0.9 }} className="icon-btn" onClick={() => router.back()} aria-label="Back"><Icon name="back" size={20} stroke={2.2} /></motion.button>
        <motion.button whileTap={{ scale: 0.9 }} className="icon-btn" onClick={() => setConfirm(true)} aria-label="Delete this memory"><Icon name="trash" size={19} /></motion.button>
      </div>

      {m.has_photo && !m.locked && (
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ ...spring.soft }}
          style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-2)' }}>
          <img src={`/api/photo/${m.id}`} alt="" style={{ width: '100%', maxHeight: '70dvh', objectFit: 'cover' }} />
        </motion.div>
      )}

      <motion.div className="stack gap-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: dur.slow, ease: ease.out }}>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <KindChip kind={m.kind} />
          {feeling && <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--ink-2)' }}>{feeling.ta}</span>}
        </div>
        <div className="row gap-3" style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <span className="num" style={{ fontSize: 84, lineHeight: 0.8 }}>{date.day}</span>
          <span className="stack">
            <span className="title-ta" style={{ fontSize: 18 }}>{date.monthTa} {date.year}</span>
            <span className="muted" style={{ fontSize: 13 }}>{date.weekdayTa}{age ? ` · பாரி ${age.ta}` : ''}</span>
          </span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {hidden ? (
          <motion.div key="sealed" className="stack gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            style={{ padding: 24, borderRadius: 'var(--r-xl)', background: 'var(--ink)', color: '#fff' }}>
            <span className="row gap-2" style={{ fontSize: 13, color: '#CFCBC4' }}><Icon name="lock" size={16} /> Sealed for Paari{opens ? ` · opens ${opens}` : ''}</span>
            <span className="display" style={{ fontSize: 30 }}>This letter is waiting for him.</span>
            <button className="btn btn-ghost" onClick={() => setPeek(true)} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}>
              Appa only — read it once
            </button>
          </motion.div>
        ) : (
          <motion.p key="body" className="mem-body" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: dur.slow, ease: ease.out }}
            style={{ fontSize: 21, lineHeight: 1.85, color: 'var(--ink)' }}>
            {m.body}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(19,19,19,.4)', backdropFilter: 'blur(4px)', zIndex: 90, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={spring.soft}
              className="stack gap-4" style={{ width: '100%', maxWidth: 520, background: 'var(--surface)', borderRadius: '28px 28px 0 0', padding: '24px 20px max(24px, env(safe-area-inset-bottom))' }}>
              <span className="title-ta" style={{ fontSize: 20 }}>இந்த நினைவை நீக்கவா?</span>
              <span className="muted">Delete this memory from Paari&apos;s book? This cannot be undone.</span>
              <div className="row gap-3">
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>வேண்டாம்</button>
                <button className="btn btn-ink" style={{ flex: 1, background: '#B42318' }} disabled={pending} onClick={() => start(() => deleteMemory(m.id))}>நீக்கு · Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
