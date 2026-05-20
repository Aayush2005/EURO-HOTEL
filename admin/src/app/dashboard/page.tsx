import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/DashboardClient';

async function fetchBookings(token: string, backendUrl: string): Promise<object[]> {
  try {
    const res = await fetch(`${backendUrl}/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) return [];
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/login');

  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';
  const initialBookings = await fetchBookings(token, backendUrl);

  return <DashboardClient initialBookings={initialBookings as never[]} />;
}
