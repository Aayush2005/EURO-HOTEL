import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Proxy a request to the FastAPI backend using the admin's Supabase JWT
 * (stored httpOnly in the `admin_token` cookie). Returns the backend's
 * response verbatim, or 401 if the admin isn't signed in.
 */
export async function proxyToBackend(
  path: string,
  init: { method?: string; body?: unknown } = {},
) {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';

  const res = await fetch(new URL(path, backendUrl).toString(), {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: (data as { detail?: string }).detail ?? 'Backend error' },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}
