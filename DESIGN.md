# Paari & Appa — design notes

A private book a father writes for his son, one day at a time. Years later, Paari opens it.

## Idea
Two lights run through the whole product: **Appa (blue `--appa`)** and **Paari (sunrise orange `--paari`)**.
They drift around each other on the lock screen, the hero, the book cover and Appa's page. Everything else stays quiet
— warm paper, rich ink, generous space — so photos and words carry the emotion.

## Colour meanings
| Token | Meaning |
|---|---|
| `--appa` | Appa, primary links, focus rings |
| `--paari` | Paari, the save action, sealed-letter glow |
| `--k-moment` / `--k-noticed` / `--k-milestone` / `--k-proud` / `--k-letter` | The kind of memory — used only for kind chips and the kind picker |
| `--ink` | Primary buttons, sealed letters |

Kind colours are never used decoratively.

## Type roles
- **Instrument Serif** (`--font-display`) — big emotional English lines and numerals.
- **Noto Serif Tamil** (`--font-serif`) — Tamil headings and everything Appa writes (the book voice).
- **Geist + Noto Sans Tamil** (`--font-sans`) — interface.

## Motion scale
All timing comes from `lib/motion.ts` (JS) and `--dur-*` / `--ease-*` (CSS). No raw bezier or millisecond values in components.
- `spring.snappy` — nav pill, toggles · `spring.soft` — cards, sheets · `spring.bouncy` — confirmations · `spring.page` — book page turns
- Signature moments: PIN unlock (lights bloom), saving (the page folds into a light that drops into the book), the book's 3D page turn, the sealed-letter countdown.
- `prefers-reduced-motion` is honoured globally.

## Checks
`npm run build` runs `tsc --noEmit` first, which fails on any component used but not imported.
