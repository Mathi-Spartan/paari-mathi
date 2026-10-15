'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Icon, type IconName } from './Icon';
import { AnalogClock, LiveTime } from './Clocks';
import { createNote, lockNow } from '@/app/actions';
import { FOLDERS, type NoteMeta } from '@/lib/vault';
import { ageOn, describeDate } from '@/lib/dates';
import { spring } from '@/lib/motion';

type Props = { notes: NoteMeta[]; today: string; birth: string | null; children: React.ReactNode };

export function openSwitcher(query = '') {
  window.dispatchEvent(new CustomEvent('open-switcher', { detail: query }));
}

export function noteHref(n: Pick<NoteMeta, 'id' | 'folder' | 'note_date'>) {
  return n.folder === 'daily' && n.note_date ? `/daily/${n.note_date}` : `/note/${n.id}`;
}

export function noteLabel(n: Pick<NoteMeta, 'folder' | 'note_date' | 'title'>) {
  if (n.folder === 'daily' && n.note_date) { const d = describeDate(n.note_date); return `${d.day} ${d.monthTa} ${d.year}`; }
  return n.title;
}

const NAV: { href: string; ta: string; en: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: '/', ta: 'இன்று', en: 'Today', icon: 'pen', match: (p) => p === '/' || p.startsWith('/daily') },
  { href: '/calendar', ta: 'நாட்காட்டி', en: 'Calendar', icon: 'calendar', match: (p) => p.startsWith('/calendar') },
  { href: '/graph', ta: 'வரைபடம்', en: 'Graph', icon: 'graph', match: (p) => p.startsWith('/graph') },
  { href: '/clocks', ta: 'கடிகாரம்', en: 'Clocks', icon: 'clock', match: (p) => p.startsWith('/clocks') },
  { href: '/letters', ta: 'கடிதங்கள்', en: 'Letters', icon: 'letter', match: (p) => p.startsWith('/letters') },
];

