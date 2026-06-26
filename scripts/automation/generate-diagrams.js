import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

function runGenerateDiagrams() {
  console.info('Starting architecture diagram generation...');
  const diagramPath = join(process.cwd(), 'docs', 'architecture', 'architecture.md');

  try {
    mkdirSync(dirname(diagramPath), { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error('Failed to create architecture docs directory:', error.message);
      process.exit(1);
    }
  }

  const content = "# System Architecture\n\n```mermaid\ngraph TD\n    A[Client] -->|HTTP POST| B(Serverless API)\n    B --> C{Core Logic}\n    C -->|Mocks/Tools| D[External APIs]\n    C -->|Prompts| E[Gemini AI]\n```\n";

  try {
    writeFileSync(diagramPath, content, 'utf8');
    console.info("Architecture diagram saved to " + diagramPath);
  } catch (error) {
    console.error('Failed to write architecture diagram:', error.message);
  }
}

runGenerateDiagrams();
