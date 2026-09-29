import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { microsites } from './microsites.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root,'dist');
const { sites } = JSON.parse(fs.readFileSync(path.join(root,'src/content.json'),'utf8'));
const pages = ['index.html','search/index.html','directory/index.html','about/index.html',...sites.filter(s=>!s.slug.startsWith('wiki-')).map(s=>`sites/${s.slug}/index.html`),...Object.entries(microsites).flatMap(([slug,model])=>model.pages.map(page=>`sites/${slug}/${page.slug}/index.html`))];
for (const page of pages) {
  const html=fs.readFileSync(path.join(dist,page),'utf8');
  if (!html.includes('<h1>') || !html.includes('rel="canonical"') || !html.includes('name="description"')) throw new Error(`Missing semantic metadata: ${page}`);
  for (const match of html.matchAll(/href="(\/odna-zvezda-internet\/[^"?#]*)"/g)) {
    const relative=decodeURI(match[1]).replace(/^\/odna-zvezda-internet\//,'');
    if (!fs.existsSync(path.join(dist,relative)) && !fs.existsSync(path.join(dist,relative,'index.html'))) throw new Error(`Broken link ${match[1]} in ${page}`);
  }
}
const sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
if ((sitemap.match(/<url>/g)||[]).length !== pages.length) throw new Error('Sitemap does not list all pages');
const index=JSON.parse(fs.readFileSync(path.join(dist,'assets/search-index.json'),'utf8'));
for (const entry of index) {
  if (!fs.existsSync(path.join(dist,entry.path.slice(1),'index.html'))) throw new Error(`Search result has no page: ${entry.domain}`);
}
if (index.filter(entry=>`${entry.title} ${entry.description}`.toLowerCase().includes('зем')).length<2) throw new Error('Earth query needs both site and wiki results');
console.log(`Checked ${pages.length} HTML pages, internal links and sitemap.`);
