const PATHS = {
  home: 'M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z',
  book: 'M12 6.5C10 5 7 4.5 4 4.5v14c3 0 6 .5 8 2 2-1.5 5-2 8-2v-14c-3 0-6 .5-8 2Zm0 0v14',
  plus: 'M12 5v14M5 12h14',
  letter: 'M3.5 6.5h17v11h-17z M3.5 7.5l8.5 6 8.5-6',
  you: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4.5 20c.8-3.6 3.9-5.5 7.5-5.5s6.7 1.9 7.5 5.5',
  moment: 'M12 3.5l1.9 5.4 5.6 1.6-5.6 1.7L12 17.5l-1.9-5.3-5.6-1.7 5.6-1.6z M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z',
  noticed: 'M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  milestone: 'M5.5 21V4 M5.5 4.5h11l-2 4 2 4h-11',
  proud: 'M12 14.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M8.6 13.5 7 21l5-2.6 5 2.6-1.6-7.5',
  photo: 'M4 8h3l1.8-2.5h6.4L17 8h3v11H4z M12 16.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z',
  close: 'M6 6l12 12M18 6 6 18',
  back: 'M15 5.5 8.5 12l6.5 6.5',
  next: 'M9 5.5 15.5 12 9 18.5',
  lock: 'M6 11h12v9.5H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  trash: 'M5 7h14 M10 7V5h4v2 M7 7l1 13h8l1-13',
  check: 'M5 12.5 10 17.5 19 7',
  calendar: 'M4.5 6h15v14h-15z M4.5 10h15 M8.5 3.5v4 M15.5 3.5v4',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 2.5v2 M12 19.5v2 M2.5 12h2 M19.5 12h2',
  delete: 'M21 5H9l-6 7 6 7h12z M17.5 9.5l-5 5 M12.5 9.5l5 5',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, stroke = 1.8, color = 'currentColor', className }: { name: IconName; size?: number; stroke?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}
