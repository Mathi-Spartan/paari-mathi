# Paari & Appa

A private web app where Appa (Mathi) quietly writes a page for his son Paari every day — moments, things he noticed, first times, proud moments and sealed letters — collected into a book Paari can open when he grows up.

- Next.js 15 (App Router) on Vercel
- Neon Postgres (`memories`, `settings` tables)
- Motion for animation

## Environment
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `SESSION_SECRET` | Long random string used to sign the login cookie |

The first visit asks Appa to create a 6‑digit PIN; it is stored hashed (PBKDF2) in the `settings` table.

See `DESIGN.md` for the design system.
