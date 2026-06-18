import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const main = async () => {
  console.info('Running Continuous Improvement System...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Skipping real improvement suggestion generation.');
    fs.writeFileSync(
      path.resolve(process.cwd(), 'ai-improvement-suggestion.md'),
      'GEMINI_API_KEY is not set. Skipping real improvement suggestion generation.',
    );
    return;
  }

  const metadataPath = path.resolve(process.cwd(), 'metadata.json');
  let metadata: Record<string, unknown> = {};
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert AI software architect and continuous improvement engine.
Based on the following repository metadata, generate one concrete, actionable improvement suggestion for the codebase, architecture, or documentation.
Focus on identifying potential technical debt, documentation gaps, security risks, performance issues, or structural improvements.

Repository Metadata:
${JSON.stringify(metadata, null, 2).substring(0, 5000)} // Truncated to avoid token limits if too large

Provide the output in the following format:
## Issue Title: [Proposed Issue Title]

### Background
[Explain why this improvement is needed based on the metadata]

### Suggestion
[Detail the concrete improvement]

### Action Items
- [ ] Task 1
- [ ] Task 2
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const outputText = response.text || 'No content generated.';

    fs.writeFileSync(path.resolve(process.cwd(), 'ai-improvement-suggestion.md'), outputText);
    console.info('Continuous Improvement suggestion generated successfully.');
  } catch (error) {
    console.error('Error generating improvement suggestion:', error);
    process.exit(1);
  }
};

main();
