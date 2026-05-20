import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';
  const url = new URL('/admin/bookings', backendUrl);
  if (status && status !== 'all') url.searchParams.set('status', status);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return NextResponse.json({ error: body.detail ?? 'Backend error' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
