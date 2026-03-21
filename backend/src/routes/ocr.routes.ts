import { FastifyInstance, FastifyRequest } from 'fastify';
import { createOcrService } from '../services/ocr.service';
import { createUploadsService } from '../services/uploads.service';

export async function ocrRoutes(fastify: FastifyInstance) {
  const ocrService = createOcrService();
  const uploadsService = createUploadsService();

  // Scan receipt with OCR - requires authentication
  fastify.post<{ Querystring: { provider?: 'tesseract' | 'google' } }>(
    '/scan-receipt',
    { preHandler: [fastify.authenticate] },
    async (
      request: FastifyRequest<{ Querystring: { provider?: 'tesseract' | 'google' } }>,
      reply
    ) => {
      try {
        const data = await request.file();

        if (!data) {
          return reply.status(400).send({
            success: false,
            error: 'No file uploaded',
          });
        }

        // First, save the uploaded file
        const uploadResult = await uploadsService.uploadReceipt(
          data.file,
          data.filename,
          data.mimetype
        );

        // Then perform OCR
        const provider = request.query.provider;
        const ocrResult = await ocrService.scanReceipt(uploadResult.filepath, provider);

        return reply.send({
          success: true,
          data: {
            amount: ocrResult.amount,
            merchant: ocrResult.merchant,
            date: ocrResult.date,
            receiptUrl: uploadResult.url,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'OCR scan failed';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Compare both OCR providers - for testing/evaluation
  fastify.post(
    '/compare-ocr',
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

        // Save the uploaded file
        const uploadResult = await uploadsService.uploadReceipt(
          data.file,
          data.filename,
          data.mimetype
        );

        // Run both OCR providers
        const comparison = await ocrService.compareProviders(uploadResult.filepath);

        return reply.send({
          success: true,
          data: {
            tesseract: comparison.tesseract,
            google: comparison.google,
            receiptUrl: uploadResult.url,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'OCR comparison failed';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