export function Shell({ notes, today, birth, children }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({ daily: true, moments: true, firsts: true, proud: true, letters: true });
  const [sideOpen, setSideOpen] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [switcher, setSwitcher] = useState<string | null>(null);

  useEffect(() => { setDrawer(false); }, [path]);
  useEffect(() => {
    const onOpen = (e: Event) => setSwitcher((e as CustomEvent<string>).detail ?? '');
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSwitcher(''); } };
    window.addEventListener('open-switcher', onOpen);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('open-switcher', onOpen); window.removeEventListener('keydown', onKey); };
  }, []);

  const tags = useMemo(() => {
    const c = new Map<string, number>();
    notes.forEach((n) => n.tags.forEach((t) => c.set(t, (c.get(t) ?? 0) + 1)));
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [notes]);
  const age = ageOn(birth, today);
  const t = describeDate(today);
  const current = NAV.find((n) => n.match(path));

  const side = (
    <div className="side-inner">
      <div className="row between" style={{ padding: '14px 14px 8px 18px' }}>
        <Link href="/" className="row gap-2" style={{ minWidth: 0 }}>
          <span style={{ position: 'relative', width: 24, height: 16, flexShrink: 0 }} aria-hidden="true">
            <span style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 16, borderRadius: 8, background: 'var(--appa)' }} />
            <span style={{ position: 'absolute', left: 8, top: 0, width: 16, height: 16, borderRadius: 8, background: 'var(--paari)', mixBlendMode: 'multiply' }} />
          </span>
          <span className="stack" style={{ lineHeight: 1.15, minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>பாரியும் அப்பாவும்</span>
            <span className="muted" style={{ fontSize: 11.5 }}>Paari &amp; Appa · vault</span>
          </span>
        </Link>
        <button className="icon-btn" onClick={() => (window.innerWidth < 900 ? setDrawer(false) : setSideOpen(false))} aria-label="Close sidebar"><Icon name="sidebar" size={18} /></button>
      </div>

      {/* live clock strip */}
      <div className="row gap-3" style={{ margin: '6px 14px 10px', padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg)', border: '1px solid var(--line)' }}>
        <AnalogClock size={44} live ticks={false} />
        <span className="stack" style={{ lineHeight: 1.25, minWidth: 0 }}>
          <LiveTime size={17} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.weekdayTa} · {t.day} {t.monthTa}{age ? ` · பாரி ${age.ta}` : ''}</span>
        </span>
      </div>

      <div className="row gap-2" style={{ padding: '0 14px 8px' }}>
        <Link href={`/daily/${today}`} className="btn btn-blue" style={{ flex: 1, minHeight: 38, fontSize: 13 }}><Icon name="pen" size={16} /> இன்றைய குறிப்பு</Link>
        <button className="icon-btn" style={{ width: 38, height: 38, border: '1px solid var(--line)', background: 'var(--bg)' }} onClick={() => setSwitcher('')} aria-label="Search notes"><Icon name="search" size={17} /></button>
      </div>

      <div className="stack" style={{ paddingTop: 6 }}>
        {FOLDERS.map((f) => {
          const items = notes.filter((n) => n.folder === f.id);
          const isOpen = open[f.id];
          return (
            <div key={f.id} className="stack">
              <div className="tree-row" style={{ fontWeight: 600, color: 'var(--ink)', paddingRight: 4 }}>
                <button className="row gap-2" style={{ flex: 1, minHeight: 32, minWidth: 0 }} onClick={() => setOpen({ ...open, [f.id]: !isOpen })} aria-expanded={isOpen}>
                  <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={spring.snappy} style={{ display: 'flex', color: 'var(--faint)' }}><Icon name="chev" size={13} stroke={2.4} /></motion.span>
                  <span style={{ display: 'flex', color: f.color }}><Icon name={f.icon} size={16} /></span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.ta}</span>
                  <span className="tree-count">{items.length}</span>
                </button>
                <form action={createNote.bind(null, f.id, undefined)}>
                  <button className="icon-btn" style={{ width: 28, height: 28 }} aria-label={`New note in ${f.en}`}><Icon name="plus" size={15} /></button>
                </form>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring.soft} style={{ overflow: 'hidden' }}>
                    {items.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--faint)', padding: '2px 0 6px 52px' }}>இன்னும் இல்லை · empty</div>}
                    {items.slice(0, 40).map((n) => {
                      const href = noteHref(n);
                      const active = path === href;
                      return (
                        <Link key={n.id} href={href} className={`tree-row ${active ? 'active' : ''}`} style={{ paddingLeft: 42 }}>
                          {n.locked && <Icon name="lock" size={13} />}
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{noteLabel(n)}</span>
                          {n.folder === 'daily' && n.note_date === today && <span className="chip" style={{ height: 18, padding: '0 6px', fontSize: 10, marginLeft: 'auto', background: 'var(--paari-soft)', color: 'var(--paari)' }}>இன்று</span>}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {tags.length > 0 && (
        <div className="stack gap-2" style={{ padding: '18px 18px 10px' }}>
          <span className="eyebrow">குறிச்சொற்கள் · Tags</span>
          <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
            {tags.map(([tag, n]) => (
              <button key={tag} className="tag" onClick={() => setSwitcher(`#${tag}`)} style={{ fontSize: 12 }}>#{tag} <span style={{ opacity: 0.6, marginLeft: 4 }}>{n}</span></button>
            ))}
          </div>
        </div>
      )}

      <div className="row between" style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid var(--line)' }}>
        <Link href="/you" className="row gap-2" style={{ fontSize: 13, fontWeight: 600 }}><Icon name="you" size={17} /> அப்பா · Settings</Link>
        <form action={lockNow}><button className="icon-btn" aria-label="Lock"><Icon name="lock" size={17} /></button></form>
      </div>
    </div>
  );

  return (
    <div className={`app ${sideOpen ? '' : 'side-closed'}`}>
      <nav className="ribbon" aria-label="Views">
        {!sideOpen && <button className="icon-btn" onClick={() => setSideOpen(true)} aria-label="Open sidebar" title="Sidebar"><Icon name="sidebar" size={19} /></button>}
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`icon-btn ${n.match(path) ? 'active' : ''}`} title={`${n.ta} · ${n.en}`} aria-label={n.en} style={{ width: 38, height: 38 }}><Icon name={n.icon} size={19} /></Link>
        ))}
        <button className="icon-btn" onClick={() => setSwitcher('')} title="Search · Ctrl K" aria-label="Search" style={{ width: 38, height: 38 }}><Icon name="search" size={19} /></button>
        <Link href="/you" className={`icon-btn ${path.startsWith('/you') ? 'active' : ''}`} title="Settings" aria-label="Settings" style={{ width: 38, height: 38, marginTop: 'auto' }}><Icon name="you" size={19} /></Link>
      </nav>

      <aside className="side side-desktop" aria-label="Vault">{side}</aside>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside className="side" style={{ display: 'block' }} initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={spring.soft} aria-label="Vault">{side}</motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setDrawer(true)} aria-label="Open vault"><Icon name="menu" size={21} /></button>
          <span className="row gap-2" style={{ flex: 1, minWidth: 0 }}>
            <AnalogClock size={24} live ticks={false} showSeconds={false} />
            <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{current ? `${current.ta} · ${current.en}` : 'பாரியும் அப்பாவும்'}</span>
          </span>
          <button className="icon-btn" onClick={() => setSwitcher('')} aria-label="Search"><Icon name="search" size={20} /></button>
          <Link href={`/daily/${today}`} className="icon-btn" aria-label="Today's note" style={{ background: 'var(--appa)', color: '#fff' }}><Icon name="pen" size={18} /></Link>
        </header>

        {children}

        <nav className="tabbar" aria-label="Views">
          {NAV.map((n) => {
            const on = n.match(path);
            return (
              <Link key={n.href} href={n.href} className={`tab ${on ? 'active' : ''}`}>
                {on && <motion.span layoutId="tab-dot" transition={spring.snappy} style={{ position: 'absolute', top: 6, width: 34, height: 4, borderRadius: 2, background: 'var(--appa)' }} />}
                <Icon name={n.icon} size={21} stroke={on ? 2.1 : 1.8} />
                {n.ta}
              </Link>
            );
          })}
        </nav>
      </div>

      <AnimatePresence>{switcher !== null && <Switcher notes={notes} initial={switcher} today={today} onClose={() => setSwitcher(null)} />}</AnimatePresence>
    </div>
  );
}

function Switcher({ notes, initial, today, onClose }: { notes: NoteMeta[]; initial: string; today: string; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState(initial);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  const results = useMemo(() => {
    const qy = query.trim().toLowerCase();
    const cmds = [
      { key: 'c-today', label: 'இன்றைய குறிப்பு · Today’s note', sub: 'Command', href: `/daily/${today}`, icon: 'pen' as IconName },
      { key: 'c-cal', label: 'நாட்காட்டி · Calendar', sub: 'Command', href: '/calendar', icon: 'calendar' as IconName },
      { key: 'c-graph', label: 'அன்பின் வரைபடம் · Graph view', sub: 'Command', href: '/graph', icon: 'graph' as IconName },
      { key: 'c-clock', label: 'கடிகாரங்கள் · Clocks', sub: 'Command', href: '/clocks', icon: 'clock' as IconName },
    ];
    const hits = notes
      .filter((n) => {
        if (!qy) return true;
        if (qy.startsWith('#')) return n.tags.some((t) => t.toLowerCase() === qy.slice(1));
        return noteLabel(n).toLowerCase().includes(qy) || n.title.toLowerCase().includes(qy) || n.excerpt.toLowerCase().includes(qy) || n.tags.some((t) => t.toLowerCase().includes(qy));
      })
      .slice(0, 30)
      .map((n) => ({ key: n.id, label: noteLabel(n), sub: n.locked ? 'முத்திரையிடப்பட்டது · sealed' : n.excerpt || FOLDERS.find((f) => f.id === n.folder)?.ta || '', href: noteHref(n), icon: (FOLDERS.find((f) => f.id === n.folder)?.icon ?? 'moment') as IconName }));
    return [...(qy.startsWith('#') ? [] : cmds.filter((c) => !qy || c.label.toLowerCase().includes(qy))), ...hits];
  }, [query, notes, today]);

  const go = useCallback((href: string) => { onClose(); router.push(href); }, [onClose, router]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(20,20,20,.28)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '10vh 12px 12px' }}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: -20, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -10, scale: 0.98, opacity: 0 }} transition={spring.snappy}
        role="dialog" aria-label="Search notes" style={{ width: '100%', maxWidth: 600, background: 'var(--bg)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-2)', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <div className="row gap-3" style={{ padding: '4px 16px', borderBottom: '1px solid var(--line)' }}>
          <Icon name="search" size={19} color="var(--muted)" />
          <input ref={input} value={query} onChange={(e) => { setQuery(e.target.value); setSel(0); }} placeholder="குறிப்புகள், #குறிச்சொல் தேடு · Search notes or #tags"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              if (e.key === 'Enter' && results[sel]) go(results[sel].href);
            }}
            style={{ flex: 1, height: 54, border: 0, outline: 'none', fontSize: 16, background: 'transparent' }} aria-label="Search" />
          <span className="chip" style={{ background: 'var(--paper-2)', color: 'var(--muted)' }}>Esc</span>
        </div>
        <div style={{ maxHeight: '55vh', overflowY: 'auto', padding: 6 }}>
          {results.length === 0 && <div style={{ padding: 20, color: 'var(--muted)', fontSize: 14 }}>எதுவும் கிடைக்கவில்லை · Nothing found</div>}
          {results.map((r, i) => (
            <button key={r.key} onClick={() => go(r.href)} onMouseEnter={() => setSel(i)} className="row gap-3"
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--r-sm)', background: i === sel ? 'var(--appa-soft)' : 'transparent' }}>
              <span style={{ display: 'flex', color: i === sel ? 'var(--appa)' : 'var(--muted)' }}><Icon name={r.icon} size={18} /></span>
              <span className="stack" style={{ minWidth: 0, lineHeight: 1.35 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</span>
                <span style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
