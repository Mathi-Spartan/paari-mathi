'use client';

import { Fragment } from 'react';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { parseBlocks, parseInline, type Inline } from '@/lib/md';
import { dur, ease } from '@/lib/motion';

/** Renders a journal page: headings, bold, lists, checklists and quotes. Checklist boxes can be ticked. */
export function Markdown({ body, onToggle }: { body: string; onToggle?: (line: number) => void }) {
  const blocks = parseBlocks(body);
  const inline = (parts: Inline[]) => parts.map((p, i) => {
    switch (p.t) {
      case 'bold': return <strong key={i}>{p.v}</strong>;
      case 'italic': return <em key={i}>{p.v}</em>;
      case 'code': return <code key={i}>{p.v}</code>;
      case 'tag': return <span key={i} className="tag">#{p.v}</span>;
      case 'link': return <Fragment key={i}>{p.label}</Fragment>;
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
              <button type="button" className={`box ${b.done ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onToggle?.(b.line); }} aria-label={b.done ? 'Mark not done' : 'Mark done'} disabled={!onToggle}>
                {b.done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'flex', color: '#fff' }}><Icon name="check" size={13} stroke={3} /></motion.span>}
              </button>
              <span>{inline(parseInline(b.text))}</span>
            </motion.div>
          );
          case 'img': return null;
          case 'hr': return <hr key={i} />;
          case 'gap': return <div key={i} style={{ height: 10 }} />;
          default: return <motion.p key={i} {...anim}>{inline(parseInline(b.text))}</motion.p>;
        }
      })}
    </div>
  );
}
