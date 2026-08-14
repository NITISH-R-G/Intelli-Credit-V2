import { processCodebaseWithAI } from './utils.js';

const prompt = `You are a staff engineer analyzing the Intelli-Credit Terminal repository for continuous improvement.
Review the following code excerpts from the repository and identify technical debt, security risks, performance bottlenecks, architecture concerns, or missing documentation. Propose actionable recommendations.
Provide your response as a Markdown report.`;

processCodebaseWithAI(prompt, 'ai-improvement-report.md')
    .catch((err) => { console.error(err); process.exit(1); });
