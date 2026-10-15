'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon, type IconName } from './Icon';
import { Markdown } from './Markdown';
import { AnalogClock, timeLabel } from './Clocks';
import { deleteNote, saveDaily, saveNote, uploadImage } from '@/app/actions';
import { DAILY_TEMPLATE, folderOf } from '@/lib/vault';
import { describeDate } from '@/lib/dates';
void describeDate;
import { dur, ease, spring } from '@/lib/motion';

export type Backlink = { href: string; label: string; excerpt: string };

type Props = {
  mode: 'daily' | 'note';
  id: string | null;
  date?: string;
  folder: string;
  title: string;
  body: string;
  sealed: boolean;
  opensOn: string | null;
  locked: boolean;
  updatedAt: string | null;
  links: Record<string, string>;
  backlinks: Backlink[];
  tags: string[];
  header?: React.ReactNode;
  startInEdit: boolean;
  minOpenDate: string;
};

async function compress(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bitmap.width * scale); c.height = Math.round(bitmap.height * scale);
  c.getContext('2d')!.drawImage(bitmap, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.82);
}

export function Editor(p: Props) {
  const [body, setBody] = useState(p.body || (p.mode === 'daily' ? DAILY_TEMPLATE : ''));
  const [title, setTitle] = useState(p.title);
  const [sealed, setSealed] = useState(p.sealed);
  const [opensOn, setOpensOn] = useState(p.opensOn);
  const [editing, setEditing] = useState(p.startInEdit);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState(p.updatedAt);
  const [peek, setPeek] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, start] = useTransition();
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);
  const folder = folderOf(p.folder);
  const isLetter = p.folder === 'letters';

  const persist = useCallback(async (b: string, t: string, s: boolean, o: string | null) => {
    setStatus('saving');
    if (p.mode === 'daily' && p.date) await saveDaily(p.date, b);
    else if (p.id) await saveNote({ id: p.id, title: t, body: b, sealed: s, opensOn: o });
    setStatus('saved');
    setLastSaved(new Date().toISOString());
  }, [p.mode, p.date, p.id]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (p.mode === 'daily' && !p.id && body === DAILY_TEMPLATE) return;
    if (timer.current) clearTimeout(timer.current);
    setStatus('saving');
    timer.current = setTimeout(() => persist(body, title, sealed, opensOn), 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [body, title, sealed, opensOn, persist, p.mode, p.id]);

  useEffect(() => {
    const t = ta.current; if (!t || !editing) return;
    t.style.height = 'auto'; t.style.height = `${Math.max(320, t.scrollHeight + 40)}px`;
  }, [body, editing]);

  const edit = (fn: (sel: string, before: string, after: string) => { text: string; cursor: number }) => {
    const t = ta.current; if (!t) return;
    const s = t.selectionStart, e = t.selectionEnd;
    const r = fn(body.slice(s, e), body.slice(0, s), body.slice(e));
    setBody(r.text);
    requestAnimationFrame(() => { t.focus(); t.setSelectionRange(r.cursor, r.cursor); });
  };
  const wrap = (l: string, r = l) => edit((sel, b, a) => ({ text: b + l + sel + r + a, cursor: (b + l + sel).length }));
  const linePrefix = (pre: string) => edit((sel, b, a) => {
    const start = b.lastIndexOf('\n') + 1;
    const text = b.slice(0, start) + pre + b.slice(start) + sel + a;
    return { text, cursor: (b + pre + sel).length };
  });
  const insert = (s: string) => edit((sel, b, a) => ({ text: b + s + sel + a, cursor: (b + s).length }));
  const stamp = () => {
    const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
    insert(`**${time}** — `);
  };
  const onPhoto = async (f?: File) => {
    if (!f) return;
    setUploading(true);
    try {
      const r = await uploadImage(await compress(f));
      if (r.ok) insert(`\n![](/api/img/${r.id})\n`);
    } finally { setUploading(false); }
  };
  const toggleTask = (line: number) => {
    const lines = body.split('\n');
    lines[line] = lines[line].replace(/\[( |x|X)\]/, (m) => (m === '[ ]' ? '[x]' : '[ ]'));
    setBody(lines.join('\n'));
  };

  const tools: { icon: IconName; label: string; run: () => void }[] = [
    { icon: 'heading', label: 'தலைப்பு', run: () => linePrefix('## ') },
    { icon: 'bold', label: '', run: () => wrap('**') },
    { icon: 'list', label: '', run: () => linePrefix('- ') },
    { icon: 'task', label: '', run: () => linePrefix('- [ ] ') },
    { icon: 'quote', label: '', run: () => linePrefix('> ') },
    { icon: 'link', label: '[[ ]]', run: () => wrap('[[', ']]') },
    { icon: 'hash', label: 'குறி', run: () => insert('#') },
    { icon: 'clock', label: 'நேரம்', run: stamp },
    { icon: 'photo', label: uploading ? '…' : 'படம்', run: () => file.current?.click() },
  ];

  const hidden = p.locked && !peek;

  return (
    <div className="note-wrap">
      {/* crumbs + mode */}
      <div className="row between gap-3" style={{ marginBottom: 18 }}>
        <div className="crumbs">
          <span style={{ display: 'flex', color: folder.color }}><Icon name={folder.icon} size={15} /></span>
          <span>{folder.ta}</span>
          {p.mode === 'note' && <><Icon name="chev" size={12} /><span style={{ color: 'var(--ink)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span></>}
        </div>
        <div className="row gap-2" style={{ flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            <motion.span key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="row gap-1" style={{ fontSize: 12, color: status === 'saving' ? 'var(--paari)' : 'var(--muted)' }}>
              {status === 'saving' ? (
                <><motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--paari)' }} /> சேமிக்கிறது</>
              ) : status === 'saved' ? <><Icon name="check" size={13} stroke={2.6} color="var(--green)" /> சேமிக்கப்பட்டது</> : lastSaved ? <><AnalogClock size={14} at={lastSaved} /> {timeLabel(lastSaved)}</> : null}
            </motion.span>
          </AnimatePresence>
          {!hidden && (
            <div className="row" style={{ position: 'relative', background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', padding: 3 }}>
              {[{ v: true, ta: 'எழுது', icon: 'pen' as IconName }, { v: false, ta: 'படி', icon: 'eye' as IconName }].map((m) => (
                <button key={m.ta} onClick={() => setEditing(m.v)} className="row gap-1" style={{ position: 'relative', height: 30, padding: '0 10px', fontSize: 12.5, fontWeight: 600, color: editing === m.v ? 'var(--ink)' : 'var(--muted)', zIndex: 1 }}>
                  {editing === m.v && <motion.span layoutId={`mode-${p.id ?? p.date}`} transition={spring.snappy} style={{ position: 'absolute', inset: 0, background: 'var(--bg)', borderRadius: 7, boxShadow: 'var(--shadow-1)', zIndex: -1 }} />}
                  <Icon name={m.icon} size={14} /> {m.ta}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {p.header}

      {p.mode === 'note' && (
        <input className="note-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Note title" placeholder="தலைப்பு · Title" style={{ marginBottom: 10 }} />
      )}

      {/* letters: seal */}
      {isLetter && (
        <div className="row gap-3" style={{ flexWrap: 'wrap', padding: '12px 14px', margin: '6px 0 18px', borderRadius: 'var(--r-md)', background: 'var(--paari-soft)' }}>
          <button className="row gap-2" onClick={() => setSealed(!sealed)} aria-pressed={sealed} style={{ fontWeight: 600, fontSize: 13.5 }}>
            <span style={{ width: 40, height: 24, borderRadius: 12, background: sealed ? 'var(--paari)' : 'var(--line-2)', position: 'relative', transition: 'background-color var(--dur-base)' }}>
              <motion.span animate={{ x: sealed ? 18 : 2 }} transition={spring.snappy} style={{ position: 'absolute', top: 2, left: 0, width: 20, height: 20, borderRadius: 10, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.25)' }} />
            </span>
            {sealed ? 'பாரிக்காக முத்திரையிடப்பட்டது · Sealed' : 'முத்திரையிடு · Seal for Paari'}
          </button>
          {sealed && (
            <label className="row gap-2" style={{ fontSize: 13 }}>திறக்கும் நாள்
              <input type="date" className="input" min={p.minOpenDate} value={opensOn ?? ''} onChange={(e) => setOpensOn(e.target.value || null)} style={{ minHeight: 34, width: 'auto', padding: '0 8px' }} />
            </label>
          )}
        </div>
      )}

      {hidden ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stack gap-3" style={{ padding: 24, borderRadius: 'var(--r-lg)', background: 'var(--ink)', color: '#fff', marginTop: 10 }}>
          <span className="row gap-2" style={{ fontSize: 13, color: '#CFCBC4' }}><Icon name="lock" size={16} /> Sealed until {p.opensOn ? describeDate(p.opensOn).shortEn : 'later'}</span>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 22 }}>இந்தக் கடிதம் பாரிக்காகக் காத்திருக்கிறது.</span>
          <button className="btn" onClick={() => { setPeek(true); setEditing(true); }} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.12)', color: '#fff' }}>Appa only — open to edit</button>
        </motion.div>
      ) : editing ? (
        <>
          <div className="toolbar" role="toolbar" aria-label="Formatting">
            {tools.map((t) => (
              <motion.button key={t.icon} whileTap={{ scale: 0.88 }} onMouseDown={(e) => e.preventDefault()} onClick={t.run} aria-label={t.label || t.icon} title={t.label || t.icon}>
                <Icon name={t.icon} size={16} /> {t.label}
              </motion.button>
            ))}
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
          </div>
          <motion.textarea key="ta" ref={ta} className="editor" value={body} onChange={(e) => setBody(e.target.value)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur.base }}
            placeholder="எழுதத் தொடங்கு… [[இணைப்பு]] #குறிச்சொல்" aria-label="Note text" spellCheck={false} />
        </>
      ) : (
        <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur.base, ease: ease.out }}
          onDoubleClick={() => setEditing(true)} title="Double-tap to edit">
          {body.trim() ? <Markdown body={body} links={p.links} onToggle={toggleTask} /> : <p className="muted">இன்னும் எதுவும் எழுதவில்லை. “எழுது” அழுத்தித் தொடங்கு.</p>}
        </motion.div>
      )}

      {/* backlinks */}
      <section className="stack gap-3" style={{ marginTop: 48, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
        <span className="eyebrow">இணைந்த குறிப்புகள் · Linked mentions ({p.backlinks.length})</span>
        {p.backlinks.length === 0 && <span style={{ fontSize: 13.5, color: 'var(--faint)' }}>வேறு குறிப்புகள் இதை இன்னும் இணைக்கவில்லை. Link it from another note with [[{p.mode === 'daily' ? p.date : title}]].</span>}
        {p.backlinks.map((b, i) => (
          <motion.div key={b.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={b.href} className="stack" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--side)', border: '1px solid var(--line)' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--appa)' }}>{b.label}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{b.excerpt}</span>
            </Link>
          </motion.div>
        ))}
        {p.mode === 'note' && p.id && (
          <button onClick={() => setConfirm(true)} className="row gap-2" style={{ alignSelf: 'flex-start', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}><Icon name="trash" size={15} /> இந்தக் குறிப்பை நீக்கு · Delete note</button>
        )}
      </section>

      <AnimatePresence>
        {confirm && p.id && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(false)} style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(20,20,20,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.94, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }} transition={spring.snappy} className="card stack gap-3" style={{ padding: 22, maxWidth: 380, width: '100%', boxShadow: 'var(--shadow-2)' }}>
              <span className="title-ta" style={{ fontSize: 19 }}>இந்தக் குறிப்பை நீக்கவா?</span>
              <span className="muted" style={{ fontSize: 14 }}>“{title}” will be removed from the vault. This cannot be undone.</span>
              <div className="row gap-2">
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>வேண்டாம்</button>
                <button className="btn" style={{ flex: 1, background: '#B42318', color: '#fff' }} onClick={() => start(() => deleteNote(p.id!))}>நீக்கு</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
