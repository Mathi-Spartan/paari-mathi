'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';
import { createPin, unlock } from '../actions';
import { Lights, Wordmark } from '@/components/Lights';
import { Icon } from '@/components/Icon';
import { dur, ease, spring } from '@/lib/motion';

const LEN = 6;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function LockScreen({ firstRun }: { firstRun: boolean }) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [first, setFirst] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [pending, start] = useTransition();
  const shake = useAnimationControls();

  const stage: 'enter' | 'create' | 'confirm' = !firstRun ? 'enter' : first ? 'confirm' : 'create';
  const heading = { enter: { ta: 'அப்பாவின் PIN', en: 'Only Appa can open this book.' }, create: { ta: 'ஒரு PIN உருவாக்கு', en: 'Choose a 6‑digit PIN to keep this book private.' }, confirm: { ta: 'மீண்டும் உள்ளிடு', en: 'Type the same PIN once more.' } }[stage];

  const fail = async (text: string) => {
    setMsg(text);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.([30, 40, 30]);
    await shake.start({ x: [0, -14, 12, -9, 6, -3, 0], transition: { duration: 0.5, ease: ease.out } });
    setPin('');
  };

  const submit = (full: string) => {
    start(async () => {
      if (stage === 'create') { setFirst(full); setPin(''); setMsg(null); return; }
      if (stage === 'confirm') {
        if (full !== first) { setFirst(null); return fail('PINs did not match — start again'); }
        const r = await createPin(full);
        if (!r.ok) return fail(r.error ?? 'Could not save PIN');
      } else {
        const r = await unlock(full);
        if (!r.ok) return fail(r.error === 'wrong' ? 'தவறான PIN · Wrong PIN' : r.error ?? 'Try again');
      }
      setOpening(true);
      setTimeout(() => { router.replace('/'); router.refresh(); }, 900);
    });
  };

  const press = (k: string) => {
    if (pending || opening) return;
    setMsg(null);
    if (k === 'del') return setPin((p) => p.slice(0, -1));
    if (!k) return;
    setPin((p) => {
      const next = (p + k).slice(0, LEN);
      if (next.length === LEN) setTimeout(() => submit(next), 120);
      return next;
    });
  };

  return (
    <main style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <motion.div animate={opening ? { scale: 2.4, opacity: 0 } : { scale: 1, opacity: 1 }} transition={{ duration: dur.cinematic, ease: ease.inOut }} style={{ position: 'absolute', inset: '-10% -10% 20% -10%' }}>
        <Lights />
      </motion.div>
      <motion.div className="stack" animate={opening ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }} transition={{ duration: dur.slow, ease: ease.out }}
        style={{ position: 'relative', width: '100%', maxWidth: 420, padding: '28px 24px 32px', minHeight: '100dvh' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: dur.slow, ease: ease.out }}>
          <Wordmark />
        </motion.div>

        <div className="stack gap-3" style={{ marginTop: '9vh' }}>
          <motion.h1 className="display" style={{ fontSize: 'clamp(54px, 15vw, 76px)' }} initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.2, duration: dur.cinematic, ease: ease.out }}>
            For <em>Paari,</em><br />with love.
          </motion.h1>
          <motion.p className="title-ta" style={{ fontSize: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: dur.slow }}>
            பாரிக்காக, அன்புடன் அப்பா.
          </motion.p>
        </div>

        <div className="stack gap-2" style={{ marginTop: 'auto', alignItems: 'center', textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div key={stage} className="stack gap-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: dur.base, ease: ease.out }}>
              <span className="title-ta" style={{ fontSize: 17 }}>{heading.ta}</span>
              <span className="muted" style={{ fontSize: 14 }}>{heading.en}</span>
            </motion.div>
          </AnimatePresence>

          <motion.div animate={shake} className="row gap-3" style={{ margin: '18px 0 6px' }} role="status" aria-label={`${pin.length} of ${LEN} digits entered`}>
            {Array.from({ length: LEN }).map((_, i) => (
              <motion.span key={i} animate={{ scale: i < pin.length ? 1 : 0.7, backgroundColor: i < pin.length ? 'var(--ink)' : 'rgba(19,19,19,0)' }} transition={spring.bouncy}
                style={{ width: 14, height: 14, borderRadius: 7, border: '1.5px solid var(--ink)' }} />
            ))}
          </motion.div>
          <div style={{ minHeight: 22, fontSize: 13, color: 'var(--k-moment)', fontWeight: 600 }}>{msg}</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, width: '100%', maxWidth: 300, marginTop: 6 }}>
            {KEYS.map((k, i) =>
              k === '' ? <span key={i} /> : (
                <motion.button key={i} type="button" onClick={() => press(k)} aria-label={k === 'del' ? 'Delete' : k}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.03, ...spring.soft }}
                  whileTap={{ scale: 0.88, backgroundColor: 'rgba(19,19,19,.08)' }}
                  style={{ height: 70, borderRadius: 35, border: k === 'del' ? 0 : '1px solid rgba(19,19,19,.08)', background: k === 'del' ? 'transparent' : 'rgba(255,255,255,.7)', backdropFilter: 'blur(10px)', fontSize: 26, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {k === 'del' ? <Icon name="delete" size={24} /> : k}
                </motion.button>
              )
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
