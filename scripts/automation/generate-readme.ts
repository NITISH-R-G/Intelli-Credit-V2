/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

const parseEnvVars = () => {
  const envPath = path.resolve(process.cwd(), '.env.example');
  if (!fs.existsSync(envPath)) return [];

  const content = fs.readFileSync(envPath, 'utf8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [key, ...rest] = line.split('=');
      return { key, value: rest.join('=') };
    });
};

const getArchitectureDiagram = () => {
  const diagramsPath = path.resolve(process.cwd(), 'docs/architecture/dependency-graph.md');
  if (fs.existsSync(diagramsPath)) {
    return fs.readFileSync(diagramsPath, 'utf8');
  }
  return '';
};

const getBadges = () => {
  return `
![CI/CD](https://github.com/your-org/your-repo/actions/workflows/ci-cd-automation.yml/badge.svg)
![Repo Analysis](https://github.com/your-org/your-repo/actions/workflows/autonomous-repo-analysis.yml/badge.svg)
`;
};

const main = () => {
  console.log('Generating Comprehensive README.md...');

  const metadataPath = path.resolve(process.cwd(), 'metadata.json');
  let metadata: any = {};
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }

  const existingReadmePath = path.resolve(process.cwd(), 'README.md');
  const existingReadme = fs.existsSync(existingReadmePath)
    ? fs.readFileSync(existingReadmePath, 'utf8')
    : '';

  const envVars = parseEnvVars();
  const envVarTable =
    envVars.length > 0
      ? `| Variable | Example Value |\n|---|---|\n${envVars.map((v) => `| \`${v.key}\` | \`${v.value}\` |`).join('\n')}`
      : '*No `.env.example` file found.*';

  const autoGenStart = '<!-- AUTO-GENERATED-SECTION-START -->';
  const autoGenEnd = '<!-- AUTO-GENERATED-SECTION-END -->';

  const frameworksList =
    metadata.frameworks && metadata.frameworks.length > 0
      ? metadata.frameworks.join(', ')
      : 'None detected';

  const scriptTable = metadata.scripts
    ? `| Script | Command |\n|---|---|\n${Object.entries(metadata.scripts)
        .map(([name, cmd]) => `| \`npm run ${name}\` | \`${cmd}\` |`)
        .join('\n')}`
    : '';

  const dependenciesList = metadata.dependencies
    ? Object.keys(metadata.dependencies)
        .map((d) => `- \`${d}\``)
        .join('\n')
    : '*No dependencies found*';

  const diagrams = getArchitectureDiagram();

  const generatedContent = `${autoGenStart}
## 🤖 Auto-Generated Repository Analytics

${getBadges()}

### Project Overview
- **Name:** ${metadata.name || 'Unknown Project'}
- **Version:** ${metadata.version || '0.0.0'}
- **Detected Frameworks:** ${frameworksList}

### Technology Stack & Dependencies
${dependenciesList}

### Available Scripts
${scriptTable}

### Environment Variables
${envVarTable}

### Architecture & System Design
${diagrams}

### Setup & Deployment Instructions
1. **Install Dependencies:**
   \`\`\`bash
   npm ci
   \`\`\`
2. **Set Environment Variables:**
   Copy \`.env.example\` to \`.env\` and configure appropriately.
3. **Run Application:**
   \`\`\`bash
   npm run dev
   \`\`\`
4. **Deployment:**
   Configure your deployment target (e.g., Vercel, Node server) to run the \`build\` script and serve the output directory.

### AI Automated Maintenance
This repository is self-maintaining:
- **CI/CD Automation:** Runs tests, linting, and security audits automatically.
- **Repository Analysis:** Weekly scheduled tasks map the codebase structure.
- **AI Documentation Agent:** An AI automatically reviews PRs and updates documentation based on detected architectural changes.

${autoGenEnd}`;

  let newReadme = existingReadme;
  if (newReadme.includes(autoGenStart)) {
    const regex = new RegExp(`${autoGenStart}[\\s\\S]*?${autoGenEnd}`, 'g');
    newReadme = newReadme.replace(regex, generatedContent);
  } else {
    newReadme += `\n\n${generatedContent}`;
  }

  fs.writeFileSync(existingReadmePath, newReadme);
  console.log('Comprehensive README.md updated successfully.');
};

main();
