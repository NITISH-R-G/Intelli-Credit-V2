import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function findImports(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const imports: string[] = [];

    // Naive regex to match import statements
    const importRegex = /import\s+(?:[^'"]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  } catch {
    return [];
  }
}

function scanFiles(dir: string, fileData: Record<string, string[]> = {}): Record<string, string[]> {
  const files = readdirSync(dir);
  for (const file of files) {
    if (
      file === 'node_modules' ||
      file === '.git' ||
      file === 'dist' ||
      file === 'docs' ||
      file.startsWith('.')
    )
      continue;

    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      scanFiles(filePath, fileData);
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx')
    ) {
      fileData[filePath] = findImports(filePath);
    }
  }
  return fileData;
}

async function main() {
  const fileDependencies = scanFiles('.');
  const apiKey = process.env.GEMINI_API_KEY;

  const rawData = JSON.stringify(fileDependencies, null, 2);

  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, saving raw dependency graph.');
    writeFileSync(
      'docs/knowledge-graph.md',
      `# Knowledge Graph\n\n\`\`\`json\n${rawData}\n\`\`\`\n`,
    );
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
You are an AI generating a repository knowledge graph for Intelli-Credit Terminal.
I am providing you with a JSON object where keys are file paths and values are lists of imports found in those files.
Generate a cohesive Markdown document that describes the relationships and dependencies between major components, modules, and directories.
Focus on the most significant relationships.

Dependencies Data:
\`\`\`json
${rawData}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const graphDescription = response.text || 'No knowledge graph generated.';
    const finalContent = `# Repository Knowledge Graph\n\n${graphDescription}`;

    writeFileSync('docs/knowledge-graph.md', finalContent);
    console.info('Knowledge graph generated and saved to docs/knowledge-graph.md');
  } catch (error) {
    console.error('Error during knowledge graph generation:', error);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
