'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Icon, type IconName } from './Icon';
import { spring } from '@/lib/motion';

const LEFT: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'இன்று', icon: 'home' },
  { href: '/book', label: 'புத்தகம்', icon: 'book' },
];
const RIGHT: { href: string; label: string; icon: IconName }[] = [
  { href: '/letters', label: 'கடிதங்கள்', icon: 'letter' },
  { href: '/you', label: 'அப்பா', icon: 'you' },
];

export function Nav() {
  const path = usePathname();
  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  const item = (it: (typeof LEFT)[number]) => {
    const on = isActive(it.href);
    return (
      <Link key={it.href} href={it.href} className={`nav-item ${on ? 'active' : ''}`} aria-current={on ? 'page' : undefined}>
        {on && <motion.span layoutId="nav-pill" className="nav-pill" transition={spring.snappy} />}
        <motion.span animate={{ y: on ? -1 : 0, scale: on ? 1.06 : 1 }} transition={spring.bouncy} style={{ display: 'flex' }}>
          <Icon name={it.icon} size={22} stroke={on ? 2.1 : 1.8} />
        </motion.span>
        {it.label}
      </Link>
    );
  };
  return (
    <motion.nav className="nav" aria-label="Main" initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring.soft, delay: 0.25 }}>
      {LEFT.map(item)}
      <Link href="/new" className="nav-plus" aria-label="Write today's page">
        <motion.span whileTap={{ rotate: 90, scale: 0.85 }} transition={spring.bouncy} style={{ display: 'flex' }}>
          <Icon name="plus" size={26} stroke={2.4} />
        </motion.span>
      </Link>
      {RIGHT.map(item)}
    </motion.nav>
  );
}
