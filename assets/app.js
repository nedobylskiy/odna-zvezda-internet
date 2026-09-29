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

const index = [
  ['knowledge','knowledge.wiki','space','Энциклопедия Солнечной системы','Места, люди, корабли и события освоенной Солнечной системы. Точка входа для тех, кто впервые оказался в Сети Одной звезды.'],
  ['ue','portal.ue','earth','Объединённая Земля','Точка доступа к земным сообщениям, службам и публичным данным Объединённой Земли.'],
  ['mars','red.mars','mars','Марсианская лента','Новости куполов, маршруты между поселениями и повседневная жизнь Красной планеты.'],
  ['oai','directory.oai','mars','Каталог куполов O-AI','Адреса и навигация по локальному сегменту куполов O-AI.'],
  ['prime','thechurch.prime','prime','Церковь Прайма','Паломничество, община и публичные сообщения Церкви Прайма.'],
  ['shrine','pilgrimage.light','prime','Паломничество к месту посадки Apollo 11','Место посадки Apollo 11 и святыня Apollo 11 Shrine в традиции Прайма.'],
  ['moon','archive.moon','moon','Лунный архив','Лунные места, архивы экспедиций и память о первых полётах.'],
  ['phobos','relay.phobos','phobos','Ретранслятор Фобоса','Узел связи и навигации у марсианской орбиты.'],
  ['hyperion','market.hyp','space','Рынок Гипериона','Объявления, слухи и торговые предложения независимого Гипериона.'],
  ['olympic','olympic.ship','space','Бортовой журнал Olympic','Публичная карточка корабля Olympic и ссылки на его маршрут в мире Одной звезды.']
];
function renderSearch() {
  const list = document.querySelector('#results'); if (!list) return;
  const q = (new URLSearchParams(location.search).get('q') || '').trim();
  const input = document.querySelector('#query'); if (input) input.value = q;
  const terms = q.toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
  const zoneScore = z => z===view ? 8 : (view==='mars' && z==='phobos') || (view==='earth' && z==='moon') || (view==='prime' && z==='moon') ? 3 : 0;
  const scored = index.map(s=>{
    const [slug,domain,zone,title,description]=s;
    const text=`${domain} ${title} ${description} ${zoneNames[zone]}`.toLocaleLowerCase('ru');
    const match=terms.length ? terms.reduce((sum,t)=>sum+(domain.toLowerCase().includes(t)?20:0)+(title.toLocaleLowerCase('ru').includes(t)?12:0)+(description.toLocaleLowerCase('ru').includes(t)?3:0)+(zoneNames[zone].toLocaleLowerCase('ru').includes(t)?2:0),0) : 1;
    return {s, score: match ? match+zoneScore(zone) : 0, slug};
  }).filter(x=>x.score).sort((a,b)=>b.score-a.score || a.s[1].localeCompare(b.s[1]));
  const status = document.querySelector('#search-status');
  if (status) status.textContent=q ? `По запросу «${q}» найдено: ${scored.length} · приоритет: ${zoneNames[view]}` : `Все узлы публичного индекса · приоритет: ${zoneNames[view]}`;
  list.innerHTML=scored.length ? scored.map(({s})=>`<article class="result"><a class="domain" href="${base}sites/${s[0]}/">${escape(s[1])} <span>↗</span></a><h3><a href="${base}sites/${s[0]}/">${escape(s[3])}</a></h3><p>${escape(s[4])}</p><span class="result-zone">${escape(zoneNames[s[2]])}</span></article>`).join('') : '<div class="empty">В открытом индексе ничего не найдено. Попробуйте название планеты, корабля или домен.</div>';
}
setView(view);
