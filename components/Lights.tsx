/** The signature motif: two soft lights — Appa (blue) and Paari (orange) — drifting around each other. */
export function Lights({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`lights ${className}`} style={style} aria-hidden="true">
      <span className="light appa" />
      <span className="light paari" />
    </div>
  );
}

export function Wordmark({ size = 15 }: { size?: number }) {
  return (
    <span className="row gap-2" style={{ fontSize: size, fontWeight: 600, letterSpacing: '-.01em' }}>
      <span style={{ position: 'relative', width: 22, height: 14, display: 'inline-block' }} aria-hidden="true">
        <span style={{ position: 'absolute', left: 0, top: 0, width: 14, height: 14, borderRadius: 7, background: 'var(--appa)', opacity: 0.9 }} />
        <span style={{ position: 'absolute', left: 8, top: 0, width: 14, height: 14, borderRadius: 7, background: 'var(--paari)', mixBlendMode: 'multiply' }} />
      </span>
      Paari <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: size + 3 }}>&amp;</span> Appa
    </span>
  );
}
