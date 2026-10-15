'use client';

import Link from 'next/link';
import { Fragment, useTransition } from 'react';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { openSwitcher } from './Shell';
import { openLink } from '@/app/actions';
import { isIsoDate, parseBlocks, parseInline, type Inline } from '@/lib/md';
import { describeDate } from '@/lib/dates';
import { dur, ease } from '@/lib/motion';

export function Markdown({ body, links, onToggle }: { body: string; links: Record<string, string>; onToggle?: (line: number) => void }) {
  const [, start] = useTransition();
  const blocks = parseBlocks(body);

  const inline = (parts: Inline[]) => parts.map((p, i) => {
    switch (p.t) {
      case 'bold': return <strong key={i}>{p.v}</strong>;
      case 'italic': return <em key={i}>{p.v}</em>;
      case 'code': return <code key={i}>{p.v}</code>;
      case 'tag': return <button key={i} className="tag" onClick={() => openSwitcher(`#${p.v}`)}>#{p.v}</button>;
      case 'link': {
        const label = isIsoDate(p.label) ? (() => { const d = describeDate(p.label); return `${d.day} ${d.monthTa} ${d.year}`; })() : p.label;
        const href = links[p.target.toLowerCase()] ?? (isIsoDate(p.target) ? `/daily/${p.target}` : null);
        return href
          ? <Link key={i} href={href} className="wikilink">{label}</Link>
          : <button key={i} className="wikilink" style={{ opacity: 0.75 }} title="Create this note" onClick={() => start(() => openLink(p.target))}>{label}</button>;
      }
      default: return <Fragment key={i}>{p.v}</Fragment>;
    }
  });

  return (
    <div className="md">
      {blocks.map((b, i) => {
        const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: dur.base, ease: ease.out, delay: Math.min(i, 14) * 0.025 } };
        switch (b.t) {
          case 'h': { const H = (`h${b.level}`) as 'h1' | 'h2' | 'h3'; return <motion.div key={i} {...anim}><H>{inline(parseInline(b.text))}</H></motion.div>; }
          case 'quote': return <motion.blockquote key={i} {...anim}>{inline(parseInline(b.text))}</motion.blockquote>;
          case 'li': return <motion.div key={i} className="li" {...anim}><span>{inline(parseInline(b.text))}</span></motion.div>;
          case 'task': return (
            <motion.div key={i} className={`task ${b.done ? 'done' : ''}`} {...anim}>
              <button className={`box ${b.done ? 'on' : ''}`} onClick={() => onToggle?.(b.line)} aria-label={b.done ? 'Mark not done' : 'Mark done'} disabled={!onToggle}>
                {b.done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'flex', color: '#fff' }}><Icon name="check" size={13} stroke={3} /></motion.span>}
              </button>
              <span>{inline(parseInline(b.text))}</span>
            </motion.div>
          );
          case 'img': return <motion.img key={i} src={b.src} alt={b.alt} loading="lazy" {...anim} />;
          case 'hr': return <hr key={i} />;
          case 'gap': return <div key={i} style={{ height: 8 }} />;
          default: return <motion.p key={i} {...anim}>{inline(parseInline(b.text))}</motion.p>;
        }
      })}
    </div>
  );
}
