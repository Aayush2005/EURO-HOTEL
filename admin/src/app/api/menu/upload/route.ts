import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/**
 * Uploads a dish image to ImageKit and returns its public URL.
 * The private key is used for HTTP Basic auth (key as username, empty password)
 * and never leaves the server.
 */
export async function POST(req: Request) {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      { error: 'IMAGEKIT_PRIVATE_KEY is not configured' },
      { status: 500 },
    );
  }

  const file = (await req.formData()).get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type ${file.type}. Use JPEG, PNG, WebP or AVIF.` },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 });
  }

  const form = new FormData();
  form.append('file', file);
  form.append('fileName', file.name);
  form.append('folder', process.env.IMAGEKIT_MENU_FOLDER ?? '/menu');
  form.append('useUniqueFileName', 'true');

  const res = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
    },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: (data as { message?: string }).message ?? 'ImageKit upload failed' },
      { status: res.status },
    );
  }

  return NextResponse.json({ url: (data as { url: string }).url });
}
