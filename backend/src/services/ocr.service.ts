// OCR Service with adapter pattern for multiple providers
// This is a placeholder implementation - actual OCR integration would require
// installing additional packages and API keys

export interface OcrResult {
  amount?: number;
  merchant?: string;
  date?: string;
  rawText: string;
}

export interface OcrProvider {
  name: string;
  extractFromImage(imagePath: string): Promise<OcrResult>;
}

// Tesseract.js implementation (client-side compatible)
export class TesseractProvider implements OcrProvider {
  name = 'tesseract';

  async extractFromImage(imagePath: string): Promise<OcrResult> {
    // In a real implementation, you would:
    // 1. Install tesseract.js: npm install tesseract.js
    // 2. Import and use it:
    // import Tesseract from 'tesseract.js';
    // const result = await Tesseract.recognize(imagePath, 'tha+eng');
    // const text = result.data.text;

    // For now, return a placeholder
    console.log(`[Tesseract] Would process image: ${imagePath}`);

    return {
      rawText: 'Tesseract OCR not configured',
      amount: undefined,
      merchant: undefined,
      date: undefined,
    };
  }
}

// Google Cloud Vision implementation
export class GoogleVisionProvider implements OcrProvider {
  name = 'google';

  async extractFromImage(imagePath: string): Promise<OcrResult> {
    // In a real implementation, you would:
    // 1. Install @google-cloud/vision: npm install @google-cloud/vision
    // 2. Set up authentication with GOOGLE_APPLICATION_CREDENTIALS
    // 3. Use the Vision API:
    // import vision from '@google-cloud/vision';
    // const client = new vision.ImageAnnotatorClient();
    // const [result] = await client.textDetection(imagePath);
    // const text = result.textAnnotations?.[0]?.description || '';

    console.log(`[Google Vision] Would process image: ${imagePath}`);

    return {
      rawText: 'Google Vision OCR not configured',
      amount: undefined,
      merchant: undefined,
      date: undefined,
    };
  }
}

// Extract structured data from OCR text
function parseReceiptText(text: string): Partial<OcrResult> {
  const result: Partial<OcrResult> = {};

  // Try to extract amount (Thai Baht patterns)
  // Patterns: ฿1,234.56, 1,234.56 THB, รวม 1,234.56, Total 1,234.56
  const amountPatterns = [
    /(?:฿|THB|รวม|total|amount|ยอด|net)\s*:?\s*([\d,]+\.?\d*)/gi,
    /([\d,]+\.?\d*)\s*(?:฿|THB|บาท)/gi,
  ];

  for (const pattern of amountPatterns) {
    const match = pattern.exec(text);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        result.amount = amount;
        break;
      }
    }
  }

  // Try to extract date
  // Patterns: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = pattern.exec(text);
    if (match) {
      // Determine format and construct ISO date
      const parts = match.slice(1).map(Number);
      let year: number, month: number, day: number;

      if (parts[0] > 1000) {
        // YYYY-MM-DD format
        [year, month, day] = parts;
      } else if (parts[2] > 1000) {
        // DD/MM/YYYY or MM/DD/YYYY - assume DD/MM/YYYY for Thai receipts
        [day, month, year] = parts;
      } else {
        continue;
      }

      // Convert Buddhist Era to Gregorian if needed
      if (year > 2500) {
        year -= 543;
      }

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        break;
      }
    }
  }

  // Try to extract merchant name (usually first line or after specific keywords)
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length > 0) {
    // First meaningful line is often the merchant name
    const firstLine = lines[0].trim();
    if (firstLine.length > 2 && firstLine.length < 50) {
      result.merchant = firstLine;
    }
  }

  return result;
}

export function createOcrService() {
  const providers: Record<string, OcrProvider> = {
    tesseract: new TesseractProvider(),
    google: new GoogleVisionProvider(),
  };

  return {
    async scanReceipt(
      imagePath: string,
      providerName?: 'tesseract' | 'google'
    ): Promise<OcrResult> {
      const provider = providers[providerName || 'tesseract'];

      if (!provider) {
        throw new Error(`Unknown OCR provider: ${providerName}`);
      }

      const result = await provider.extractFromImage(imagePath);

      // Parse the raw text to extract structured data
      const parsed = parseReceiptText(result.rawText);

      return {
        ...result,
        ...parsed,
      };
    },

    async compareProviders(
      imagePath: string
    ): Promise<{ tesseract: OcrResult; google: OcrResult }> {
      const [tesseractResult, googleResult] = await Promise.all([
        providers.tesseract.extractFromImage(imagePath),
        providers.google.extractFromImage(imagePath),
      ]);

      return {
        tesseract: {
          ...tesseractResult,
          ...parseReceiptText(tesseractResult.rawText),
        },
        google: {
          ...googleResult,
          ...parseReceiptText(googleResult.rawText),
        },
      };
    },
  };
}

export type OcrService = ReturnType<typeof createOcrService>;
