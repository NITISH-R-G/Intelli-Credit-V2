import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function generateDiagrams(): void {
    console.info('Generating architecture diagrams...');

    fs.mkdirSync('docs/architecture', { recursive: true });

    try {
        const output = (execFileSync('npx', ['--yes', 'madge', '--image', 'docs/architecture/dependency-graph.svg', 'src/']) as unknown as Buffer).toString();
        console.info('Madge output:', output);
        console.info('Diagram generated successfully at docs/architecture/dependency-graph.svg');
    } catch (err) {
        console.error('Failed to generate diagrams with madge. Ensure graphviz is installed.', err);
        process.exit(1);
    }
}

generateDiagrams();
