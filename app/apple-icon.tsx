import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#FBFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 38, top: 50, width: 80, height: 80, borderRadius: 40, background: '#2350E6' }} />
        <div style={{ position: 'absolute', left: 62, top: 50, width: 80, height: 80, borderRadius: 40, background: '#FF6A2B', opacity: 0.88 }} />
      </div>
    ),
    size
  );
}
