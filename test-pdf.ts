import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
console.log("Type:", typeof pdf);
console.log("Keys:", Object.keys(pdf));
