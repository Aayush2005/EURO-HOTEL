import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MenuClient, { MenuItem } from '@/components/MenuClient';

async function fetchMenu(token: string, backendUrl: string): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${backendUrl}/admin/menu`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function MenuPage() {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) redirect('/login');

  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';
  return <MenuClient initialItems={await fetchMenu(token, backendUrl)} />;
}
