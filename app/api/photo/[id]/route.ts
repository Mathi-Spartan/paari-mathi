import { q } from '@/lib/db';
import { todayISO } from '@/lib/dates';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Not found', { status: 404 });
  const [row] = await q<{ photo: string | null; locked: boolean }>(
    `SELECT photo, (sealed AND opens_on > $2::date) AS locked FROM memories WHERE id = $1`,
    [id, todayISO()]
  );
  if (!row?.photo || row.locked) return new Response('Not found', { status: 404 });
  const m = row.photo.match(/^data:(image\/[a-z]+);base64,(.*)$/);
  if (!m) return new Response('Not found', { status: 404 });
  return new Response(Buffer.from(m[2], 'base64'), {
    headers: { 'Content-Type': m[1], 'Cache-Control': 'private, max-age=31536000, immutable' },
  });
}
