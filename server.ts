import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { runAnalysis, AnalysisError } from './api/_lib/analyze-core';
import type { AnalyzeInputFile } from './api/_lib/analyze-core';
import { fileTypeFromBuffer } from 'file-type';
import { isAllowedMimeType } from './api/_lib/limits';

dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file to prevent DoS
});

const app = express();

// Restrict CORS to known dev origins + an optional configured production
// origin. The wildcard `cors()` was previously wide open, which would let any
// website drive the server-held Gemini key cross-origin if this server were
// ever exposed beyond local dev.
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.PRODUCTION_ORIGIN ? [process.env.PRODUCTION_ORIGIN] : []),
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api', limiter);

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Local-dev mirror of the Vercel serverless function `api/analyze.ts`.
 * `npm run dev` (tsx server.ts) serves the SPA and routes /api/analyze
 * here, so prod and dev run the identical `runAnalysis` core. The Gemini
 * key is read from process.env.GEMINI_API_KEY server-side only.
 *
 * Accepts multipart/form-data with one or more `files`, plus `apiMode`
 * ("true"|"false") and `bureauApiKey` (string).
 */
app.post('/api/analyze', upload.array('files', 20), async (req, res) => {
  try {
    const uploaded = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (uploaded.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.', code: 'NO_FILES' });
    }

    const apiMode = (req.body.apiMode as string) === 'true';
    const bureauApiKey = (req.body.bureauApiKey as string) ?? '';

    const files: AnalyzeInputFile[] = [];

    for (const f of uploaded) {
      const clientMimeType = (f.mimetype || 'application/octet-stream').toLowerCase();
      const fileTypeResult = await fileTypeFromBuffer(f.buffer);
      let mimeType = clientMimeType;

      if (fileTypeResult) {
        mimeType = fileTypeResult.mime;
      }

      if (!isAllowedMimeType(mimeType)) {
        return res.status(415).json({
          error: `Unsupported file type "${mimeType}" for "${f.originalname}". Allowed: PDF, PNG/JPG, CSV, JSON, TXT.`,
          code: 'UNSUPPORTED_TYPE',
        });
      }

      files.push({
        name: f.originalname,
        mimeType,
        data: f.buffer.toString('base64'),
      });
    }

    const analysis = await runAnalysis(files, apiMode, bureauApiKey);
    return res.json({ analysis });
  } catch (error) {
    if (error instanceof AnalysisError) {
      const status = error.code === 'NO_FILES' || error.code === 'MISSING_API_KEY' ? 400 : 500;
      return res
        .status(status)
        .json({ error: error.message, code: error.code, rawLogs: error.rawLogs });
    }
    console.error('[/api/analyze] unexpected error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred during analysis.',
      code: 'INTERNAL',
      rawLogs: (error as Error)?.message ?? String(error),
    });
  }
});

async function setupVite() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Export for Vercel
export default app;

if (!process.env.VERCEL) {
  setupVite().then(() => {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  setupVite();
}
