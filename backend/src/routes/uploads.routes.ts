import { FastifyInstance, FastifyRequest } from 'fastify';
import { createReadStream, existsSync } from 'fs';
import { createUploadsService } from '../services/uploads.service';

export async function uploadsRoutes(fastify: FastifyInstance) {
  const uploadsService = createUploadsService();

  // Upload receipt - requires authentication
  fastify.post(
    '/receipt',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply) => {
      try {
        const data = await request.file();

        if (!data) {
          return reply.status(400).send({
            success: false,
            error: 'No file uploaded',
          });
        }

        const result = await uploadsService.uploadReceipt(
          data.file,
          data.filename,
          data.mimetype
        );

        return reply.status(201).send({
          success: true,
          data: { url: result.url },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Serve uploaded receipts - public (URLs can be shared)
  fastify.get<{ Params: { filename: string } }>(
    '/receipts/:filename',
    async (request: FastifyRequest<{ Params: { filename: string } }>, reply) => {
      try {
        const filepath = uploadsService.getReceiptPath(request.params.filename);

        if (!existsSync(filepath)) {
          return reply.status(404).send({
            success: false,
            error: 'File not found',
          });
        }

        // Determine content type from extension
        const ext = request.params.filename.split('.').pop()?.toLowerCase();
        const contentTypes: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
        };

        const contentType = contentTypes[ext || ''] || 'application/octet-stream';

        reply.header('Content-Type', contentType);
        reply.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        return reply.send(createReadStream(filepath));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to serve file';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
