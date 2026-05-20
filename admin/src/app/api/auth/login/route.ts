import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Authenticate with Supabase
    const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!authRes.ok) {
      const body = await authRes.json().catch(() => ({}));
      const msg = body?.error_description || body?.msg || 'Invalid email or password';
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    const { access_token, expires_in } = await authRes.json();

    // Verify the user has admin/manager/receptionist role via the backend
    const verifyRes = await fetch(`${backendUrl}/admin/bookings?status=confirmed`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (verifyRes.status === 403 || verifyRes.status === 401) {
      return NextResponse.json({ error: 'Access denied — admin role required' }, { status: 403 });
    }

    const cookieStore = await cookies();
    cookieStore.set('admin_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in ?? 3600,
      path: '/',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
