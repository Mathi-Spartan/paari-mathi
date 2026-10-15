'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@/components/Icon';
import { Countdown } from '@/components/Clocks';
import { Markdown } from '@/components/Markdown';
import { deleteLetter, sealLetter } from '@/app/actions';
import { addYears, describeDate } from '@/lib/dates';
import { spring } from '@/lib/motion';
import type { Letter } from '@/lib/notes';

const PURPLE = '#7A4FD8', PURPLE_SOFT = '#F1ECFC';

const ord = (n: number) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

function presets(today: string, birth: string | null) {
  if (!birth) return [1, 5, 10].map((n) => ({ label: `In ${n} year${n > 1 ? 's' : ''}`, date: addYears(today, n) }));
  let next = `${today.slice(0, 4)}${birth.slice(4)}`;
  if (next <= today) next = addYears(next, 1);
  const age = Number(next.slice(0, 4)) - Number(birth.slice(0, 4));
  const out = [{ label: `His ${ord(age)} birthday`, date: next }];
  for (const n of [18, 21]) { const d = addYears(birth, n); if (d > today && d !== next) out.push({ label: `His ${ord(n)} birthday`, date: d }); }
  return out;
}

function Seal({ size = 44 }: { size?: number }) {
  return (
    <span style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #9C78EC, ${PURPLE} 60%, #5B33B8)`, boxShadow: '0 6px 14px -6px rgba(91,51,184,.6), inset 0 -2px 4px rgba(0,0,0,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,.45)' }} />
      <span style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: size * 0.42, fontStyle: 'italic', lineHeight: 1 }}>P</span>
    </span>
  );
}

