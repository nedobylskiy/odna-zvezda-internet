import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { microsites } from './microsites.js';
import { renderMicrosite } from './render-microsite.js';
import { renderOlympic } from './render-olympic.js';
import { renderEarth } from './render-earth.js';
import { forumCategories } from './forum.js';
import { renderForum } from './render-forum.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { sites, news } = JSON.parse(fs.readFileSync(path.join(root, 'src/content.json'), 'utf8'));
const { origin, basePath } = JSON.parse(fs.readFileSync(path.join(root, 'src/config.json'), 'utf8'));
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prefix = basePath.replace(/\/$/, '');
const url = p => `${prefix}${p}`;
const absolute = p => `${origin}${url(p)}`;
const bySlug = Object.fromEntries(sites.map(s => [s.slug, s]));
const routeFor = s => `/${s.domain}/`;
const link = s => url(routeFor(s));
const zoneName = { earth:'Земля', mars:'Марс', prime:'Прайм', venus:'Венера', space:'Открытый космос', moon:'Луна', phobos:'Фобос' };
const glyph = {earth:'◉',mars:'●',prime:'✝',space:'✦'};
const write = (name, html) => { const target=path.join(out,name); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,html); };

function shell({ title, description, route, body, current='', script='' }) {
  const fullTitle = `${title} — Сеть Одной звезды`;
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(fullTitle)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${absolute(route)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${absolute(route)}"><meta name="theme-color" content="#081b2a"><link rel="icon" href="${url('/assets/favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${url('/assets/style.css')}"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:fullTitle,description,url:absolute(route),inLanguage:'ru'})}</script></head><body data-zone="${current}"><div class="shell"><header class="topbar"><a class="wordmark" href="${url('/')}"><span class="mark">✳</span> ОДНА ЗВЕЗДА <span class="muted">/ СЕТЬ</span></a><nav class="toplinks" aria-label="Разделы"><a href="${url('/directory/')}">Каталог</a><a href="${link(bySlug.knowledge)}">Энциклопедия ↗</a></nav></header>${body}<footer><span>ОДНА ЗВЕЗДА · сеть вымышленной Солнечной системы</span><a href="${url('/about/')}">О проекте</a><a href="${url('/contribute/')}">Предложить сайт</a><a href="${url('/directory/')}">Все узлы</a></footer></div>${script ? `<script type="module" src="${url('/assets/app.js')}"></script>` : ''}</body></html>`;
}
function result(s) { return `<article class="result"><a class="domain" href="${link(s)}">${esc(s.domain)} <span>↗</span></a><h3><a href="${link(s)}">${esc(s.title)}</a></h3><p>${esc(s.description)}</p><span class="result-zone">${esc(zoneName[s.zone])}</span></article>`; }
const switches = `<div class="view-switch" role="group" aria-label="Точка обзора">${['earth','mars','prime','space'].map(z=>`<button type="button" data-view="${z}" aria-pressed="false" title="${zoneName[z]}"><span aria-hidden="true">${glyph[z]}</span><span>${zoneName[z]}</span></button>`).join('')}</div>`;
const homeBody = `<main><div class="home-head"><div class="eyebrow">МЕЖПЛАНЕТНАЯ ПОИСКОВАЯ СИСТЕМА <span class="live-dot"></span> СЕТЬ НА СВЯЗИ</div><div class="view-control"><span class="view-label">ОТКУДА ВЫ?</span>${switches}</div></div><section class="hero"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="hero-inner"><div class="hero-symbol">✳</div><p class="kicker">ВЕСЬ МИР ПОД ОДНОЙ ЗВЕЗДОЙ</p><h1>Найди свой путь<br><em>в Солнечной системе.</em></h1><p class="hero-copy">Публичный индекс планет, станций, кораблей и всего, что между ними.</p><form class="search-form" action="${url('/search/')}" method="get"><label class="sr-only" for="query">Поиск по Сети</label><span class="search-icon" aria-hidden="true">⌕</span><input id="query" name="q" type="search" placeholder="Спросите Сеть или введите адрес…" autocomplete="off" required><button type="submit">НАЙТИ <span>↗</span></button></form><div class="search-hint">ПОПРОБУЙТЕ: <a href="${url('/search/?q=Прайм')}">Прайм</a><a href="${url('/search/?q=Гиперион')}">Гиперион</a><a href="${url('/search/?q=knowledge.wiki')}">knowledge.wiki</a></div></div></section><div class="under-hero"><section class="news-panel"><div class="section-heading"><div><span class="eyebrow">СИГНАЛЫ ИЗ СЕТИ</span><h2 id="news-heading">Межпланетная лента</h2></div><span class="section-index">01 / 02</span></div><div id="news-items">${news.find(n=>n.zone==='space').items.map((n,i)=>`<a class="news-item" href="${link(bySlug[n.site])}"><span class="news-number">0${i+1}</span><span>${esc(n.title)}</span><span class="arrow">↗</span></a>`).join('')}</div></section><aside class="explore-panel"><div class="section-heading"><div><span class="eyebrow">НАЧНИТЕ ОТСЮДА</span><h2>Узлы сети</h2></div><span class="section-index">02 / 02</span></div><a class="feature-link" href="${link(bySlug.knowledge)}"><span class="feature-glyph">◈</span><span><strong>Энциклопедия Солнечной системы</strong><small>knowledge.wiki · путеводитель по миру</small></span><span>↗</span></a><a class="feature-link" href="${url('/directory/')}"><span class="feature-glyph">⌘</span><span><strong>Каталог доменов</strong><small>Планеты, корабли и свободные зоны</small></span><span>↗</span></a><div class="tiny-note">Одна звезда. Множество голосов.<br>Выберите точку обзора, чтобы увидеть свою ленту.</div></aside></div></main>`;
write('index.html', shell({title:'Поиск по Солнечной системе',description:'Вымышленная межпланетная Сеть вселенной «Одна звезда»: поиск, новости Земли, Марса и Прайма, каталог сайтов и энциклопедия.',route:'/',body:homeBody,script:true}));

const searchBody = `<main class="inner-page"><div class="eyebrow">ПОИСК / ПУБЛИЧНЫЙ ИНДЕКС</div><h1>Результаты поиска</h1><form class="search-form inner-search" action="${url('/search/')}" method="get"><label class="sr-only" for="query">Поиск по Сети</label><span class="search-icon" aria-hidden="true">⌕</span><input id="query" name="q" type="search" placeholder="Название, адрес или место" required><button type="submit">НАЙТИ ↗</button></form><div class="filter-row"><span>ПРИОРИТЕТ ПОКАЗА:</span>${switches}</div><p id="search-status" class="search-status">Все узлы публичного индекса</p><div class="result-list" id="results">${sites.map(result).join('')}</div><noscript><p>Для поиска по словам включите JavaScript. Все страницы доступны по ссылкам выше и в <a href="${url('/directory/')}">каталоге</a>.</p></noscript></main>`;
write('search/index.html',shell({title:'Поиск',description:'Поиск по публичному индексу сайтов вымышленной Сети Одной звезды.',route:'/search/',body:searchBody,script:true}));

const directoryGroups = [ ['earth','Земля','.ue · .earth · .blue'],['mars','Марс','.x · .mars · .red · .dome · .oai'],['prime','Прайм','.prime · .church · .light · .farm'],['phobos','Фобос','.phobos'],['moon','Луна','.moon'],['space','Свободная Сеть','.xxx · .rum · .hyp · .pirate · .space · .comp · .ship · .base · .news'],['media','Фильмы, сериалы и музыка','Фанатские сообщества · .venus'] ];
const directoryBody = `<main class="inner-page"><div class="eyebrow">КАРТА СЕТИ / ПУБЛИЧНЫЕ АДРЕСА</div><h1>Каталог доменов</h1><p class="lead">Вымышленные домены работают как адреса внутри истории. Здесь у каждого узла есть постоянная страница, доступная в обычном интернете.</p><div class="directory-grid">${directoryGroups.map(([group,name,tlds])=>`<section class="zone-card"><div class="zone-card-top"><span>${esc(name)}</span><span>↗</span></div><div class="tlds">${esc(tlds)}</div><div class="zone-links">${sites.filter(s=>group==='media'?s.slug==='forum':s.zone===group).map(s=>`<a href="${link(s)}">${esc(s.domain)} <span>↗</span></a>`).join('') || '<span class="muted">Ожидает первых сайтов</span>'}</div></section>`).join('')}</div><p class="directory-note">Каталог объединяет сайты по месту и теме. Вымышленный домен сохраняется в адресе каждого сайта. Поиск видит всю открытую Сеть и меняет порядок результатов в зависимости от выбранной точки обзора.</p></main>`;
write('directory/index.html',shell({title:'Каталог доменов',description:'Зоны и сайты вымышленной Сети Одной звезды: Земля, Марс, Прайм, Луна, Фобос и независимые узлы.',route:'/directory/',body:directoryBody}));

for (const s of sites.filter(s=>!s.slug.startsWith('wiki-'))) {
  const model=microsites[s.slug];
  if (!model) throw new Error(`Missing microsite model: ${s.slug}`);
  const helpers={url,absolute,link,bySlug,esc};
  if (s.slug==='forum') {
    write(`${s.domain}/index.html`,renderForum(s,null,null,'home',helpers));
    for (const category of forumCategories) {
      write(`${s.domain}/${category.slug}/index.html`,renderForum(s,category,null,'category',helpers));
      for (const topic of category.topics) {
        write(`${s.domain}/${category.slug}/${topic.slug}/index.html`,renderForum(s,category,topic,'thread',helpers));
        if (topic.archive) for (let page=2;page<=topic.archive.pages;page++) write(`${s.domain}/${category.slug}/${topic.slug}/page/${page}/index.html`,renderForum(s,category,topic,'unavailable',helpers,page));
      }
    }
    for (const view of ['login','register']) write(`${s.domain}/${view}/index.html`,renderForum(s,null,null,view,helpers));
    continue;
  }
  const render=s.slug==='olympic'?renderOlympic:s.slug==='ue'?(site,model,page,helpers)=>renderEarth(site,model,page,helpers,news.find(n=>n.zone==='earth').items):renderMicrosite;
  write(`${s.domain}/index.html`,render(s,model,null,helpers));
  for (const page of model.pages) write(`${s.domain}/${page.slug}/index.html`,render(s,model,page,helpers));
}
const earthNews=news.find(n=>n.zone==='earth').items;
for (const story of earthNews) write(`portal.ue/news/${story.slug}/index.html`,renderEarth(bySlug.ue,microsites.ue,null,{url,absolute,esc},earthNews,story));
// Preserve previously shared /sites/... URLs while canonical pages move into domain folders.
const redirect = (oldPath,newPath) => write(`${oldPath}/index.html`,
  `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${url(newPath)}"><link rel="canonical" href="${absolute(newPath)}"><title>Адрес изменён</title></head><body><p>Страница переехала: <a href="${url(newPath)}">${esc(newPath)}</a></p></body></html>`);
for (const s of sites.filter(s=>!s.slug.startsWith('wiki-'))) {
  redirect(`sites/${s.slug}`,routeFor(s));
  for (const page of microsites[s.slug].pages) redirect(`sites/${s.slug}/${page.slug}`,`/${s.domain}/${page.slug}/`);
}
for (const s of sites.filter(s=>s.slug.startsWith('wiki-'))) redirect(`sites/knowledge/${s.slug.slice(5)}`,routeFor(s));
const aboutBody = `<main class="inner-page"><div class="eyebrow">О ПРОЕКТЕ</div><h1>Интернет одной звезды</h1><p class="lead">Этот сайт представляет интернет Солнечной системы будущего из книжной вселенной «Одна звезда», написанной Андреем Недобыльским.</p><div class="article-content"><p>Страницы, новости и поисковая система здесь показаны глазами жителей разных уголков Солнечной системы. Адреса вроде knowledge.wiki и thechurch.prime существуют внутри вымышленной Сети. В браузере они открываются по настоящим адресам этого сайта. Вы можете читать страницы напрямую, переходить по ссылкам и находить их через обычные поисковики.</p><p>Материалы портала — художественный вымысел. Стартовые записи служат каркасом для будущих историй и могут уточняться по мере развития вселенной.</p><p><a href="https://www.litres.ru/series/odna-zvezda-924843/" target="_blank" rel="noopener noreferrer">Книжная серия «Одна звезда» на ЛитРес ↗</a></p><p><a href="${url('/directory/')}">Открыть каталог сети ↗</a></p></div></main>`;
write('about/index.html',shell({title:'О проекте',description:'Интернет Солнечной системы будущего из книжной вселенной «Одна звезда» Андрея Недобыльского.',route:'/about/',body:aboutBody}));

const contributeBody = `<main class="inner-page"><div class="eyebrow">УЧАСТВОВАТЬ В ПРОЕКТЕ</div><h1>Предложить свой сайт</h1><p class="lead">В Сети Одной звезды может появиться и ваш сайт: страница компании, форум, личный блог или другой уголок будущей Солнечной системы.</p><div class="article-content"><p>Проект открыт для предложений через <a href="https://github.com/nedobylskiy/odna-zvezda-internet" target="_blank" rel="noopener noreferrer">репозиторий на GitHub ↗</a>. Добавьте сайт в исходные файлы проекта так, чтобы сборка создала для него отдельную папку с вымышленным доменным именем, главную и нужные подстраницы. Затем отправьте pull request.</p><p>В описании pull request расскажите, где существует сайт внутри мира, кому он принадлежит и как связан с книгами. Если он соответствует канону «Одной звезды» или не затрагивает уже установленные события и факты, мы добавим его в каталог.</p><p>Исходные страницы и правила сборки находятся в репозитории. После добавления сайт получит собственный адрес внутри этого проекта и сможет появляться в поиске Сети.</p><p><a href="https://github.com/nedobylskiy/odna-zvezda-internet" target="_blank" rel="noopener noreferrer">Открыть репозиторий и предложить сайт ↗</a></p></div></main>`;
write('contribute/index.html',shell({title:'Предложить сайт',description:'Как предложить свой сайт для интернета книжной вселенной «Одна звезда» через pull request.',route:'/contribute/',body:contributeBody}));

const searchEntries=[...sites.map(({slug,domain,zone,title,description,tag})=>({slug,path:routeFor({domain}),domain,zone,title,description,tag}))];
for (const s of sites.filter(s=>!s.slug.startsWith('wiki-'))) {
  for (const page of microsites[s.slug].pages) {
    if (s.slug==='knowledge' && ['earth','mars','prime'].includes(page.slug)) continue;
    searchEntries.push({slug:`${s.slug}/${page.slug}`,path:`/${s.domain}/${page.slug}/`,domain:`${s.domain}/${page.slug}`,zone:s.zone,title:`${page.title} — ${s.title}`,description:page.subtitle,tag:`${s.domain} · раздел`});
  }
}
for (const story of earthNews) searchEntries.push({slug:`ue/news/${story.slug}`,path:`/portal.ue/news/${story.slug}/`,domain:`portal.ue/news/${story.slug}`,zone:'earth',title:story.title,description:story.summary,tag:'Земля · новости'});
for (const category of forumCategories) for (const topic of category.topics) searchEntries.push({slug:`forum/${category.slug}/${topic.slug}`,path:`/warandlove.venus/${category.slug}/${topic.slug}/`,domain:`warandlove.venus/${category.slug}/${topic.slug}`,zone:'venus',title:`${topic.title} — Форум «Война и Любовь на Венере»`,description:topic.posts[0].text,tag:`Венера · ${category.title}`});
write('assets/search-index.json',JSON.stringify(searchEntries));
const allRoutes=['/','/search/','/directory/','/about/','/contribute/',...sites.filter(s=>!s.slug.startsWith('wiki-')).map(routeFor),...sites.filter(s=>!s.slug.startsWith('wiki-')).flatMap(s=>microsites[s.slug].pages.map(page=>`/${s.domain}/${page.slug}/`)),...earthNews.map(story=>`/portal.ue/news/${story.slug}/`),...forumCategories.flatMap(category=>category.topics.map(topic=>`/warandlove.venus/${category.slug}/${topic.slug}/`))];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allRoutes.map(p=>`<url><loc>${absolute(p)}</loc></url>`).join('')}</urlset>`);
write('robots.txt',`# Open access for all search and AI crawlers.\nUser-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
const mdLabel = value => String(value).replaceAll('[','\\[').replaceAll(']','\\]');
const llmLink = (title, route, note='') => `- [${mdLabel(title)}](${absolute(route)})${note?`: ${note}`:''}`;
const wiki=microsites.knowledge.pages;
const llms=[
  '# Сеть Одной звезды',
  '',
  '> Статический интернет вымышленной Солнечной системы из книжной вселенной «Одна звезда» Андрея Недобыльского. Адреса внутри сайта вроде knowledge.wiki и portal.ue — художественные домены, расположенные по путям этого сайта.',
  '',
  'Все перечисленные ниже страницы открыты для обхода. Основной текст находится в статическом HTML и доступен без JavaScript. Карта сайта перечисляет все индексируемые страницы; старые перенаправления и временно недоступные страницы форума в неё не входят.',
  '',
  '## Начало и карта сайта',
  llmLink('Поиск по Сети','/','Главная с точкой обзора Земли, Марса, Прайма или открытого космоса.'),
  llmLink('Каталог доменов','/directory/','Сайты и зоны вымышленного интернета.'),
  llmLink('Поиск по индексу','/search/','Клиентский поиск; отдельные результаты доступны по постоянным адресам ниже.'),
  llmLink('О проекте','/about/','Контекст книжной вселенной и ссылка на серию книг.'),
  llmLink('Предложить сайт','/contribute/','Как добавить новый сайт через pull request.'),
  llmLink('Полная XML карта сайта','/sitemap.xml','Все канонические индексируемые адреса.'),
  '',
  '## Энциклопедия Солнечной системы',
  llmLink('knowledge.wiki','/knowledge.wiki/','Главная энциклопедии.'),
  ...wiki.map(page=>llmLink(page.title,`/knowledge.wiki/${page.slug}/`,page.subtitle)),
  '',
  '## Сайты Сети',
  ...sites.filter(site=>!site.slug.startsWith('wiki-') && site.slug!=='knowledge' && site.slug!=='forum').flatMap(site=>[
    llmLink(site.title,`/${site.domain}/`,`${site.domain} — ${site.description}`),
    ...microsites[site.slug].pages.map(page=>llmLink(`${site.domain} — ${page.title}`,`/${site.domain}/${page.slug}/`,page.subtitle))
  ]),
  '',
  '## Новости Земли',
  llmLink('Новости Земли','/portal.ue/news/','Открытый раздел официального портала.'),
  ...earthNews.map(story=>llmLink(story.title,`/portal.ue/news/${story.slug}/`,story.summary)),
  '',
  '## Форум «Война и Любовь на Венере»',
  llmLink('Форум','/warandlove.venus/','Архив обсуждений для чтения.'),
  ...forumCategories.flatMap(category=>[
    llmLink(category.title,`/warandlove.venus/${category.slug}/`,category.description),
    ...category.topics.map(topic=>llmLink(topic.title,`/warandlove.venus/${category.slug}/${topic.slug}/`))
  ]),
  ''
].join('\n');
write('llms.txt',llms);
write('llm.txt',llms);
write('.nojekyll','');
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
for (const asset of ['style.css','app.js','favicon.svg','microsites.css','wiki-article.css','olympic.css','earth.css','earth.js','earth-clock.js','mars-clock-v2.js','planet-clocks.css','forum.css']) fs.copyFileSync(path.join(root,'assets',asset),path.join(out,'assets',asset));
console.log(`Built ${allRoutes.length} pages in dist/`);
