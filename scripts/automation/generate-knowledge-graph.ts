import { GoogleGenAI } from '@google/genai';
import { execFileSync } from 'child_process';
import * as fs from 'fs';

async function generateKnowledgeGraph() {
    console.info('Generating Repository Knowledge Graph...');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.info('GEMINI_API_KEY environment variable is missing. Skipping Knowledge Graph Generation (likely running from a fork without secrets).');
        process.exit(0);
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });

        let fileList = '';
        try {
            const files = execFileSync('git', ['ls-files'], { encoding: 'utf-8' });
            fileList = files;
        } catch (error) {
            console.warn('Could not read git tracked files.', error);
        }

        const prompt = `Based on the following repository files, generate a Mermaid.js relationship graph (graph TD or graph LR) connecting key components (Files, Modules, Services). Output only the Mermaid code block.\n\nFiles:\n${fileList}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        console.info('Knowledge Graph Generation Complete.');

        const output = `# Knowledge Graph\n\n\`\`\`mermaid\n${response.text.replace(/\`\`\`mermaid/g, '').replace(/\`\`\`/g, '')}\n\`\`\``;
        fs.mkdirSync('docs/architecture', { recursive: true });
        fs.writeFileSync('docs/architecture/knowledge-graph.md', output);
        console.info('Saved knowledge graph to docs/architecture/knowledge-graph.md');
    } catch (error) {
        console.error('Error generating knowledge graph:', error);
        process.exit(1);
    }
}

generateKnowledgeGraph();
