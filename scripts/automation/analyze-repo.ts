import * as fs from 'node:fs';
import * as path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  process.stderr.write('GEMINI_API_KEY is not set.\n');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'coverage', '.github'].includes(file)) {
        getFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function analyze(): Promise<void> {
  const files = getFiles(process.cwd());
  const selectedFiles = files.filter((f) => f.includes('src/') || f.includes('api/')).slice(0, 15);
  let promptContext =
    'Analyze the following files and create a JSON knowledge graph of the repository architecture. Use {"nodes": [...], "edges": [...]} format. Be extremely succinct, only output the JSON.\n\n';

  for (const file of selectedFiles) {
    promptContext += `File: ${file}\n${fs.readFileSync(file, 'utf-8')}\n\n`;
  }

  const response = await ai.models
    .generateContent({
      model: 'gemini-2.5-flash',
      contents: promptContext,
    })
    .catch((err) => {
      process.stderr.write(`Failed to analyze: ${err}\n`);
      process.exit(1);
    });

  if (response && response.text) {
    const text = response.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    try {
      JSON.parse(text); // validate
      fs.mkdirSync('docs/architecture', { recursive: true });
      fs.writeFileSync('docs/architecture/knowledge-graph.json', text);
      process.stdout.write('Generated knowledge graph.\n');
    } catch {
      process.stderr.write('Failed to parse JSON response.\n');
      process.exit(1);
    }
  }
}

await analyze().catch((err) => {
  process.stderr.write(`Error: ${err}\n`);
  process.exit(1);
});
