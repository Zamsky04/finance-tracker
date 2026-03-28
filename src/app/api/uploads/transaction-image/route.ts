import { put } from '@vercel/blob';
import sharp from 'sharp';

const MAX_INPUT_SIZE = 1 * 1024 * 1024; // 1 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

function sanitizeFileName(name: string) {
  return name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';
}

async function convertImage(inputBuffer: Buffer) {
  const metadata = await sharp(inputBuffer).metadata();

  const width =
    metadata.width && metadata.width > 1600 ? 1600 : metadata.width;

  const base = sharp(inputBuffer)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
      fit: 'inside',
    });

  for (const quality of [50, 42, 36, 30]) {
    const avifBuffer = await base.clone().avif({ quality, effort: 4 }).toBuffer();
    if (avifBuffer.byteLength <= MAX_INPUT_SIZE) {
      return {
        buffer: avifBuffer,
        ext: 'avif',
        contentType: 'image/avif',
      };
    }
  }

  for (const quality of [82, 74, 66, 58, 50, 42]) {
    const webpBuffer = await base.clone().webp({ quality, effort: 4 }).toBuffer();
    if (webpBuffer.byteLength <= MAX_INPUT_SIZE) {
      return {
        buffer: webpBuffer,
        ext: 'webp',
        contentType: 'image/webp',
      };
    }
  }

  const fallbackBuffer = await base.clone().webp({ quality: 40, effort: 4 }).toBuffer();
  return {
    buffer: fallbackBuffer,
    ext: 'webp',
    contentType: 'image/webp',
  };
}

export async function POST(req: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return Response.json(
        { error: 'BLOB_READ_WRITE_TOKEN belum diset di environment variable' },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return Response.json({ error: 'File tidak valid' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'Format gambar harus PNG, JPG, atau JPEG' },
        { status: 400 }
      );
    }

    if (file.size > MAX_INPUT_SIZE) {
      return Response.json(
        { error: 'Ukuran file maksimal 1 MB' },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const converted = await convertImage(inputBuffer);

    const safeName = sanitizeFileName(file.name);
    const pathname = `transactions/${Date.now()}-${safeName}.${converted.ext}`;

    const blob = await put(pathname, converted.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: converted.contentType,
      addRandomSuffix: false,
    });

    return Response.json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error('Upload transaction image error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan saat upload gambar' },
      { status: 500 }
    );
  }
}