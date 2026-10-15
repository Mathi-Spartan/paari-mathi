'use client';

import { motion } from 'motion/react';
import { dur, ease } from '@/lib/motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: dur.slow, ease: ease.out }}>
      {children}
    </motion.div>
  );
}
