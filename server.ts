import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import multer from "multer";
import * as pdf from "pdf-parse";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.use(express.json());

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    if (fileType === "application/pdf") {
      const pdfParser = (pdf as any).default || pdf;
      const data = await pdfParser(fileBuffer);
      return res.json({ text: data.text });
    } else if (fileType.startsWith("image/")) {
      const base64Data = fileBuffer.toString("base64");
      return res.json({ base64: base64Data, mimeType: fileType });
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    res.status(500).json({ error: "Failed to process file" });
  }
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Export for Vercel
export default app;

if (!process.env.VERCEL) {
  setupVite().then(() => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  setupVite();
}


