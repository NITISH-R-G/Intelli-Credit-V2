import * as fs from 'fs';

function generateDiagrams() {
  console.info('Generating Architecture Diagrams...');

  const diagramMd = `# Architecture Diagrams

## High Level Request Flow

\`\`\`mermaid
graph TD;
    Client-->Server;
    Server-->GeminiAPI;
    GeminiAPI-->Server;
    Server-->Client;
\`\`\`

## Component Structure

\`\`\`mermaid
graph TD;
    App-->FileUploader;
    App-->Dashboard;
    Dashboard-->AnalysisResults;
    Dashboard-->CreditScore;
\`\`\`
`;

  if (!fs.existsSync('docs')) {
    fs.mkdirSync('docs');
  }

  fs.writeFileSync('docs/architecture-diagrams.md', diagramMd);
  console.info('Diagrams generated at docs/architecture-diagrams.md');
}

generateDiagrams();
