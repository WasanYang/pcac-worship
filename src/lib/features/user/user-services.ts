'use server';

import { adminStorage } from '@/lib/firebase-admin';
import { getDownloadURL } from 'firebase-admin/storage';
import { z } from 'zod';

const UploadFileInputSchema = z.object({
  fileDataUri: z.string(),
  path: z.string(),
});

export async function uploadFile(
  input: z.infer<typeof UploadFileInputSchema>
): Promise<{ url: string; path: string }> {
  if (!adminStorage) {
    throw new Error('Firebase Admin Storage is not initialized.');
  }

  const { fileDataUri, path } = UploadFileInputSchema.parse(input);

  const bucket = adminStorage.bucket();

  const [metadata, base64Data] = fileDataUri.split(';base64,');
  const mimeType = metadata.split(':')[1];
  const fileBuffer = Buffer.from(base64Data, 'base64');

  const file = bucket.file(path);

  await file.save(fileBuffer, {
    metadata: { contentType: mimeType },
  });

  const url = await getDownloadURL(file);

  return { url, path };
}

const DeleteFileInputSchema = z.object({
  path: z.string(),
});

export async function deleteFile(
  input: z.infer<typeof DeleteFileInputSchema>
): Promise<{ success: boolean }> {
  if (!adminStorage) {
    throw new Error('Firebase Admin Storage is not initialized.');
  }
  const { path } = DeleteFileInputSchema.parse(input);
  const bucket = adminStorage.bucket();
  try {
    await bucket.file(path).delete();
    return { success: true };
  } catch (error: any) {
    if (error.code === 404) {
      console.warn(
        `File not found during deletion: ${path}. Assuming it's already deleted.`
      );
      return { success: true }; // Treat as success if file is already gone
    }
    console.error(`Failed to delete file at path "${path}":`, error);
    throw error;
  }
}
