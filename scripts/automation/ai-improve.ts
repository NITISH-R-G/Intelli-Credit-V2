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

async function improve(): Promise<void> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found. Skipping AI improvement loop.');
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
            contents: `You are a staff engineer analyzing the Intelli-Credit Terminal repository for continuous improvement.
Review the following code excerpts from the repository and identify technical debt, security risks, performance bottlenecks, architecture concerns, or missing documentation. Propose actionable recommendations.
Provide your response as a Markdown report.

Code Context:
${codebaseContext.substring(0, 500000)} // truncate to avoid token limits if extremely large
`
        });

        if (response.text) {
            fs.writeFileSync('ai-improvement-report.md', response.text);
            console.info('Improvement report generated successfully.');
        }
    } catch (err) {
        console.error('Error generating AI response:', err);
        process.exit(1);
    }
}

improve().catch((err) => { console.error(err); process.exit(1); });
