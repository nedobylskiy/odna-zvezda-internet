import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { microsites } from './microsites.js';
import { forumCategories } from './forum.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root,'dist');
const { sites, news } = JSON.parse(fs.readFileSync(path.join(root,'src/content.json'),'utf8'));
const { origin, basePath } = JSON.parse(fs.readFileSync(path.join(root,'src/config.json'),'utf8'));
const earthNews=news.find(n=>n.zone==='earth').items;
const pages = ['index.html','search/index.html','directory/index.html','about/index.html',...sites.filter(s=>!s.slug.startsWith('wiki-')).map(s=>`${s.domain}/index.html`),...sites.filter(s=>!s.slug.startsWith('wiki-')).flatMap(s=>microsites[s.slug].pages.map(page=>`${s.domain}/${page.slug}/index.html`)),...earthNews.map(story=>`portal.ue/news/${story.slug}/index.html`),...forumCategories.flatMap(category=>category.topics.map(topic=>`warandlove.venus/${category.slug}/${topic.slug}/index.html`))];
for (const page of pages) {
  const html=fs.readFileSync(path.join(dist,page),'utf8');
  if (!/<h1(?:\s|>)/.test(html) || !html.includes('rel="canonical"') || !html.includes('name="description"')) throw new Error(`Missing semantic metadata: ${page}`);
  for (const match of html.matchAll(/href="(\/[^"?#]*)"/g)) {
    if (basePath && !match[1].startsWith(`${basePath}/`)) throw new Error(`Link outside basePath in ${page}: ${match[1]}`);
    const relative=decodeURI(match[1].slice(basePath.length)).replace(/^\//,'');
    if (!fs.existsSync(path.join(dist,relative)) && !fs.existsSync(path.join(dist,relative,'index.html'))) throw new Error(`Broken link ${match[1]} in ${page}`);
  }
}
const sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
if ((sitemap.match(/<url>/g)||[]).length !== pages.length) throw new Error('Sitemap does not list all pages');
if (!sitemap.includes(`${origin}${basePath}/`)) throw new Error('Sitemap uses the wrong origin');
const index=JSON.parse(fs.readFileSync(path.join(dist,'assets/search-index.json'),'utf8'));
for (const entry of index) {
  if (!fs.existsSync(path.join(dist,entry.path.slice(1),'index.html'))) throw new Error(`Search result has no page: ${entry.domain}`);
}
if (index.filter(entry=>`${entry.title} ${entry.description}`.toLowerCase().includes('зем')).length<2) throw new Error('Earth query needs both site and wiki results');
const olympic=fs.readFileSync(path.join(dist,'olympic.ship/index.html'),'utf8');
for (const phrase of ['Дорога','Прайм','Гиперион','Сатурн','Невесомость','Марс','Сиама','Три президентских пентхауса','Дженна Реджис']) {
  if (!olympic.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`Olympic landing is missing: ${phrase}`);
}
const earth=fs.readFileSync(path.join(dist,'portal.ue/index.html'),'utf8');
if (!earth.includes('population-count') || !earth.includes('/assets/earth.js')) throw new Error('Earth population counter is missing');
for (const story of earthNews) if (!earth.includes(`/portal.ue/news/${story.slug}/`)) throw new Error(`Earth homepage omits news: ${story.slug}`);
for (const category of forumCategories) {
  if (category.topics[0]?.slug!=='rules') throw new Error(`Missing pinned forum rules: ${category.slug}`);
  const html=fs.readFileSync(path.join(dist,`warandlove.venus/${category.slug}/index.html`),'utf8');
  for (const topic of category.topics) if (!html.includes(`/warandlove.venus/${category.slug}/${topic.slug}/`)) throw new Error(`Forum topic missing from ${category.slug}: ${topic.slug}`);
}
for (const view of ['login','register']) {
  const html=fs.readFileSync(path.join(dist,`warandlove.venus/${view}/index.html`),'utf8');
  if (!html.includes('<fieldset disabled>') || !html.includes('Временные неполадки') || !html.includes('content="noindex"')) throw new Error(`Forum ${view} must be unavailable and excluded from search engines`);
}
for (const s of sites.filter(s=>!s.slug.startsWith('wiki-'))) {
  const old=fs.readFileSync(path.join(dist,`sites/${s.slug}/index.html`),'utf8');
  if (!old.includes(`/${s.domain}/`) || !old.includes('noindex')) throw new Error(`Legacy redirect missing for ${s.slug}`);
}
console.log(`Checked ${pages.length} HTML pages, internal links and sitemap.`);
