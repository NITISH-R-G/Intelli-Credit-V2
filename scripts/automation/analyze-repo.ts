import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY is missing. Skipping repository analysis.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function analyzeRepo() {
  try {
    const targetDirs = ['src', 'api'];
    let allCode = '';

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        const files = getAllFiles(dir);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          allCode += `\n--- File: ${file} ---\n${content.substring(0, 500)}\n`;
        }
      }
    }

    const packageJson = fs.existsSync('package.json')
      ? fs.readFileSync('package.json', 'utf-8')
      : '';

    const prompt = `
You are an expert Software Architect analyzing a TypeScript React repository.
Please provide a comprehensive Architecture Document in Markdown format based on the following file snippets and package.json.

Include:
1. Executive Summary
2. System Architecture Overview (describe frontend, backend/API, integration points)
3. Key Technologies & Dependencies
4. Data Flow (how data moves through the app)
5. Component Structure (high-level view of the React components)

Make the documentation clear, well-structured, and highly professional.

Package.json:
${packageJson}

Code Snippets:
${allCode.substring(0, 50000)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportText =
      response.text || '# Architecture Overview\nDocumentation generation failed or was empty.';

    const docsDir = 'docs/architecture';
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(docsDir, 'architecture-overview.md'), reportText, 'utf-8');
    console.info(
      'Successfully generated architecture documentation to docs/architecture/architecture-overview.md',
    );
  } catch (error) {
    console.error('Error during repository analysis:', error);
    process.exit(0);
  }
}

void analyzeRepo();
