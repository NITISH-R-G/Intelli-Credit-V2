import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

// AI Repository Architecture Analysis

const analyze = async (): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing. Skipping AI Repository Analysis.');
      process.exit(0);
    }

    // Ensure output directories exist
    fs.mkdirSync('docs/architecture', { recursive: true });

    // Read relevant TS/TSX files to provide context
    const getCodeContext = (dir: string): string => {
      let context = '';
      const readDirRecursive = (currentDir: string) => {
        if (!fs.existsSync(currentDir)) return;
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
          const filePath = path.join(currentDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            readDirRecursive(filePath);
          } else if (
            file.endsWith('.ts') ||
            file.endsWith('.tsx') ||
            file.endsWith('.json') ||
            file.endsWith('.md')
          ) {
            if (!filePath.includes('node_modules') && !filePath.includes('dist')) {
              const content = fs.readFileSync(filePath, 'utf8');
              // Avoid reading huge files fully for context length
              if (content.length < 50000) {
                context += `\n--- ${filePath} ---\n`;
                context += content;
              }
            }
          }
        }
      };
      readDirRecursive(dir);
      return context;
    };

    const repoContext = getCodeContext('.').substring(0, 100000);

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert software architect.
      Analyze the provided repository files and generate a comprehensive architecture documentation document.
      Include a system overview, key components, data flow, external dependencies (like Gemini), and architectural patterns used.
      Format your response as markdown.

      --- Repository Context (Partial) ---
      ${repoContext}
      ------------------------------
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportContent =
      response.text || '# Architecture Overview\nAnalysis failed or returned empty.';

    fs.writeFileSync('docs/architecture/ARCHITECTURE.md', reportContent);
    console.info('Successfully generated architecture documentation.');
  } catch (error) {
    console.error('Error during AI repository analysis:', error);
    process.exit(1);
  }
};

analyze().catch(err => {
  console.error(err);
  process.exit(1);
});
