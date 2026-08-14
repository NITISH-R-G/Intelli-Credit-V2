import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
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

export async function processCodebaseWithAI(prompt: string, outputFile: string, isAnalyzeRepo = false): Promise<void> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found. Skipping AI execution.');
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
            contents: `${prompt}\n\nCode Context:\n${codebaseContext.substring(0, 500000)} // truncate to avoid token limits\n`
        });

        if (response.text) {
            if (isAnalyzeRepo) {
                fs.mkdirSync('docs/architecture', { recursive: true });
            }
            fs.writeFileSync(outputFile, response.text);
            console.info(`AI report generated successfully at ${outputFile}.`);
        }
    } catch (err) {
        console.error('Error generating AI response:', err);
        process.exit(1);
    }
}
