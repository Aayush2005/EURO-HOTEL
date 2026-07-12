import { proxyToBackend } from '@/lib/backend';

export async function POST(req: Request) {
  return proxyToBackend('/admin/menu/reorder', { method: 'POST', body: await req.json() });
}
