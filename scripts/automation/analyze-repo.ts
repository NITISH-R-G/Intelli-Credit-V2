import { processCodebaseWithAI } from './utils.js';

const prompt = `You are the core intelligence system for the Intelli-Credit Terminal repository.
Analyze the current codebase structure, logic, and patterns to produce a "Repository Health & Architecture" summary. Identify key modules, entry points, and dependencies.
Provide your response as a Markdown document.`;

processCodebaseWithAI(prompt, 'docs/architecture/repo-analysis.md', true)
    .catch((err) => { console.error(err); process.exit(1); });
