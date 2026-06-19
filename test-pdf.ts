import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
console.info('Type:', typeof pdf);
console.info('Keys:', Object.keys(pdf));
