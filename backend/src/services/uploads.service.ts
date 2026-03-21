import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { pipeline } from 'stream/promises';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const RECEIPTS_DIR = join(UPLOAD_DIR, 'receipts');

// Ensure upload directories exist
if (!existsSync(RECEIPTS_DIR)) {
  mkdirSync(RECEIPTS_DIR, { recursive: true });
}

export function createUploadsService() {
  return {
    async uploadReceipt(
      file: NodeJS.ReadableStream,
      filename: string,
      mimetype: string
    ): Promise<{ url: string; filepath: string }> {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(mimetype)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      }

      // Generate unique filename
      const ext = extname(filename) || '.jpg';
      const uniqueFilename = `${nanoid()}-${Date.now()}${ext}`;
      const filepath = join(RECEIPTS_DIR, uniqueFilename);

      // Save file
      const writeStream = createWriteStream(filepath);
      await pipeline(file, writeStream);

      // Return relative URL
      const url = `/api/uploads/receipts/${uniqueFilename}`;

      return { url, filepath };
    },

    getReceiptPath(filename: string): string {
      return join(RECEIPTS_DIR, filename);
    },

    getReceiptsDir(): string {
      return RECEIPTS_DIR;
    },
  };
}

export type UploadsService = ReturnType<typeof createUploadsService>;
