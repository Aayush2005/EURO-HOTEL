import { proxyToBackend } from '@/lib/backend';

export async function GET() {
  return proxyToBackend('/admin/menu');
}

export async function POST(req: Request) {
  return proxyToBackend('/admin/menu', { method: 'POST', body: await req.json() });
}
