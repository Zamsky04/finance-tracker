// src/lib/storage/transaction-image.ts
import { put } from '@vercel/blob';
import sharp from 'sharp';

export const MAX_TRANSACTION_IMAGE_SIZE = 1 * 1024 * 1024;
export const ALLOWED_TRANSACTION_IMAGE_TYPES = ['image/png', 'image/jpeg'];

export type UploadedTransactionImage = {
  url: string;
  pathname: string;
  contentType: string;
};

function sanitizeFileName(name: string) {
  return (
    name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image'
  );
}

async function convertImage(inputBuffer: Buffer) {
  const metadata = await sharp(inputBuffer).metadata();
  const width = metadata.width && metadata.width > 1600 ? 1600 : metadata.width;

  const base = sharp(inputBuffer)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
      fit: 'inside',
    });

  for (const quality of [50, 42, 36, 30]) {
    const avifBuffer = await base.clone().avif({ quality, effort: 4 }).toBuffer();
    if (avifBuffer.byteLength <= MAX_TRANSACTION_IMAGE_SIZE) {
      return {
        buffer: avifBuffer,
        ext: 'avif',
        contentType: 'image/avif',
      };
    }
  }

  for (const quality of [82, 74, 66, 58, 50, 42]) {
    const webpBuffer = await base.clone().webp({ quality, effort: 4 }).toBuffer();
    if (webpBuffer.byteLength <= MAX_TRANSACTION_IMAGE_SIZE) {
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

export async function uploadTransactionImageFromBuffer({
  buffer,
  fileName,
  prefix = 'transactions',
}: {
  buffer: Buffer;
  fileName: string;
  contentType?: string;
  prefix?: string;
}): Promise<UploadedTransactionImage> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN belum diset di environment variable');
  }

  const converted = await convertImage(buffer);
  const safeName = sanitizeFileName(fileName);
  const pathname = `${prefix}/${Date.now()}-${safeName}.${converted.ext}`;

  const blob = await put(pathname, converted.buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: converted.contentType,
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: converted.contentType,
  };
}
