import { proxyToBackend } from '@/lib/backend';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/admin/menu/${id}`, { method: 'PATCH', body: await req.json() });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/admin/menu/${id}`, { method: 'DELETE' });
}
