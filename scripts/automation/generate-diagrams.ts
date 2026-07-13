import * as fs from 'node:fs';
import * as path from 'node:path';

function generateDiagrams(): void {
  console.info('Generating architecture diagrams...');

  const dir = path.join(process.cwd(), 'docs', 'architecture');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const diagramContent = `
# Architecture Diagram

\`\`\`mermaid
graph TD;
    Client-->Serverless_API;
    Serverless_API-->Gemini;
    Serverless_API-->MCP_Tools;
    MCP_Tools-->Bureau_Mock;
\`\`\`

Generated dynamically by continuous docs.
`;

  fs.writeFileSync(path.join(dir, 'diagram.md'), diagramContent, 'utf-8');
  console.info('Architecture diagrams generated.');
}

generateDiagrams();
