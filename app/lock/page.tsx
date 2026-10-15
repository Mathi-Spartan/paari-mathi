import { hasPin } from '../actions';
import { LockScreen } from './LockScreen';

export const dynamic = 'force-dynamic';

export default async function LockPage() {
  const exists = await hasPin();
  return <LockScreen firstRun={!exists} />;
}
