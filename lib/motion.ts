// Motion tokens. Every animation in the app pulls its timing from here,
// so the whole product moves with one consistent personality.
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  in: [0.6, 0, 0.8, 0.2] as const,
};

export const dur = { fast: 0.16, base: 0.32, slow: 0.6, cinematic: 1.1 };

export const spring = {
  soft: { type: 'spring' as const, stiffness: 170, damping: 24 },
  snappy: { type: 'spring' as const, stiffness: 420, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 16 },
  page: { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.9 },
};

export const stagger = (i: number, step = 0.06, base = 0) => base + i * step;

export const rise = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: (i = 0) => ({ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: dur.slow, ease: ease.out, delay: stagger(i) } }),
};
