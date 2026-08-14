import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(__dirname, '..', '..', dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

async function analyze(): Promise<void> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found. Skipping repo analysis.');
        process.exit(0);
    }

    const directories = ['src', 'api', 'scripts'];
    let codebaseContext = '';

    for (const dir of directories) {
        if (fs.existsSync(dir)) {
             const files = getAllFiles(dir);
             for (const file of files) {
                 try {
                     const content = fs.readFileSync(file, 'utf8');
                     codebaseContext += `\n--- File: ${file} ---\n${content}\n`;
                 } catch (e) {
                     console.warn(`Could not read file ${file}`, e);
                 }
             }
        }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `You are the core intelligence system for the Intelli-Credit Terminal repository.
Analyze the current codebase structure, logic, and patterns to produce a "Repository Health & Architecture" summary. Identify key modules, entry points, and dependencies.
Provide your response as a Markdown document.

Code Context:
${codebaseContext.substring(0, 500000)} // truncate to avoid token limits
`
        });

        if (response.text) {
            fs.mkdirSync('docs/architecture', { recursive: true });
            fs.writeFileSync('docs/architecture/repo-analysis.md', response.text);
            console.info('Repo analysis generated successfully.');
        }
    } catch (err) {
        console.error('Error generating AI response:', err);
        process.exit(1);
    }
}

void analyze();
