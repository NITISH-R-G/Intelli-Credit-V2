import fs from 'fs';
import path from 'path';

// Helper to escape node names in Mermaid
const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '_');

const buildMermaidFromStructure = (structure: any, parentNode: string, depth = 0, lines: string[] = []) => {
  if (depth > 2) return; // Limit depth to avoid massive unreadable graphs

  for (const [key, value] of Object.entries(structure)) {
    const nodeName = sanitize(`${parentNode}_${key}`);
    const displayName = key;

    lines.push(`  ${parentNode} --> ${nodeName}["${displayName}"]`);

    if (typeof value === 'object' && value !== null) {
      buildMermaidFromStructure(value, nodeName, depth + 1, lines);
    }
  }
};

const generateArchitectureGraph = () => {
  const metadataPath = path.resolve(process.cwd(), 'metadata.json');
  if (!fs.existsSync(metadataPath)) return '';

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const lines: string[] = [];
  lines.push("```mermaid");
  lines.push("graph TD;");

  lines.push(`  Root["${metadata.name || 'Repository Root'}"]`);

  if (metadata.structure) {
    buildMermaidFromStructure(metadata.structure, 'Root', 0, lines);
  }

  // Add dependency cluster
  if (metadata.dependencies) {
    lines.push(`  subgraph Dependencies`);
    const deps = Object.keys(metadata.dependencies);
    deps.slice(0, 10).forEach(dep => {
      lines.push(`    Root --> Dep_${sanitize(dep)}["${dep}"]`);
    });
    if (deps.length > 10) {
      lines.push(`    Root --> Dep_More["...and ${deps.length - 10} more"]`);
    }
    lines.push(`  end`);
  }

  lines.push("```");
  return lines.join('\n');
};

const main = () => {
  console.log("Generating dynamic architecture diagrams...");

  const outDir = path.resolve(process.cwd(), 'docs/architecture');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const mermaidGraph = generateArchitectureGraph();
  if (mermaidGraph) {
    fs.writeFileSync(path.join(outDir, 'dependency-graph.md'), `# Architecture & Dependencies\n\nThis diagram is auto-generated based on the repository structure and dependencies.\n\n${mermaidGraph}`);
    console.log("Interactive Diagrams generated successfully.");
  } else {
    console.warn("Could not generate diagram. metadata.json might be missing.");
  }
};

main();
