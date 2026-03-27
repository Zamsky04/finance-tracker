import { put } from '@vercel/blob';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return Response.json({ error: 'File tidak valid' }, { status: 400 });
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return Response.json({ error: 'Format gambar harus jpg/png/webp' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'Ukuran maksimal 5MB' }, { status: 400 });
  }

  const blob = await put(`transactions/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });

  return Response.json({
    url: blob.url,
    pathname: blob.pathname,
  });
}