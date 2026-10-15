'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { saveMemory } from '../actions';
import { Icon, type IconName } from '@/components/Icon';
import { FEELINGS, KINDS, kindOf } from '@/lib/kinds';
import { addYears, describeDate } from '@/lib/dates';
import { dur, ease, spring } from '@/lib/motion';

async function compress(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export function Composer({ today, initialKind, openPhoto, paariBirth }: { today: string; initialKind: string; openPhoto: boolean; paariBirth: string | null }) {
  const router = useRouter();
  const [kind, setKind] = useState(kindOf(initialKind).id);
  const [body, setBody] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [busyPhoto, setBusyPhoto] = useState(false);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [sealed, setSealed] = useState(true);
  const [opensOn, setOpensOn] = useState<string | null>(paariBirth ? addYears(paariBirth, 18) : null);
  const [phase, setPhase] = useState<'edit' | 'saving' | 'error'>('edit');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const k = kindOf(kind);
  const d = describeDate(date);
  const isLetter = kind === 'letter';

  useEffect(() => { if (openPhoto) setTimeout(() => fileRef.current?.click(), 400); }, [openPhoto]);
  useEffect(() => {
    const t = textRef.current; if (!t) return;
    t.style.height = 'auto'; t.style.height = `${Math.max(220, t.scrollHeight)}px`;
  }, [body]);

  const presets = paariBirth
    ? [{ label: '10ஆவது பிறந்தநாள்', en: '10th birthday', v: addYears(paariBirth, 10) }, { label: '18ஆவது பிறந்தநாள்', en: '18th birthday', v: addYears(paariBirth, 18) }, { label: '21ஆவது பிறந்தநாள்', en: '21st birthday', v: addYears(paariBirth, 21) }].filter((x) => x.v > today)
    : [];

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusyPhoto(true);
    try { setPhoto(await compress(f)); } catch { setError('இந்தப் படத்தைத் திறக்க முடியவில்லை · Could not read this photo'); }
    setBusyPhoto(false);
  };

  const canSave = (body.trim().length > 0 || !!photo) && phase === 'edit' && !(isLetter && sealed && !opensOn);

  const save = async () => {
    if (!canSave) return;
    setPhase('saving'); setError(null);
    const started = Date.now();
    const r = await saveMemory({ kind, body, photo, feeling, sealed: isLetter && sealed, opensOn: isLetter && sealed ? opensOn : null, memoryDate: date });
    if (!r.ok) { setPhase('error'); setError(r.error ?? 'Could not save'); setTimeout(() => setPhase('edit'), 50); return; }
    const wait = Math.max(0, 1300 - (Date.now() - started));
    setTimeout(() => router.push(`/?saved=1&day=${r.day ?? ''}`), wait);
  };

  return (
    <main style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
      {/* the flight: the page folds into a light and drops into Paari's book */}
      <AnimatePresence>
        {phase === 'saving' && (
          <motion.div key="orb" initial={{ opacity: 0, scale: 0.2, x: '-50%', y: 0 }} animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1.4, 0.9, 0.3], y: [0, -40, 260, 520] }}
            transition={{ duration: 1.3, ease: ease.inOut, times: [0, 0.25, 0.7, 1] }}
            style={{ position: 'fixed', left: '50%', top: '38%', width: 90, height: 90, borderRadius: '50%', zIndex: 80, background: `radial-gradient(circle at 35% 35%, #fff 0%, ${'#FFB48F'} 30%, var(--paari) 60%, rgba(255,106,43,0) 72%)`, filter: 'blur(1px)' }} />
        )}
      </AnimatePresence>

      <motion.div className="stack" animate={phase === 'saving' ? { scale: 0.86, opacity: 0, y: 60, filter: 'blur(10px)' } : { scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: dur.slow, ease: ease.inOut }}
        style={{ width: '100%', maxWidth: 'var(--shell)', margin: '0 auto', minHeight: '100dvh', padding: '18px 20px 120px', gap: 22 }}>

        {/* top bar */}
        <div className="row between">
          <Link href="/" className="icon-btn" aria-label="Close"><Icon name="close" size={18} stroke={2.2} /></Link>
          <label className="row gap-2 chip" style={{ background: 'var(--surface)', border: '1px solid var(--line)', height: 40, padding: '0 14px', position: 'relative', fontSize: 13.5, cursor: 'pointer' }}>
            <Icon name="calendar" size={16} />
            {date === today ? 'இன்று' : `${d.day} ${d.monthTa} ${d.year}`}
            <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Date of this memory"
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          </label>
        </div>

        {/* kind picker */}
        <div className="hscroll" style={{ paddingBottom: 4 }} role="radiogroup" aria-label="Kind of memory">
          {KINDS.map((x) => {
            const on = x.id === kind;
            return (
              <button key={x.id} type="button" role="radio" aria-checked={on} onClick={() => setKind(x.id)}
                className="row gap-2" style={{ position: 'relative', height: 44, padding: '0 16px', borderRadius: 'var(--r-pill)', border: on ? 0 : '1px solid var(--line)', background: on ? 'transparent' : 'var(--surface)', color: on ? '#fff' : 'var(--ink)', fontWeight: 600, fontSize: 14, zIndex: 0 }}>
                {on && <motion.span layoutId="kind-pill" transition={spring.snappy} style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r-pill)', background: x.color, zIndex: -1, boxShadow: `0 12px 24px -12px ${x.color}` }} />}
                <Icon name={x.id as IconName} size={17} />
                {x.ta}
              </button>
            );
          })}
        </div>

        {/* prompt */}
        <AnimatePresence mode="wait">
          <motion.div key={kind} className="stack gap-2" initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }} transition={{ duration: dur.base, ease: ease.out }}>
            <span className="eyebrow" style={{ color: k.color }}>{k.en}</span>
            <h1 className="title-ta" style={{ fontSize: 26 }}>{k.promptTa}</h1>
            <p className="en-italic" style={{ margin: 0 }}>{k.promptEn}</p>
          </motion.div>
        </AnimatePresence>

        {/* photo */}
        <AnimatePresence initial={false}>
          {photo && (
            <motion.div key="ph" initial={{ opacity: 0, scale: 0.9, rotate: -3, height: 0 }} animate={{ opacity: 1, scale: 1, rotate: 0, height: 'auto' }} exit={{ opacity: 0, scale: 0.9, height: 0 }} transition={spring.soft}
              style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-2)' }}>
              <img src={photo} alt="Selected photo" style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }} />
              <button type="button" onClick={() => setPhoto(null)} className="icon-btn" aria-label="Remove photo" style={{ position: 'absolute', right: 12, top: 12, background: 'rgba(255,255,255,.9)', border: 0 }}>
                <Icon name="close" size={16} stroke={2.4} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* writing */}
        <label htmlFor="writer" style={{ position: 'absolute', left: -9999 }}>Write the memory</label>
        <textarea id="writer" ref={textRef} className="writer" value={body} onChange={(e) => setBody(e.target.value)} placeholder={k.placeholder} autoFocus={!openPhoto} />

        {/* tools */}
        <div className="row gap-3">
          <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => fileRef.current?.click()} className="btn btn-ghost" style={{ flex: 1 }}>
            {busyPhoto ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'flex' }}><Icon name="sun" size={18} /></motion.span> : <Icon name="photo" size={18} />}
            {photo ? 'புகைப்படத்தை மாற்று' : 'புகைப்படம் சேர்'}
          </motion.button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        {/* feelings */}
        <div className="stack gap-2">
          <span className="field-label">இன்றைய உணர்வு · How did it feel?</span>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            {FEELINGS.map((f) => {
              const on = feeling === f.id;
              return (
                <motion.button key={f.id} type="button" whileTap={{ scale: 0.92 }} onClick={() => setFeeling(on ? null : f.id)} aria-pressed={on}
                  animate={{ backgroundColor: on ? '#131313' : '#FFFFFF', color: on ? '#FFFFFF' : '#131313' }} transition={{ duration: dur.fast }}
                  style={{ height: 40, padding: '0 14px', borderRadius: 'var(--r-pill)', border: '1px solid var(--line)', fontSize: 13.5, fontWeight: 600 }}>
                  {f.ta}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* seal (letters) */}
        <AnimatePresence>
          {isLetter && (
            <motion.div key="seal" className="card stack gap-4" initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 10, height: 0 }} transition={spring.soft} style={{ padding: 18, overflow: 'hidden' }}>
              <button type="button" className="row gap-3" onClick={() => setSealed(!sealed)} style={{ border: 0, background: 'transparent', padding: 0, textAlign: 'left' }} aria-pressed={sealed}>
                <span className="switch" style={{ background: sealed ? 'var(--paari)' : 'var(--line-2)' }}><span style={{ left: sealed ? 23 : 3 }} /></span>
                <span className="stack">
                  <span style={{ fontWeight: 600 }}>{sealed ? 'பாரிக்காக முத்திரையிடு' : 'இப்போதே படிக்கலாம்'}</span>
                  <span className="muted" style={{ fontSize: 13 }}>{sealed ? 'Sealed until the day you choose — even you won’t see it in the feed.' : 'Visible in the book right away.'}</span>
                </span>
              </button>
              {sealed && (
                <div className="stack gap-2">
                  <span className="field-label">எப்போது திறக்கலாம்? · Opens on</span>
                  <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    {presets.map((pr) => (
                      <button key={pr.v} type="button" onClick={() => setOpensOn(pr.v)} className="chip" style={{ height: 40, padding: '0 14px', border: '1px solid', borderColor: opensOn === pr.v ? 'var(--ink)' : 'var(--line)', background: opensOn === pr.v ? 'var(--ink)' : 'var(--surface)', color: opensOn === pr.v ? '#fff' : 'var(--ink)' }}>{pr.label}</button>
                    ))}
                    <label className="chip" style={{ height: 40, padding: '0 14px', border: '1px solid var(--line)', background: 'var(--surface)', position: 'relative', cursor: 'pointer' }}>
                      <Icon name="calendar" size={15} /> {opensOn && !presets.some((x) => x.v === opensOn) ? describeDate(opensOn).shortEn : 'வேறு தேதி'}
                      <input type="date" min={today} value={opensOn ?? ''} onChange={(e) => setOpensOn(e.target.value || null)} aria-label="Opening date" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    </label>
                  </div>
                  {!paariBirth && <Link href="/you" style={{ fontSize: 13, color: 'var(--appa)', fontWeight: 600 }}>Add Paari’s birthday to get birthday presets →</Link>}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p role="alert" style={{ color: 'var(--k-moment)', fontWeight: 600, margin: 0 }}>{error}</p>}
      </motion.div>

      {/* save bar */}
      <motion.div initial={{ y: 120 }} animate={{ y: phase === 'saving' ? 140 : 0 }} transition={spring.soft}
        style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '14px 20px max(18px, env(safe-area-inset-bottom))', background: 'linear-gradient(180deg, rgba(251,250,247,0) 0%, var(--paper) 40%)', zIndex: 40 }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <motion.button type="button" onClick={save} disabled={!canSave} whileTap={{ scale: 0.97 }} className="btn btn-paari btn-block shine" style={{ minHeight: 58, fontSize: 16 }}>
            <Icon name="book" size={20} /> பாரியின் புத்தகத்தில் சேர்
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
