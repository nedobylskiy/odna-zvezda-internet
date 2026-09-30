import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { microsites } from './microsites.js';
import { forumCategories } from './forum.js';
import { marsTime } from '../assets/mars-clock-v2.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root,'dist');
const { sites, news } = JSON.parse(fs.readFileSync(path.join(root,'src/content.json'),'utf8'));
const { origin, basePath } = JSON.parse(fs.readFileSync(path.join(root,'src/config.json'),'utf8'));
const earthNews=news.find(n=>n.zone==='earth').items;
const pages = ['index.html','search/index.html','directory/index.html','about/index.html','contribute/index.html',...sites.filter(s=>!s.slug.startsWith('wiki-')).map(s=>`${s.domain}/index.html`),...sites.filter(s=>!s.slug.startsWith('wiki-')).flatMap(s=>microsites[s.slug].pages.map(page=>`${s.domain}/${page.slug}/index.html`)),...earthNews.map(story=>`portal.ue/news/${story.slug}/index.html`),...forumCategories.flatMap(category=>category.topics.map(topic=>`warandlove.venus/${category.slug}/${topic.slug}/index.html`))];
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
const robots=fs.readFileSync(path.join(dist,'robots.txt'),'utf8');
const llms=fs.readFileSync(path.join(dist,'llms.txt'),'utf8');
if (!/^User-agent: \*\nAllow: \/$/m.test(robots) || !robots.includes(`Sitemap: ${origin}${basePath}/sitemap.xml`)) throw new Error('Open crawler access or sitemap directive missing');
if (fs.readFileSync(path.join(dist,'llm.txt'),'utf8')!==llms || !llms.startsWith('# Сеть Одной звезды\n')) throw new Error('LLM index and alias differ');
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  if (!llms.includes(`](${match[1]})`)) throw new Error(`LLM index omits ${match[1]}`);
}
const index=JSON.parse(fs.readFileSync(path.join(dist,'assets/search-index.json'),'utf8'));
for (const entry of index) {
  if (!fs.existsSync(path.join(dist,entry.path.slice(1),'index.html'))) throw new Error(`Search result has no page: ${entry.domain}`);
}
if (index.filter(entry=>`${entry.title} ${entry.description}`.toLowerCase().includes('зем')).length<2) throw new Error('Earth query needs both site and wiki results');
const wikiEarth=fs.readFileSync(path.join(dist,'knowledge.wiki/earth/index.html'),'utf8');
if (!wikiEarth.includes('/assets/wiki-article.css') || !wikiEarth.includes('Содержание статьи')) throw new Error('Earth wiki article layout is missing');
for (const section of microsites.knowledge.pages.find(page=>page.slug==='earth').sections) {
  if (!wikiEarth.includes(`<h2 id="${section.slug}">${section.title}</h2>`) || !wikiEarth.includes(`href="#${section.slug}"`)) throw new Error(`Earth wiki section missing: ${section.slug}`);
}
const wikiPluto=fs.readFileSync(path.join(dist,'knowledge.wiki/pluto/index.html'),'utf8');
if (!wikiEarth.includes(`href="${basePath}/knowledge.wiki/pluto/"`) || !wikiPluto.includes('Плутонский спор') || !index.some(entry=>entry.path==='/knowledge.wiki/pluto/')) throw new Error('Pluto wiki article or Earth crosslink is missing');
const wikiTechnologies=fs.readFileSync(path.join(dist,'knowledge.wiki/technologies/index.html'),'utf8');
const wikiEngine=fs.readFileSync(path.join(dist,'knowledge.wiki/neutron-engine/index.html'),'utf8');
const wikiHome=fs.readFileSync(path.join(dist,'knowledge.wiki/index.html'),'utf8');
if (!wikiHome.includes(`href="${basePath}/knowledge.wiki/technologies/"`) || wikiHome.includes(`href="${basePath}/knowledge.wiki/neutron-engine/"`) || !wikiTechnologies.includes(`href="${basePath}/knowledge.wiki/neutron-engine/"`) || !wikiEngine.includes(`href="${basePath}/knowledge.wiki/pluto/"`) || !index.some(entry=>entry.path==='/knowledge.wiki/neutron-engine/')) throw new Error('Technology section, engine article, or crosslinks are missing');
for (const html of [wikiHome,wikiTechnologies,wikiEngine,wikiPluto,wikiEarth]) {
  if (html.match(/<nav aria-label="Разделы сайта">[\s\S]*?<\/nav>/)?.[0].includes(`href="${basePath}/knowledge.wiki/neutron-engine/"`)) throw new Error('Engine must not be listed in top navigation');
}
const olympic=fs.readFileSync(path.join(dist,'olympic.ship/index.html'),'utf8');
for (const phrase of ['Дорога','Прайм','Гиперион','Сатурн','Невесомость','Марс','Сиама','Три президентских пентхауса','Дженна Реджис']) {
  if (!olympic.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`Olympic landing is missing: ${phrase}`);
}
const earth=fs.readFileSync(path.join(dist,'portal.ue/index.html'),'utf8');
if (!earth.includes('population-count') || !earth.includes('/assets/earth.js')) throw new Error('Earth population counter is missing');
for (const route of ['portal.ue','portal.ue/news','portal.ue/services','portal.ue/transit']) {
  const html=fs.readFileSync(path.join(dist,`${route}/index.html`),'utf8');
  if (!html.includes('ЦЕНТРАЛЬНОЗЕМНОЕ ВРЕМЯ · UTC') || !html.includes('id="ue-utc-clock"') || !html.includes('/assets/earth-clock.js') || !html.includes('/assets/planet-clocks.css')) throw new Error(`Earth clock missing on ${route}`);
}
for (const route of ['red.mars','red.mars/bulletin','red.mars/routes']) {
  const html=fs.readFileSync(path.join(dist,`${route}/index.html`),'utf8');
  if (!html.includes('id="mars-clock"') || !html.includes('/assets/mars-clock-v2.js') || !html.includes('/assets/planet-clocks.css') || !html.includes('ВРЕМЯ НУЛЕВОГО МЕРИДИАНА')) throw new Error(`Mars clock missing on ${route}`);
}
if (marsTime(Date.parse('2000-01-06T00:00:00Z'),64.184).clock!=='23:59:39') throw new Error('Mars clock differs from NASA Mars24 benchmark');
for (const story of earthNews) if (!earth.includes(`/portal.ue/news/${story.slug}/`)) throw new Error(`Earth homepage omits news: ${story.slug}`);
for (const category of forumCategories) {
  if (category.topics[0]?.slug!=='rules') throw new Error(`Missing pinned forum rules: ${category.slug}`);
  const html=fs.readFileSync(path.join(dist,`warandlove.venus/${category.slug}/index.html`),'utf8');
  for (const topic of category.topics) if (!html.includes(`/warandlove.venus/${category.slug}/${topic.slug}/`)) throw new Error(`Forum topic missing from ${category.slug}: ${topic.slug}`);
  for (const topic of category.topics.filter(t=>t.archive)) {
    const first=fs.readFileSync(path.join(dist,`warandlove.venus/${category.slug}/${topic.slug}/index.html`),'utf8');
    if ((first.match(/class="bb-post(?: bb-post-deleted)?"/g)||[]).length!==10 || !first.includes('Сообщение удалено модератором') || !first.includes(`Страница 1 из ${topic.archive.pages}`)) throw new Error(`Forum archive opening is incomplete: ${topic.slug}`);
    for (let n=2;n<=topic.archive.pages;n++) {
      const route=`warandlove.venus/${category.slug}/${topic.slug}/page/${n}/`;
      const unavailable=fs.readFileSync(path.join(dist,`${route}index.html`),'utf8');
      if (!unavailable.includes('Ошибка загрузки архива') || !unavailable.includes('content="noindex"') || sitemap.includes(`/${route}`)) throw new Error(`Archive error page invalid: ${route}`);
    }
  }
}
const forumHome=fs.readFileSync(path.join(dist,'warandlove.venus/index.html'),'utf8');
if (!forumHome.includes('Обсуждаем любимый сериал всей солнечной системой')) throw new Error('Forum banner copy is missing');
const introductions=fs.readFileSync(path.join(dist,'warandlove.venus/other/hello/index.html'),'utf8');
if (!introductions.includes('Я с Овертона.') || introductions.includes('Я с Венеры.')) throw new Error('Forum introduction uses the wrong location');
for (const view of ['login','register']) {
  const html=fs.readFileSync(path.join(dist,`warandlove.venus/${view}/index.html`),'utf8');
  if (!html.includes('<fieldset disabled>') || !html.includes('Временные неполадки') || !html.includes('content="noindex"')) throw new Error(`Forum ${view} must be unavailable and excluded from search engines`);
}
for (const s of sites.filter(s=>!s.slug.startsWith('wiki-'))) {
  const old=fs.readFileSync(path.join(dist,`sites/${s.slug}/index.html`),'utf8');
  if (!old.includes(`/${s.domain}/`) || !old.includes('noindex')) throw new Error(`Legacy redirect missing for ${s.slug}`);
}
console.log(`Checked ${pages.length} HTML pages, internal links and sitemap.`);
