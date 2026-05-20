import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';
  const res = await fetch(`${backendUrl}/admin/bookings/${id}/reject-cancellation`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
