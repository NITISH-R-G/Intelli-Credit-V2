import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

function main() {
  const content = `# Architecture Diagrams

## High Level Request Flow
\`\`\`mermaid
sequenceDiagram
    participant User as Browser
    participant API as /api/analyze
    participant Core as analyze-core
    participant Tools as MCP Tools
    participant LLM as Google Gemini

    User->>API: POST (files + settings)
    API->>Core: Process request
    Core->>LLM: Analyze documents
    LLM-->>Tools: Call tools (eCourts, MCA)
    Tools-->>LLM: Tool results
    LLM-->>Core: Final Analysis
    Core-->>API: JSON Response
    API-->>User: JSON
\`\`\`

*Diagrams generated automatically.*
`;

  if (!existsSync('docs/architecture')) {
    mkdirSync('docs/architecture', { recursive: true });
  }

  writeFileSync('docs/architecture/diagrams.md', content);
  console.info('Diagrams generated at docs/architecture/diagrams.md');
}

main();
