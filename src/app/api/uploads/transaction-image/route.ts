import {
  ALLOWED_TRANSACTION_IMAGE_TYPES,
  MAX_TRANSACTION_IMAGE_SIZE,
  uploadTransactionImageFromBuffer,
} from '@/lib/storage/transaction-image';

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg'];

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return Response.json({ error: 'File tidak valid' }, { status: 400 });
    }

    const ext = getFileExtension(file.name);

    if (!ALLOWED_TRANSACTION_IMAGE_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'Format gambar harus PNG, JPG, atau JPEG' },
        { status: 400 }
      );
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return Response.json(
        { error: 'Ekstensi file harus .png, .jpg, atau .jpeg' },
        { status: 400 }
      );
    }

    if (file.size > MAX_TRANSACTION_IMAGE_SIZE) {
      return Response.json(
        { error: 'Ukuran file maksimal 1 MB' },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadTransactionImageFromBuffer({
      buffer: inputBuffer,
      fileName: file.name,
      contentType: file.type,
    });

    return Response.json({
      url: uploaded.url,
      pathname: uploaded.pathname,
    });
  } catch (error) {
    console.error('Upload transaction image error:', error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat upload gambar',
      },
      { status: 500 }
    );
  }
}
