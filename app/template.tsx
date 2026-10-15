'use client';

import { motion } from 'motion/react';
import { dur, ease } from '@/lib/motion';

// Opacity only: a transform or filter here would trap the fixed tab bar inside the page.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur.slow, ease: ease.out }}>
      {children}
    </motion.div>
  );
}
