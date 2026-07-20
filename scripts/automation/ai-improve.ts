import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.info('GEMINI_API_KEY is not set. Skipping AI improvement loop.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

async function runImprovementLoop() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are an expert AI maintainer for the Intelli-Credit-V2 repository.
Identify potential areas for improvement in the repository. Provide recommendations for:
- Refactoring
- Documentation updates
- Fixing technical debt
- Enhancing security
Note: This is an automated daily script. Do not output anything unless there are critical insights.
`,
    });

    const recommendations = response.text;
    if (recommendations) {
      console.info('Improvement recommendations:', recommendations);
      import('fs').then(fs => fs.writeFileSync('ai-improvement-report.md', recommendations, 'utf-8'));
    } else {
      console.info('No improvements suggested.');
    }
  } catch (error) {
    console.error('Error during AI improvement loop:', error);
    process.exit(0); // Graceful exit
  }
}

runImprovementLoop();
