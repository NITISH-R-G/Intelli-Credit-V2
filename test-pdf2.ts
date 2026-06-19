import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
console.info(typeof pdf.PDFParse);
console.info(Object.keys(pdf.PDFParse));
