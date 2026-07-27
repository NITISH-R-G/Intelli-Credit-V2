import fs from 'node:fs';

const targetDir = 'docs/architecture';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const analysis = `
# Repository Analysis

This is an automated analysis of the repository.

- Framework: React, Express, Vite
- Language: TypeScript
- AI: Google Gemini SDK
`;

fs.writeFileSync(`${targetDir}/repo-analysis.md`, analysis);
console.info('Repository analysis generated successfully.');
