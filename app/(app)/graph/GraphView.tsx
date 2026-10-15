'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { AnalogClock, LiveTime } from '@/components/Clocks';
import { FOLDERS, type NoteMeta } from '@/lib/vault';
import { hrefOf, labelOf } from '@/lib/linking';
import { ease } from '@/lib/motion';

type N = { id: string; label: string; kind: 'paari' | 'note' | 'tag'; color: string; r: number; href?: string; x: number; y: number; vx: number; vy: number; fixed?: boolean };
type E = { a: string; b: string; kind: 'tag' | 'link' | 'heart' };

const COLORS: Record<string, string> = { daily: '#2457E6', moments: '#F2672A', firsts: '#12865F', proud: '#B5700A', letters: '#1C1C1C' };

export function GraphView({ notes }: { notes: NoteMeta[] }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 560 });
  const [, setTick] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const heat = useRef(1);

  const { nodes, edges } = useMemo(() => {
    const ns: N[] = [{ id: 'paari', label: 'பாரி', kind: 'paari', color: '#F2672A', r: 24, x: 0, y: 0, vx: 0, vy: 0, fixed: true }];
    const es: E[] = [];
    const byKey = new Map<string, string>();
    notes.forEach((n) => { byKey.set(n.title.toLowerCase(), n.id); if (n.note_date) byKey.set(n.note_date, n.id); });
    const tags = new Set<string>();
    notes.forEach((n, i) => {
      const a = (i / Math.max(1, notes.length)) * Math.PI * 2;
      ns.push({ id: n.id, label: n.locked ? 'கடிதம்' : labelOf(n), kind: 'note', color: COLORS[n.folder] ?? '#2457E6', r: 7 + Math.min(9, n.words / 30), href: hrefOf(n), x: Math.cos(a) * 220, y: Math.sin(a) * 160, vx: 0, vy: 0 });
      n.tags.forEach((t) => { tags.add(t); es.push({ a: n.id, b: `tag:${t}`, kind: 'tag' }); });
      n.links.forEach((l) => { const to = byKey.get(l.toLowerCase()) ?? byKey.get(l); if (to && to !== n.id) es.push({ a: n.id, b: to, kind: 'link' }); });
      if (!n.tags.length && !n.links.length) es.push({ a: n.id, b: 'paari', kind: 'heart' });
    });
    [...tags].forEach((t, i) => {
      const a = (i / Math.max(1, tags.size)) * Math.PI * 2 + 0.4;
      ns.push({ id: `tag:${t}`, label: `#${t}`, kind: 'tag', color: '#2457E6', r: 5, x: Math.cos(a) * 110, y: Math.sin(a) * 90, vx: 0, vy: 0 });
      es.push({ a: `tag:${t}`, b: 'paari', kind: 'heart' });
    });
    return { nodes: ns, edges: es };
  }, [notes]);

  const index = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const neighbours = useMemo(() => {
    const m = new Map<string, Set<string>>();
    edges.forEach((e) => { (m.get(e.a) ?? m.set(e.a, new Set()).get(e.a)!).add(e.b); (m.get(e.b) ?? m.set(e.b, new Set()).get(e.b)!).add(e.a); });
    return m;
  }, [edges]);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: Math.max(420, Math.min(720, el.clientWidth * 0.75)) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const step = () => {
      const k = heat.current;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y; const d2 = dx * dx + dy * dy + 0.01; const d = Math.sqrt(d2);
          const f = (4200 / d2) * k; dx /= d; dy /= d;
          a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
        }
      }
      edges.forEach((e) => {
        const a = index.get(e.a), b = index.get(e.b); if (!a || !b) return;
        const rest = e.kind === 'heart' ? 170 : e.kind === 'tag' ? 100 : 120;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - rest) * 0.012 * k;
        a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
      });
      nodes.forEach((n) => {
        if (n.fixed || drag.current?.id === n.id) { n.vx = 0; n.vy = 0; return; }
        n.vx -= n.x * 0.0025 * k; n.vy -= n.y * 0.0025 * k;
        n.vx *= 0.82; n.vy *= 0.82;
        n.x += n.vx; n.y += n.vy;
      });
      heat.current = Math.max(0.12, heat.current * 0.995);
      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [nodes, edges, index]);

  const toWorld = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
    return { x: e.clientX - rect.left - size.w / 2, y: e.clientY - rect.top - size.h / 2 };
  };
  const lit = (id: string) => !hover || hover === id || neighbours.get(hover)?.has(id);
  const linkCount = edges.filter((e) => e.kind === 'link').length;

  return (
    <main className="page">
      <div className="row between gap-3" style={{ flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="stack">
          <span className="eyebrow">Graph view</span>
          <h1 className="title-ta" style={{ fontSize: 24 }}>அன்பின் வரைபடம் · The graph of love</h1>
          <span className="muted" style={{ fontSize: 13.5 }}>Every note, tag and [[link]] — all leading back to Paari.</span>
        </div>
        <div className="row gap-3 card" style={{ padding: '8px 14px 8px 8px' }}>
          <AnalogClock size={46} live ticks={false} />
          <span className="stack" style={{ lineHeight: 1.3 }}>
            <LiveTime size={16} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{notes.length} குறிப்புகள் · {linkCount} இணைப்புகள்</span>
          </span>
        </div>
      </div>

      <motion.div ref={box} className="card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: ease.out }}
        style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, #FFF6F0 0%, #FFFFFF 60%)', touchAction: 'none' }}>
        <svg width={size.w} height={size.h} viewBox={`${-size.w / 2} ${-size.h / 2} ${size.w} ${size.h}`} role="img" aria-label="Graph of notes"
          onPointerMove={(e) => { if (!drag.current) return; const p = toWorld(e); const n = index.get(drag.current.id); if (n) { n.x = p.x + drag.current.dx; n.y = p.y + drag.current.dy; heat.current = 0.6; } }}
          onPointerUp={() => { drag.current = null; }} onPointerLeave={() => { drag.current = null; }}>
          {edges.map((e, i) => {
            const a = index.get(e.a), b = index.get(e.b); if (!a || !b) return null;
            const on = hover && (e.a === hover || e.b === hover);
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? '#F2672A' : e.kind === 'link' ? '#2457E6' : '#D8D5CE'} strokeOpacity={hover && !on ? 0.25 : e.kind === 'link' ? 0.6 : 0.9} strokeWidth={on ? 2 : e.kind === 'link' ? 1.6 : 1} strokeDasharray={e.kind === 'heart' ? '3 5' : undefined} />;
          })}
          {nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x} ${n.y})`} style={{ cursor: n.href ? 'pointer' : 'grab', opacity: lit(n.id) ? 1 : 0.25, transition: 'opacity 200ms' }}
              onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)}
              onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); const p = toWorld(e); drag.current = { id: n.id, dx: n.x - p.x, dy: n.y - p.y }; }}
              onClick={() => n.href && router.push(n.href)}>
              {n.kind === 'paari' && (
                <>
                  <circle r={n.r + 18} fill="#F2672A" opacity="0.08"><animate attributeName="r" values={`${n.r + 10};${n.r + 26};${n.r + 10}`} dur="3s" repeatCount="indefinite" /></circle>
                  <circle r={n.r + 8} fill="#F2672A" opacity="0.14" />
                </>
              )}
              <circle r={n.r} fill={n.kind === 'tag' ? '#EBF0FF' : n.color} stroke={n.kind === 'tag' ? '#2457E6' : '#fff'} strokeWidth={n.kind === 'tag' ? 1.4 : 2} />
              <text y={n.kind === 'paari' ? 5 : n.r + 14} textAnchor="middle" fontSize={n.kind === 'paari' ? 15 : 11.5} fontWeight={n.kind === 'paari' ? 700 : 500} fill={n.kind === 'paari' ? '#fff' : n.kind === 'tag' ? '#2457E6' : '#3B3A37'}
                style={{ fontFamily: 'var(--font-ui)', paintOrder: 'stroke', stroke: n.kind === 'paari' ? 'none' : '#fff', strokeWidth: 3, pointerEvents: 'none' }}>{n.label.length > 18 ? n.label.slice(0, 17) + '…' : n.label}</text>
            </g>
          ))}
        </svg>
        {notes.length === 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Write your first note — it will appear here, connected to Paari.</div>}
      </motion.div>

      <div className="row gap-3" style={{ flexWrap: 'wrap', marginTop: 14 }}>
        {FOLDERS.map((f) => (
          <span key={f.id} className="row gap-2" style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: COLORS[f.id] }} /> {f.ta}
          </span>
        ))}
        <span className="row gap-2" style={{ fontSize: 12.5, color: 'var(--muted)' }}><span style={{ width: 10, height: 10, borderRadius: 5, background: '#EBF0FF', border: '1.4px solid #2457E6' }} /> #குறிச்சொல்</span>
      </div>
    </main>
  );
}
