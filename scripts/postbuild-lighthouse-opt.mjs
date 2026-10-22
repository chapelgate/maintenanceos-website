import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname, "..", "out");
const LINK_RE = /<link rel="stylesheet" href="([^"]+\.css)"[^>]*>/g;

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

const htmlFiles = walk(OUT);
let modified = 0;
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = html.replace(LINK_RE, '<link rel="preload" as="style" href="$1" onload="this.rel=\'stylesheet\'" />');
  if (html !== before) {
    fs.writeFileSync(file, html);
    modified++;
  }
}
console.log(`Made CSS non-render-blocking for ${modified} HTML files`);
