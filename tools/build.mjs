// Builds dist/illustrated-energy-flow-card.js from the files of src/, in the
// order of their names. Edit src/, then run: node tools/build.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const files = fs.readdirSync(src).filter((f) => f.endsWith(".js")).sort();
const head = "// Built by tools/build.mjs from the files of src/: edit those, not this file.\n";
const body = files.map((f) => `// ---- src/${f}\n${fs.readFileSync(path.join(src, f), "utf8").trimEnd()}\n`).join("\n");
const out = path.join(root, "dist", "illustrated-energy-flow-card.js");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${head}(() => {\n${body}})();\n`);
console.log(`${path.relative(root, out)}: ${files.length} files, ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
