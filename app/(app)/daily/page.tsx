import { redirect } from 'next/navigation';
import { todayISO } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default function DailyIndex() {
  redirect(`/daily/${todayISO()}`);
}
