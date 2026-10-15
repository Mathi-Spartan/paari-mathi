'use client';

import { motion } from 'motion/react';
import { ReadingCountdown } from '@/components/Clocks';
import { ease } from '@/lib/motion';

export function LetterCountdown({ target, label, delay = 0 }: { target: string; label: string; delay?: number }) {
  return (
    <motion.div className="stack gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: ease.out, delay }}>
      <span style={{ fontSize: 13, color: '#CFCBC4' }}>திறக்கும் நாள் · Opens {label}</span>
      <ReadingCountdown target={target} birth={null} dark />
    </motion.div>
  );
}
