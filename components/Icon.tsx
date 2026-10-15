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
  graph: 'M6 7a2 2 0 1 0 0-.01 M18 5a2 2 0 1 0 0-.01 M12 18a2.5 2.5 0 1 0 0-.01 M18 15a1.6 1.6 0 1 0 0-.01 M7.6 8.3l3.4 7.4 M16.2 6l-3.4 9.6 M14.4 17l2.3-1.2 M8 6.6 16 5.3',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M20.5 20.5 16 16',
  menu: 'M4 7h16 M4 12h16 M4 17h10',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7.5V12l3 2',
  folder: 'M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z',
  chev: 'M9 6l6 6-6 6',
  hash: 'M9 4 7 20 M17 4l-2 16 M4.5 9h15 M3.5 15h15',
  bold: 'M7 5h6a3.5 3.5 0 0 1 0 7H7z M7 12h7a3.5 3.5 0 0 1 0 7H7z',
  list: 'M9 6h11 M9 12h11 M9 18h11 M4.5 6h.01 M4.5 12h.01 M4.5 18h.01',
  task: 'M4 5h6v6H4z M5.5 8l1.3 1.3L9 6.8 M13 8h7 M4 14h6v6H4z M13 17h7',
  quote: 'M7 7h4v4c0 3-1.5 5-4 6 M15 7h4v4c0 3-1.5 5-4 6',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  heading: 'M6 4v16 M18 4v16 M6 12h12',
  eye: 'M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  pen: 'M4 20l4-1L19 8l-3-3L5 16z M14 7l3 3',
  sidebar: 'M4 5h16v14H4z M10 5v14',
  together:'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M16.5 12.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z M2.5 20c.5-3.3 2.8-5.5 5.5-5.5s5 2.2 5.5 5.5 M13.5 20c.4-2.4 1.6-4 3-4s2.6 1.6 3 4',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M12 9v4l2.5 2 M9.5 2.5h5',
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M8 5.5v13 M16 5.5v13',
  stop: 'M6.5 6.5h11v11h-11z',
  photo:'M4 8h3l1.8-2.5h6.4L17 8h3v11H4z M12 16.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z',
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
