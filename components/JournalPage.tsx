'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon, type IconName } from './Icon';
import { AnalogClock, timeLabel } from './Clocks';
import { Markdown } from './Markdown';
import { TogetherTimer } from './TogetherTimer';
import { saveDay, setMoments } from '@/app/actions';
import { describeDate } from '@/lib/dates';
import { MOMENTS, momentOf } from '@/lib/moments';
import { ease, spring } from '@/lib/motion';

type Past = { date: string; excerpt: string; moments: string[] };
type Session = { id: number; seconds: number; activity: string; at: string };

const TOOLS: { icon: IconName; label: string; kind: 'line' | 'wrap'; mark: string }[] = [
  { icon: 'heading', label: 'Heading', kind: 'line', mark: '## ' },
  { icon: 'bold', label: 'Bold', kind: 'wrap', mark: '**' },
  { icon: 'list', label: 'List', kind: 'line', mark: '- ' },
  { icon: 'task', label: 'Checklist', kind: 'line', mark: '- [ ] ' },
  { icon: 'quote', label: 'Quote', kind: 'line', mark: '> ' },
];

export function JournalPage({ date, today, body, moments, updatedAt, prev, next, age, hasBirth, sessions, past }: {
  date: string; today: string; body: string; moments: string[]; updatedAt: string | null; prev: string; next: string | null;
  age: string | null; hasBirth: boolean; sessions: Session[]; past: Past[];
}) {
  const [text, setText] = useState(body);
  const [mode, setMode] = useState<'read' | 'write'>(body.trim() ? 'read' : 'write');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [savedAt, setSavedAt] = useState(updatedAt);
  const [marks, setMarks] = useState<string[]>(moments);
  const [, startMarks] = useTransition();
  const first = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const d = describeDate(date);
  const isToday = date === today;

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => { const r = await saveDay(date, text); if (r.at) setSavedAt(r.at); setStatus('saved'); }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [text, date]);

  const toggleMark = (id: string) => {
    const nextMarks = marks.includes(id) ? marks.filter((m) => m !== id) : [...marks, id];
    setMarks(nextMarks);
    startMarks(async () => { await setMoments(date, nextMarks); });
  };

  const applyTool = (tool: (typeof TOOLS)[number]) => {
    const el = area.current; if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    let out: string, caret: number;
    if (tool.kind === 'wrap') {
      const sel = value.slice(a, b) || 'text';
      out = value.slice(0, a) + tool.mark + sel + tool.mark + value.slice(b);
      caret = a + tool.mark.length + sel.length + tool.mark.length;
    } else {
      const lineStart = value.lastIndexOf('\n', a - 1) + 1;
      out = value.slice(0, lineStart) + tool.mark + value.slice(lineStart);
      caret = b + tool.mark.length;
    }
    setText(out);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(caret, caret); });
  };

  const toggleTask = (line: number) => {
    const lines = text.split('\n');
    lines[line] = lines[line].replace(/\[( |x|X)\]/, (_m, c) => (c === ' ' ? '[x]' : '[ ]'));
    setText(lines.join('\n'));
  };

  const write = () => { setMode('write'); requestAnimationFrame(() => { const el = area.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }); };
  const words = (text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).length;

  return (
    <motion.article className="journal" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: ease.out }}>
      <header className="stack gap-3" style={{ marginBottom: 22 }}>
        <div className="row between gap-3" style={{ alignItems: 'flex-end' }}>
          <div className="row gap-4" style={{ alignItems: 'flex-end', minWidth: 0 }}>
            <motion.span className="num" key={date} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft} style={{ fontSize: 76, lineHeight: 0.8 }}>{d.day}</motion.span>
            <span className="stack" style={{ minWidth: 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.05 }}>{d.monthEn} {d.year}</span>
              <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{d.weekdayEn}{isToday ? ' · Today' : ''}</span>
            </span>
          </div>
          <div className="row" style={{ gap: 4, flexShrink: 0 }}>
            <Link href={`/daily/${prev}`} className="icon-btn" aria-label="Previous day"><Icon name="back" size={18} stroke={2.2} /></Link>
            {next ? <Link href={`/daily/${next}`} className="icon-btn" aria-label="Next day"><Icon name="next" size={18} stroke={2.2} /></Link> : <span style={{ width: 36 }} />}
          </div>
        </div>

        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {age ? (
            <span className="meta-pill"><span className="dot" style={{ background: 'var(--paari)' }} />Paari <span className="ta-note">பாரி</span> {isToday ? 'is' : 'was'} {age}</span>
          ) : !hasBirth ? (
            <Link href="/" className="meta-pill" style={{ color: 'var(--appa)' }}><Icon name="plus" size={13} stroke={2.4} /> Add Paari&apos;s birthday to see his age here</Link>
          ) : null}
          {savedAt && (
            <span className="meta-pill"><AnalogClock size={18} at={savedAt} showSeconds={false} ticks={false} />Last written {timeLabel(savedAt)}</span>
          )}
        </div>
      </header>

      <section className="stack gap-2" style={{ marginBottom: 26 }} aria-label="Moments on this day">
        <span className="eyebrow">What kind of day was it?</span>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          {MOMENTS.map((m) => {
            const on = marks.includes(m.id);
            return (
              <motion.button key={m.id} type="button" onClick={() => toggleMark(m.id)} aria-pressed={on} whileTap={{ scale: 0.9 }} layout transition={spring.snappy}
                className="moment-chip" style={{ borderColor: on ? m.color : 'var(--line)', background: on ? m.soft : 'var(--bg)', color: on ? m.color : 'var(--ink-2)' }}>
                <span style={{ position: 'relative', display: 'flex' }}>
                  <Icon name={m.icon} size={16} stroke={2} />
                  <AnimatePresence>
                    {on && [0, 1, 2, 3, 4, 5].map((i) => (
                      <motion.span key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos((i / 6) * Math.PI * 2) * 18, y: Math.sin((i / 6) * Math.PI * 2) * 18, opacity: 0, scale: 0.4 }} transition={{ duration: 0.55, ease: ease.out }}
                        style={{ position: 'absolute', left: 6, top: 6, width: 5, height: 5, borderRadius: 3, background: m.color, pointerEvents: 'none' }} />
                    ))}
                  </AnimatePresence>
                </span>
                {m.en}
                {on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy} style={{ display: 'flex' }}><Icon name="check" size={13} stroke={2.8} /></motion.span>}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="page-card">
        <div className="row between" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'write' ? (
              <motion.div key="tools" className="row" style={{ gap: 2 }} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                {TOOLS.map((tl) => (
                  <button key={tl.label} type="button" className="icon-btn" title={tl.label} aria-label={tl.label} onMouseDown={(e) => e.preventDefault()} onClick={() => applyTool(tl)}><Icon name={tl.icon} size={17} /></button>
                ))}
              </motion.div>
            ) : (
              <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 13, color: 'var(--muted)', paddingLeft: 6 }}>Tap the page to write</motion.span>
            )}
          </AnimatePresence>
          <div className="seg" role="tablist" aria-label="Page mode">
            {(['write', 'read'] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => (k === 'write' ? write() : setMode('read'))} disabled={k === 'read' && !text.trim()}>
                {mode === k && <motion.span layoutId={`seg-${date}`} className="seg-on" transition={spring.snappy} />}
                <span style={{ position: 'relative' }}>{k === 'write' ? 'Write' : 'Read'}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '22px 24px 26px' }}>
          {mode === 'write' ? (
            <>
              <label htmlFor="page" style={{ position: 'absolute', left: -9999 }}>Journal entry for {d.shortEn}</label>
              <textarea ref={area} id="page" className="writer" value={text} onChange={(e) => setText(e.target.value)} autoFocus={isToday && !body}
                placeholder={isToday ? 'What did you notice about Paari today?' : 'What happened on this day?'} />
            </>
          ) : (
            <div onClick={write} style={{ cursor: 'text', minHeight: 160 }} role="button" tabIndex={0} aria-label="Edit this page" onKeyDown={(e) => { if (e.key === 'Enter') write(); }}>
              <Markdown body={text} onToggle={toggleTask} />
            </div>
          )}
        </div>

        <footer className="row between" style={{ padding: '10px 18px', borderTop: '1px solid var(--line)', fontSize: 12.5, color: 'var(--muted)' }}>
          <span>{words} {words === 1 ? 'word' : 'words'}</span>
          <AnimatePresence mode="wait">
            <motion.span key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="row gap-1">
              {status === 'saving' && <><motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--paari)' }} /> Saving…</>}
              {status === 'saved' && <><Icon name="check" size={13} stroke={2.6} color="var(--appa)" /> Saved</>}
              {status === 'idle' && 'Saves as you type'}
            </motion.span>
          </AnimatePresence>
        </footer>
      </section>

      <div className="stack gap-4" style={{ marginTop: 22 }}>
        {(isToday || sessions.length > 0) && <TogetherTimer sessions={sessions} live={isToday} />}

        {past.length > 0 && (
          <section className="card stack gap-3" style={{ padding: 20 }}>
            <div className="row gap-3">
              <span className="badge" style={{ background: 'var(--paari-soft)', color: 'var(--paari)' }}><Icon name="calendar" size={18} /></span>
              <span className="stack">
                <span style={{ fontWeight: 650, fontSize: 15 }}>On this day</span>
                <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>What you wrote on {d.day} {d.monthEn} in earlier years</span>
              </span>
            </div>
            {past.map((p, i) => {
              const pd = describeDate(p.date);
              const yearsAgo = d.year - pd.year;
              return (
                <motion.div key={p.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                  <Link href={`/daily/${p.date}`} className="past">
                    <span className="eyebrow" style={{ color: 'var(--paari)' }}>{yearsAgo === 1 ? 'One year ago' : `${yearsAgo} years ago`} · {pd.year}</span>
                    <span style={{ fontSize: 15, lineHeight: 1.7 }}>{p.excerpt}</span>
                    {p.moments.length > 0 && (
                      <span className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                        {p.moments.map((id) => { const m = momentOf(id); return m ? <span key={id} className="mini-chip" style={{ background: m.soft, color: m.color }}>{m.en}</span> : null; })}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </section>
        )}
      </div>
    </motion.article>
  );
}
