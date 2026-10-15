'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@/components/Icon';
import { Lights } from '@/components/Lights';
import { lockNow, saveSettings } from '@/app/actions';
import { rise, spring } from '@/lib/motion';

export function YouView({ paariBirth, stats }: { paariBirth: string | null; stats: { total: number; days: number; photos: number; first: string | null } }) {
  const [birth, setBirth] = useState(paariBirth ?? '');
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  return (
    <main className="shell stack gap-8">
      <motion.section initial="hidden" animate="show" variants={rise} className="stack gap-4" style={{ position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden', padding: 26, background: 'var(--surface)', border: '1px solid var(--line)', minHeight: 260 }}>
        <Lights />
        <div className="row gap-3" style={{ position: 'relative' }}>
          <span style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--appa)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>ம</span>
          <span style={{ width: 56, height: 56, marginLeft: -22, borderRadius: 28, background: 'var(--paari)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, border: '3px solid #fff' }}>பா</span>
        </div>
        <h1 className="display" style={{ position: 'relative', fontSize: 46, marginTop: 'auto' }}>Mathi <em>&amp;</em> Paari</h1>
        <p className="title-ta" style={{ position: 'relative', fontSize: 17, fontWeight: 500, color: 'var(--ink-2)' }}>
          {stats.total ? `${stats.days} நாட்கள் · ${stats.total} நினைவுகள் · ${stats.photos} புகைப்படங்கள்` : 'புத்தகம் இன்னும் தொடங்கவில்லை'}
        </p>
      </motion.section>

      <motion.section initial="hidden" animate="show" variants={rise} custom={2} className="card stack gap-4" style={{ padding: 22 }}>
        <div className="stack gap-1">
          <span className="title-ta" style={{ fontSize: 19 }}>பாரியின் பிறந்தநாள்</span>
          <span className="muted" style={{ fontSize: 14 }}>Used to show Paari’s age on every page and to seal letters for his birthdays.</span>
        </div>
        <label className="field-label" htmlFor="birth">Paari’s birthday</label>
        <input id="birth" type="date" className="input" value={birth} onChange={(e) => { setBirth(e.target.value); setSaved(false); }} />
        <button className="btn btn-ink" disabled={pending} onClick={() => start(async () => { await saveSettings(birth || null); setSaved(true); })}>
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span key="ok" className="row gap-2" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.bouncy}><Icon name="check" size={18} stroke={2.6} /> சேமிக்கப்பட்டது</motion.span>
            ) : (
              <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>சேமி · Save</motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.section>

      <motion.section initial="hidden" animate="show" variants={rise} custom={3} className="stack gap-3">
        <span className="eyebrow">Privacy</span>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>This book is private. It opens only with Appa’s PIN, on this device for 180 days at a time.</p>
        <form action={lockNow}>
          <button className="btn btn-ghost btn-block" type="submit"><Icon name="lock" size={18} /> இப்போதே பூட்டு · Lock now</button>
        </form>
      </motion.section>
    </main>
  );
}
