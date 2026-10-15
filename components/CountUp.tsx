'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView } from 'motion/react';
import { ease } from '@/lib/motion';

export function CountUp({ to, duration = 1.6, className, style }: { to: number; duration?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, { duration, ease: ease.out, onUpdate: (v) => (node.textContent = String(Math.round(v))) });
    return () => controls.stop();
  }, [inView, to, duration]);
  return <span ref={ref} className={className} style={style}>0</span>;
}
