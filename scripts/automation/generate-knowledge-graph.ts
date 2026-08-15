import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

// AI Knowledge Graph Generation

const generateGraph = async (): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. Skipping Knowledge Graph generation.');
      process.exit(0);
    }

    fs.mkdirSync('docs/architecture', { recursive: true });

    const getCodeContext = (dir: string): string => {
      let context = '';
      const readDirRecursive = (currentDir: string) => {
        if (!fs.existsSync(currentDir)) return;
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
          const filePath = path.join(currentDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
              readDirRecursive(filePath);
            }
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            context += `\n--- ${filePath} ---\n`;
            context += fs.readFileSync(filePath, 'utf8');
          }
        }
      };
      readDirRecursive(dir);
      return context;
    };

    const srcContext = getCodeContext('src').substring(0, 40000);
    const apiContext = getCodeContext('api').substring(0, 20000);

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a repository intelligence system.
      Analyze the provided source code context and map out a knowledge graph connecting:
      - Core Modules
      - Key Functions and Classes
      - External APIs (e.g., Gemini)
      - Key UI Components

      Output this knowledge graph as a structured Markdown document using bullet points and relationships (e.g., "A -> uses -> B").

      --- Code Context (Partial) ---
      ${apiContext}
      ${srcContext}
      ------------------------------
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent =
      response.text || '# Repository Knowledge Graph\nCould not generate graph.';

    fs.writeFileSync('docs/architecture/KNOWLEDGE_GRAPH.md', reportContent);
    console.info('Successfully generated knowledge graph documentation.');
  } catch (error) {
    console.error('Error during AI knowledge graph generation:', error);
    process.exit(1);
  }
};

generateGraph().catch(err => {
  console.error(err);
  process.exit(1);
});
