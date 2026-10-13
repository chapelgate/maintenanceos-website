import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');

export function getWordCount(html) {
  const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const content = match ? match[1] : html;
  const text = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/—/g, ' ')
    .replace(/–/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

const pages = [
  'index.html',
  'how-it-works/index.html',
  'how-we-keep-control/index.html',
  'features/index.html',
  'security/index.html',
  'industries/index.html',
  'industries/councils/index.html',
  'industries/facilities-management/index.html',
  'industries/holiday-lets/index.html',
  'industries/housing-associations/index.html',
  'industries/landlords/index.html',
  'industries/letting-agents/index.html',
  'industries/maintenance-companies/index.html',
  'industries/property-managers/index.html',
  'faq/index.html',
  'pricing/index.html',
  'demo/index.html',
  'about/index.html',
  'contact/index.html',
  'ai-receptionist/index.html',
  'property-maintenance-software/index.html',
  'privacy/index.html',
  'cookies/index.html',
  'terms/index.html',
  'accessibility/index.html',
];

if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  let total = 0;
  console.log('| Page | Word Count |');
  console.log('|---|---|');
  for (const p of pages) {
    const full = path.join(OUT, p);
    if (fs.existsSync(full)) {
      const html = fs.readFileSync(full, 'utf8');
      const count = getWordCount(html);
      total += count;
      const name = '/' + p.replace('/index.html', '').replace('index.html', '');
      console.log(`| ${name || '/'} | ${count} |`);
    }
  }
  console.log(`| **TOTAL** | **${total}** |`);
}
