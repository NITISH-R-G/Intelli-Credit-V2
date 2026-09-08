import * as fs from 'node:fs';

function main(): void {
  console.info('Analyzing repository architecture...');
  try {
    const srcDirs = fs.readdirSync('src');
    console.info('Source directories:', srcDirs);
    const apiDirs = fs.readdirSync('api');
    console.info('API directories:', apiDirs);
    console.info('Repository architecture analysis complete.');
  } catch (error) {
    console.error('Failed to analyze repository:', error);
  }
}

main();
