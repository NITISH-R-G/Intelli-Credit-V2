import fs from 'node:fs';
import path from 'node:path';

function generateDiagrams() {
  console.info('Generating diagrams...');

  const docsPath = path.join('docs', 'architecture');
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
  }

  const mermaidDiagram = `
# System Architecture

\`\`\`mermaid
graph TD
    Client[Browser Client] -->|POST /api/analyze| API[Vercel Serverless Function]
    API -->|Core Logic| Core[analyze-core.ts]
    Core -->|MCP Tools| MCP[mcp-tools.ts]
    Core -->|AI| Gemini[Google Gemini API]
\`\`\`
`;

  fs.writeFileSync(path.join(docsPath, 'SERVICE_MAP.md'), mermaidDiagram);
  console.info('Diagrams generated successfully.');
}

generateDiagrams();