export function LettersView({ today, birth, letters }: { today: string; birth: string | null; letters: Letter[] }) {
  const router = useRouter();
  const options = presets(today, birth);
  const [open, setOpen] = useState(letters.length === 0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [opensOn, setOpensOn] = useState((options.find((o) => o.label.includes('18th')) ?? options[options.length - 1])?.date ?? addYears(today, 1));
  const [confirming, setConfirming] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [error, setError] = useState('');
  const [reading, setReading] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const seal = () => start(async () => {
    const r = await sealLetter(title, body, opensOn);
    if (!r.ok) { setError(r.error ?? 'Could not seal the letter.'); setConfirming(false); return; }
    setSealed(true);
    setTimeout(() => { setSealed(false); setOpen(false); setTitle(''); setBody(''); setConfirming(false); router.refresh(); }, 1700);
  });

  const waiting = letters.filter((l) => !l.open);
  const opened = letters.filter((l) => l.open);

  return (
    <main className="wide-page stack gap-5">
      <header className="row between gap-3" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="stack gap-1">
          <span className="eyebrow">For grown-up Paari</span>
          <h1 className="display" style={{ fontSize: 'clamp(38px, 6vw, 56px)' }}>Letters <span className="ta-note" style={{ fontSize: 20, fontFamily: 'var(--font-head)' }}>கடிதங்கள்</span></h1>
          <p style={{ margin: 0, color: 'var(--muted)', maxWidth: 520 }}>Write to the man he will become. Each letter is sealed and stays closed until the day you choose.</p>
        </div>
        {!open && <button type="button" className="btn btn-blue" onClick={() => setOpen(true)}><Icon name="plus" size={17} />Write a letter</button>}
      </header>

      <AnimatePresence>
        {open && (
          <motion.section key="composer" className="card stack gap-4 composer" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.9 }} transition={spring.soft}
            style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence>
              {sealed && (
                <motion.div className="stack gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.94)', zIndex: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div initial={{ scale: 2.4, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}><Seal size={84} /></motion.div>
                  <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Sealed until {describeDate(opensOn).shortEn}</motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="row between">
              <span style={{ fontWeight: 650, fontSize: 15 }}>A new letter</span>
              {letters.length > 0 && <button type="button" className="icon-btn" aria-label="Close" onClick={() => setOpen(false)}><Icon name="close" size={17} /></button>}
            </div>
            <input className="input" placeholder="Title — e.g. On your 18th birthday" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea className="writer letter-writer" placeholder="My dear Paari, on the day you read this…" value={body} onChange={(e) => { setBody(e.target.value); setError(''); }} />
            <div className="stack gap-2">
              <span className="eyebrow">Opens on</span>
              <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                {options.map((o) => (
                  <button key={o.date} type="button" className="pill" aria-pressed={opensOn === o.date} onClick={() => setOpensOn(o.date)}
                    style={{ borderColor: opensOn === o.date ? PURPLE : 'var(--line)', background: opensOn === o.date ? PURPLE_SOFT : 'var(--bg)', color: opensOn === o.date ? PURPLE : 'var(--ink-2)' }}>
                    {o.label} · {describeDate(o.date).year}
                  </button>
                ))}
                <input type="date" className="input" style={{ width: 'auto', minHeight: 36, padding: '0 10px' }} min={today} value={opensOn} onChange={(e) => setOpensOn(e.target.value)} aria-label="Custom opening day" />
              </div>
            </div>
            {error && <span style={{ color: '#C2410C', fontSize: 13.5 }}>{error}</span>}
            <AnimatePresence mode="wait" initial={false}>
              {confirming ? (
                <motion.div key="confirm" className="confirm" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <span style={{ fontSize: 14 }}>Once sealed, this letter stays closed until <strong>{describeDate(opensOn).shortEn}</strong> — even for you.</span>
                  <div className="row gap-2">
                    <button type="button" className="btn btn-line" onClick={() => setConfirming(false)}>Keep writing</button>
                    <button type="button" className="btn" style={{ background: PURPLE, color: '#fff' }} disabled={pending} onClick={seal}><Icon name="lock" size={16} />Seal it</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="go" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="row" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="btn" style={{ background: PURPLE, color: '#fff' }} disabled={!body.trim()} onClick={() => setConfirming(true)}><Icon name="lock" size={16} />Seal the letter</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      {waiting.length > 0 && (
        <section className="stack gap-3">
          <span className="eyebrow">Sealed · {waiting.length}</span>
          <div className="letter-grid">
            {waiting.map((l, i) => (
              <motion.article key={l.id} className="card envelope" layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.soft, delay: i * 0.06 }}>
                <div className="flap" aria-hidden="true" />
                <div className="row gap-3" style={{ position: 'relative' }}>
                  <Seal />
                  <span className="stack" style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 650, fontSize: 15.5 }}>{l.title}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Written {describeDate(l.writtenOn).shortEn} · Opens {describeDate(l.opensOn).shortEn}</span>
                  </span>
                  <button type="button" className="icon-btn" aria-label="Delete this letter" onClick={() => { if (confirm('Delete this sealed letter forever?')) start(async () => { await deleteLetter(l.id); router.refresh(); }); }}><Icon name="trash" size={16} /></button>
                </div>
                <div style={{ position: 'relative', marginTop: 14 }}><Countdown target={l.opensOn} from={l.writtenOn} compact /></div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {opened.length > 0 && (
        <section className="stack gap-3">
          <span className="eyebrow">Opened · {opened.length}</span>
          {opened.map((l) => (
            <motion.article key={l.id} className="card" layout style={{ padding: 20 }}>
              <button type="button" className="row between gap-3" style={{ width: '100%', textAlign: 'left' }} onClick={() => setReading(reading === l.id ? null : l.id)} aria-expanded={reading === l.id}>
                <span className="stack"><span style={{ fontWeight: 650 }}>{l.title}</span><span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Opened {describeDate(l.opensOn).shortEn}</span></span>
                <motion.span animate={{ rotate: reading === l.id ? 90 : 0 }} style={{ display: 'flex' }}><Icon name="next" size={17} /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {reading === l.id && l.body && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ paddingTop: 14 }}><Markdown body={l.body} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          ))}
        </section>
      )}
    </main>
  );
}
