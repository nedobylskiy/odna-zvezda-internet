const base = new URL(import.meta.url).pathname.replace(/assets\/app\.js$/, '');
const zoneNames = { earth:'Земля', mars:'Марс', prime:'Прайм', phobos:'Фобос', moon:'Луна', space:'Открытый космос' };
const views = ['earth','mars','prime','space'];
const news = {
  earth:[['Лунный архив открыл новый раздел о первых экспедициях','moon'],['Объединённая Земля обновляет публичный каталог маршрутов','ue'],['Почему адреса .blue всё ещё встречаются в старой Сети','knowledge']],
  mars:[['Купола O-AI обновили местный каталог адресов','oai'],['Ретранслятор Фобоса опубликовал навигационную памятку','phobos'],['Марсианская лента: что искать за пределами .mars','mars']],
  prime:[['Путь паломника: место посадки Apollo 11','shrine'],['Открытое сообщение Церкви Прайма','prime'],['Лунный архив и память о первом шаге','moon']],
  space:[['Энциклопедия Солнечной системы открывает каталог','knowledge'],['Рынок Гипериона появился в общем индексе','hyperion'],['Бортовой журнал Olympic доступен в Сети','olympic']]
};
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let view = localStorage.getItem('one-star-view');
if (!views.includes(view)) view = 'space';
function setView(next) {
  view = next; localStorage.setItem('one-star-view',next); document.body.dataset.zone = next;
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.view===next)));
  const heading = document.querySelector('#news-heading'), items = document.querySelector('#news-items');
  if (heading && items) {
    heading.textContent = ({earth:'Земная лента',mars:'Марсианская лента',prime:'Лента Прайма',space:'Межпланетная лента'})[next];
    items.innerHTML = news[next].map(([title,slug],i)=>`<a class="news-item" href="${base}sites/${slug}/"><span class="news-number">0${i+1}</span><span>${escape(title)}</span><span class="arrow">↗</span></a>`).join('');
  }
  renderSearch();
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));

let index = [];
const normalize = value => String(value).toLocaleLowerCase('ru').replace(/ё/g,'е').trim();
const siteURL = site => typeof site==='string' ? `${base}sites/${encodeURIComponent(site)}/` : `${base}${site.path.replace(/^\//,'')}`;
function matches(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return index.map(site => {
    const fields = [site.domain,site.title,site.description,zoneNames[site.zone]].map(normalize);
    if (terms.length && !terms.every(term=>fields.some(field=>field.includes(term)))) return {site,score:0};
    const score = terms.length ? terms.reduce((sum,term)=>sum+
      (fields[1].startsWith(term)?30:0)+(fields[0].startsWith(term)?24:0)+
      (fields[1].includes(term)?12:0)+(fields[0].includes(term)?10:0)+
      (fields[2].includes(term)?3:0)+(fields[3].includes(term)?2:0),0) : 1;
    return {site,score:score+(site.zone===view?8:0)};
  }).filter(item=>item.score).sort((a,b)=>b.score-a.score || a.site.title.localeCompare(b.site.title,'ru')).map(item=>item.site);
}
function renderSearch() {
  const list = document.querySelector('#results'); if (!list || !index.length) return;
  const q = (new URLSearchParams(location.search).get('q') || '').trim();
  const input = document.querySelector('#query'); if (input && document.activeElement!==input) input.value = q;
  const scored = matches(q);
  const status = document.querySelector('#search-status');
  if (status) status.textContent=q ? `По запросу «${q}» найдено: ${scored.length} · приоритет: ${zoneNames[view]}` : `Все узлы публичного индекса · приоритет: ${zoneNames[view]}`;
  list.innerHTML=scored.length ? scored.map(site=>`<article class="result"><a class="domain" href="${siteURL(site)}">${escape(site.domain)} <span>↗</span></a><h3><a href="${siteURL(site)}">${escape(site.title)}</a></h3><p>${escape(site.description)}</p><span class="result-zone">${escape(zoneNames[site.zone])}</span></article>`).join('') : '<div class="empty">В открытом индексе ничего не найдено. Попробуйте название планеты, корабля или домен.</div>';
}
function setupSuggestions(form) {
  const input=form.querySelector('input[name=q]');
  const wrap=document.createElement('div'); wrap.className='search-wrap';
  form.parentNode.insertBefore(wrap,form); wrap.appendChild(form);
  const panel=document.createElement('div'); panel.className='suggestions'; panel.id='search-suggestions';
  panel.setAttribute('role','listbox'); panel.hidden=true; wrap.appendChild(panel);
  input.setAttribute('aria-controls',panel.id);
  input.setAttribute('aria-autocomplete','list');
  input.setAttribute('aria-expanded','false');
  let found=[], selected=-1;
  const hide=()=>{panel.hidden=true;selected=-1;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');};
  function update() {
    const query=input.value.trim(); found=query?matches(query).slice(0,6):[]; selected=-1;
    if (!found.length) {hide();return;}
    panel.innerHTML=`<div class="suggestions-label">НАЙДЕНО В СЕТИ</div>${found.map((site,i)=>`<a id="suggestion-${i}" role="option" aria-selected="false" href="${siteURL(site)}"><span class="suggestion-icon">${site.tag.includes('wiki')?'◈':'↗'}</span><span class="suggestion-text"><strong>${escape(site.title)}</strong><small>${escape(site.domain)}</small></span><span class="suggestion-zone">${escape(zoneNames[site.zone])}</span></a>`).join('')}<a class="suggestions-all" href="${base}search/?q=${encodeURIComponent(query)}">Все результаты для «${escape(query)}» →</a>`;
    panel.hidden=false;input.setAttribute('aria-expanded','true');
  }
  input.addEventListener('input',update);
  input.addEventListener('focus',update);
  input.addEventListener('keydown',event=>{
    if (event.key==='Escape') {hide();return;}
    if (panel.hidden) return;
    if (event.key==='ArrowDown'||event.key==='ArrowUp') {
      event.preventDefault();
      selected=event.key==='ArrowDown'?Math.min(selected+1,found.length-1):Math.max(selected-1,-1);
      panel.querySelectorAll('[role=option]').forEach((option,i)=>{option.classList.toggle('selected',i===selected);option.setAttribute('aria-selected',String(i===selected));});
      if (selected>=0) input.setAttribute('aria-activedescendant',`suggestion-${selected}`);
      else input.removeAttribute('aria-activedescendant');
    } else if (event.key==='Enter'&&selected>=0) {event.preventDefault();location.href=siteURL(found[selected]);}
  });
  document.addEventListener('pointerdown',event=>{if (!wrap.contains(event.target)) hide();});
}
setView(view);
fetch(`${base}assets/search-index.json`).then(response=>{
  if (!response.ok) throw new Error('Search index unavailable');
  return response.json();
}).then(sites=>{
  index=sites;
  renderSearch();
  document.querySelectorAll('.search-form').forEach(setupSuggestions);
}).catch(error=>console.error(error));
