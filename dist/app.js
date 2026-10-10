const $ = (selector) => document.querySelector(selector);
const decadeDefs = [
  {key:'all', label:'全部年代', years:'跨越世纪', note:'一起出发'},
  {key:'1960', label:'1960s', years:'黄金萌芽', note:'电视动画登场'},
  {key:'1970', label:'1970s', years:'机甲觉醒', note:'想象力爆发'},
  {key:'1980', label:'1980s', years:'经典浪潮', note:'光影新纪元'},
  {key:'1990', label:'1990s', years:'神作年代', note:'记忆里的热血'},
  {key:'2000', label:'2000s', years:'千禧物语', note:'风格大绽放'},
  {key:'2010', label:'2010s', years:'次元盛世', note:'新世代登场'},
  {key:'2020', label:'2020s', years:'现在进行时', note:'未来正在发生'},
];
const genreDefs = [
  ['all','全部题材'],['Action','热血动作'],['Adventure','冒险'],['Fantasy','奇幻'],
  ['Sci-Fi','科幻'],['Romance','恋爱'],['Comedy','喜剧'],['Drama','剧情'],
  ['Slice of Life','日常'],['Mystery','悬疑'],['Sports','运动'],['Supernatural','超自然']
];
const formatNames = {TV:'TV 动画',MOVIE:'动画电影',OVA:'OVA',ONA:'网络动画',SPECIAL:'特别篇',TV_SHORT:'短篇动画',MUSIC:'音乐动画'};
const genreNames = Object.fromEntries(genreDefs);
const aliases = [
  ['Shingeki no Kyojin','进击的巨人'],['Kimetsu no Yaiba','鬼灭之刃'],['Fullmetal Alchemist','钢之炼金术师'],
  ['Sousou no Frieren','葬送的芙莉莲'],['Frieren','葬送的芙莉莲'],['Spirited Away','千与千寻'],
  ['Sen to Chihiro','千与千寻'],['Cowboy Bebop','星际牛仔'],['Neon Genesis Evangelion','新世纪福音战士'],
  ['Shinseiki Evangelion','新世纪福音战士'],['One Piece','海贼王 航海王'],['Naruto','火影忍者'],
  ['Dragon Ball','龙珠'],['Death Note','死亡笔记'],['Steins;Gate','命运石之门'],
  ['Code Geass','反叛的鲁路修'],['Kimi no Na wa','你的名字'],['Your Name','你的名字'],
  ['Tenki no Ko','天气之子'],['Weathering With You','天气之子'],['Suzume no Tojimari','铃芽之旅'],
  ['Jujutsu Kaisen','咒术回战'],['Chainsaw Man','电锯人'],['Bocchi the Rock','孤独摇滚'],
  ['Violet Evergarden','紫罗兰永恒花园'],['Mob Psycho 100','灵能百分百'],['One Punch Man','一拳超人'],
  ['Hunter x Hunter','全职猎人'],['Haikyuu','排球少年'],['Blue Lock','蓝色监狱'],
  ['Kuroko no Basket','黑子的篮球'],['Slam Dunk','灌篮高手'],['Hajime no Ippo','第一神拳'],
  ['Kaguya-sama','辉夜大小姐想让我告白'],['Oshi no Ko','我推的孩子'],['Spy x Family','间谍过家家'],
  ['Boku no Hero Academia','我的英雄学院'],['My Hero Academia','我的英雄学院'],
  ['Tokyo Ghoul','东京喰种'],['Tokyo Revengers','东京复仇者'],['Vinland Saga','冰海战记'],
  ['Dandadan','胆大党'],['Dan Da Dan','胆大党'],['Delicious in Dungeon','迷宫饭'],
  ['Dungeon Meshi','迷宫饭'],['Made in Abyss','来自深渊'],['Mushishi','虫师'],
  ['Natsume Yuujinchou','夏目友人帐'],['Natsume’s Book of Friends','夏目友人帐'],
  ['Psycho-Pass','心理测量者'],['Ghost in the Shell','攻壳机动队'],['Koukaku Kidoutai','攻壳机动队'],
  ['Akira','阿基拉'],['Perfect Blue','未麻的部屋'],['Paprika','红辣椒'],
  ['Mononoke Hime','幽灵公主'],['Princess Mononoke','幽灵公主'],['Howl’s Moving Castle','哈尔的移动城堡'],
  ['Howl no Ugoku Shiro','哈尔的移动城堡'],['Tonari no Totoro','龙猫'],['My Neighbor Totoro','龙猫'],
  ['Kiki’s Delivery Service','魔女宅急便'],['Majo no Takkyuubin','魔女宅急便'],
  ['Grave of the Fireflies','萤火虫之墓'],['Hotaru no Haka','萤火虫之墓'],
  ['Gintama','银魂'],['Bleach','死神 境界'],['Detective Conan','名侦探柯南'],['Meitantei Conan','名侦探柯南'],
  ['Pokémon','宝可梦 神奇宝贝'],['Pokemon','宝可梦 神奇宝贝'],['Sailor Moon','美少女战士'],
  ['Bishoujo Senshi Sailor Moon','美少女战士'],['Cardcaptor Sakura','魔卡少女樱'],
  ['Digimon Adventure','数码宝贝大冒险'],['Doraemon','哆啦A梦'],['Crayon Shin-chan','蜡笔小新'],
  ['Astro Boy','铁臂阿童木'],['Tetsuwan Atom','铁臂阿童木'],['Mobile Suit Gundam','机动战士高达'],
  ['Kidou Senshi Gundam','机动战士高达'],['Saint Seiya','圣斗士星矢'],
  ['Yu Yu Hakusho','幽游白书'],['Inuyasha','犬夜叉'],['Rurouni Kenshin','浪客剑心'],
  ['JoJo no Kimyou na Bouken','JOJO的奇妙冒险'],['JoJo’s Bizarre Adventure','JOJO的奇妙冒险'],
  ['Fate/Zero','命运零点'],['Fate/stay night','命运之夜'],['Sword Art Online','刀剑神域'],
  ['Re:Zero','从零开始的异世界生活'],['KonoSuba','为美好的世界献上祝福'],
  ['Mushoku Tensei','无职转生'],['Tensei Shitara Slime Datta Ken','关于我转生变成史莱姆这档事'],
  ['Koe no Katachi','声之形'],['A Silent Voice','声之形'],['Anohana','未闻花名'],
  ['Clannad','CLANNAD'],['K-On!','轻音少女'],['Hyouka','冰菓'],['Nichijou','日常'],
  ['Toradora!','龙与虎'],['Your Lie in April','四月是你的谎言'],['Shigatsu wa Kimi no Uso','四月是你的谎言'],
  ['The Apothecary Diaries','药屋少女的呢喃'],['Kusuriya no Hitorigoto','药屋少女的呢喃'],
  ['Attack on Titan','进击的巨人'],['Demon Slayer','鬼灭之刃']
];
let catalog = [];
let favorites = new Set();
let state = {decade:'all',genre:'all',format:'all',sort:'popular',query:'',onlyFavorites:false,visible:25};
try { favorites = new Set(JSON.parse(localStorage.getItem('anime-atlas-favorites') || '[]').map(Number)); } catch { favorites = new Set(); }

function esc(value='') { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function safeUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } }
function titleOf(item) { return item.title.english || item.title.romaji || item.title.native || '未命名作品'; }
function aliasOf(item) { const text = `${item.title.english || ''} ${item.title.romaji || ''}`.toLowerCase(); return aliases.filter(([key]) => text.includes(key.toLowerCase())).map(([,value]) => value).join(' '); }
function displayTitle(item) { return item.cn || aliasOf(item).split(' ')[0] || titleOf(item); }
function decadeMatch(item,key) { const year=item.startDate.year; return key==='all' || (key==='pre60' ? year<1960 : year>=Number(key)&&year<Number(key)+10); }
function cover(item) { const value=item.coverImage?.large||'';return /^covers\/\d+\.jpg$/.test(value)?value:safeUrl(value); }
function normalized(value) { return String(value||'').toLowerCase().normalize('NFKC').replace(/\s+/g,'').replace(/[·・:：!！?？'’]/g,''); }
function filterCatalog() {
  const query=normalized(state.query);
  const result=catalog.filter(item => {
    if(!decadeMatch(item,state.decade)) return false;
    if(state.genre!=='all'&&!item.genres.includes(state.genre)) return false;
    if(state.format!=='all'&&item.format!==state.format) return false;
    if(state.onlyFavorites&&!favorites.has(item.id)) return false;
    if(query && !normalized([titleOf(item),item.cn,item.title.romaji,item.title.native,aliasOf(item),item.startDate.year].join(' ')).includes(query)) return false;
    return true;
  });
  const sorts={popular:(a,b)=>b.popularity-a.popularity,newest:(a,b)=>b.startDate.year-a.startDate.year||b.popularity-a.popularity,oldest:(a,b)=>a.startDate.year-b.startDate.year||b.popularity-a.popularity,score:(a,b)=>(b.averageScore||0)-(a.averageScore||0),title:(a,b)=>titleOf(a).localeCompare(titleOf(b))};
  return result.sort(sorts[state.sort]);
}
function renderDecades() {
  $('#decade-grid').innerHTML=decadeDefs.map(def=>`<button type="button" class="decade-card ${state.decade===def.key?'active':''}" data-decade="${def.key}" aria-pressed="${state.decade===def.key}"><span>${esc(def.label)}</span><strong>${esc(def.years)}</strong><small>${esc(def.note)} · ${catalog.filter(item=>decadeMatch(item,def.key)).length}</small></button>`).join('');
}
function renderGenres() { $('#genre-tabs').innerHTML=genreDefs.map(([key,label])=>`<button type="button" class="genre-tab ${state.genre===key?'active':''}" data-genre="${key}" aria-pressed="${state.genre===key}">${label}</button>`).join(''); }
function card(item) {
  const saved=favorites.has(item.id);
  const image=cover(item);
  const alias=displayTitle(item);
  return `<article class="anime-card"><button type="button" class="anime-card-main" data-open="${item.id}" aria-label="查看${esc(alias)}详情"><div class="poster-wrap">${image?`<img src="${esc(image)}" alt="${esc(titleOf(item))}封面" loading="lazy" onerror="this.style.display='none'">`:`<div class="poster-fallback">${esc(alias)}</div>`}<span class="format-pill">${esc(formatNames[item.format]||item.format||'动画')}</span>${item.averageScore?`<span class="score-pill"><span>★</span> ${(item.averageScore/10).toFixed(1)} <small>Bangumi</small></span>`:''}</div><div class="card-meta"><span>${item.startDate.year}</span><i></i><span>${esc(formatNames[item.format]||item.format||'动画')}</span></div><h3 class="card-title" title="${esc(alias)}">${esc(alias)}</h3><p class="card-sub" title="${esc(titleOf(item))}">${esc(titleOf(item))}</p><p class="card-summary">${esc(item.description||'点击了解这部作品的更多信息。')}</p></button><button type="button" class="favorite-btn ${saved?'saved':''}" data-favorite="${item.id}" aria-label="${saved?'从片单移除':'加入片单'}：${esc(alias)}" aria-pressed="${saved}">${saved?'★':'☆'}</button></article>`;
}
function render() {
  renderDecades(); renderGenres();
  const result=filterCatalog();
  $('#anime-grid').innerHTML=result.slice(0,state.visible).map(card).join('');
  $('#result-count').textContent=result.length.toLocaleString('zh-CN');
  $('#fav-count').textContent=favorites.size;
  $('#empty-state').hidden=result.length!==0;
  $('#load-more').hidden=result.length<=state.visible;
  $('#catalog-title').innerHTML=state.onlyFavorites?'我的片单<span class="heading-mark">.</span>':'宇宙图鉴<span class="heading-mark">.</span>';
  $('#catalog-subtitle').textContent=state.onlyFavorites?'你点亮的星星，都在这里。':'每一部作品，都是通往另一个世界的入口。';
  $('#active-filter-note').textContent=[state.decade!=='all'?decadeDefs.find(d=>d.key===state.decade)?.label:'',state.genre!=='all'?genreNames[state.genre]:'',state.onlyFavorites?'我的片单':''].filter(Boolean).join(' · ');
  $('#nav-favorites').classList.toggle('active',state.onlyFavorites);
}
function reset() { state={decade:'all',genre:'all',format:'all',sort:'popular',query:'',onlyFavorites:false,visible:25}; $('#search-input').value=''; $('#format-filter').value='all'; $('#sort-filter').value='popular'; render(); }
function saveFavorites(){ try { localStorage.setItem('anime-atlas-favorites',JSON.stringify([...favorites])); } catch {} }
function toggleFavorite(id) { favorites.has(id)?favorites.delete(id):favorites.add(id);saveFavorites();render();if($('#detail-dialog').open && Number($('#detail-dialog').dataset.id)===id)showDetail(id); }
function showDetail(id) {
  const item=catalog.find(entry=>entry.id===id); if(!item)return;
  const image=cover(item);const banner=safeUrl(item.bannerImage);const title=displayTitle(item);const saved=favorites.has(id);
  $('#detail-content').innerHTML=`<div class="detail-banner">${banner?`<img src="${esc(banner)}" alt="">`:''}</div><div class="detail-body">${image?`<img class="detail-poster" src="${esc(image)}" alt="${esc(titleOf(item))}封面">`:'<div class="detail-poster"></div>'}<div class="detail-copy"><div class="detail-kicker">${item.startDate.year} · ${esc(formatNames[item.format]||item.format||'动画')} · ANIME ATLAS</div><h2>${esc(title)}</h2><p class="detail-native">${esc(titleOf(item))}${item.title.native&&item.title.native!==titleOf(item)?' · '+esc(item.title.native):''}</p><div class="detail-chips">${item.genres.map(genre=>`<span>${esc(genreNames[genre]||genre)}</span>`).join('')}${item.episodes?`<span>${item.episodes} 集</span>`:''}${item.averageScore?`<span>★ Bangumi ${(item.averageScore/10).toFixed(1)} / 10 · ${Number(item.ratingCount||0).toLocaleString('zh-CN')} 人评分</span>`:''}</div><p class="detail-description">${esc(item.description||'这部作品正在等待你亲自探索。点击下方资料链接，查看更多作品信息。')}</p><div class="detail-actions"><button type="button" class="detail-save" data-favorite="${id}">${saved?'★ 已加入片单':'☆ 加入我的片单'}</button><a class="detail-link" href="${esc(safeUrl(item.siteUrl)||'https://bgm.tv/')}" target="_blank" rel="noopener noreferrer">到 Bangumi 查看最新评分 ↗</a></div><div class="detail-source-note">简介与评分来自 Bangumi 数据快照；最新评分请以原条目为准。</div></div></div>`;
  $('#detail-dialog').dataset.id=id;
  if(!$('#detail-dialog').open)$('#detail-dialog').showModal();
}
function initHero() {
  const picks=[catalog.find(i=>i.cn.includes('千与千寻')),catalog.find(i=>i.cn.includes('进击的巨人')),catalog.find(i=>i.cn.includes('星际牛仔'))].map((item,index)=>item||catalog[index]);
  picks.forEach((item,index)=>{if(item&&cover(item))$(`#hero-cover-${index}`).innerHTML=`<img src="${esc(cover(item))}" alt="${esc(titleOf(item))}封面">`;});
}
async function init() {
  try {
    const response=await fetch('anime.json'); if(!response.ok)throw Error('无法读取目录');
    catalog=(await response.json()).filter(item=>item?.id&&item?.startDate?.year&&item.startDate.year<=2026);
    catalog.sort((a,b)=>b.popularity-a.popularity);
    $('#metric-total').textContent=catalog.length.toLocaleString('zh-CN')+'+';
    $('#badge-total').textContent=catalog.length.toLocaleString('zh-CN');
    const years=catalog.map(item=>item.startDate.year);$('#metric-years').textContent=`${Math.min(...years)}—${Math.max(...years)}`;
    initHero(); render();
  } catch(error) { $('#anime-grid').innerHTML='<p class="load-error">目录加载失败，请刷新页面重试。</p>'; $('#result-count').textContent='0'; console.error(error); }
}
$('#decade-grid').addEventListener('click',event=>{const target=event.target.closest('[data-decade]');if(!target)return;state.decade=target.dataset.decade;state.visible=25;render();$('#explore').scrollIntoView({behavior:'smooth'});});
$('#genre-tabs').addEventListener('click',event=>{const target=event.target.closest('[data-genre]');if(!target)return;state.genre=target.dataset.genre;state.visible=25;render();});
$('#search-input').addEventListener('input',event=>{state.query=event.target.value.trim();state.visible=25;render();});
$('#format-filter').addEventListener('change',event=>{state.format=event.target.value;state.visible=25;render();});
$('#sort-filter').addEventListener('change',event=>{state.sort=event.target.value;render();});
$('#anime-grid').addEventListener('click',event=>{const favorite=event.target.closest('[data-favorite]');if(favorite){toggleFavorite(Number(favorite.dataset.favorite));return;}const open=event.target.closest('[data-open]');if(open)showDetail(Number(open.dataset.open));});
$('#detail-content').addEventListener('click',event=>{const target=event.target.closest('[data-favorite]');if(target)toggleFavorite(Number(target.dataset.favorite));});
$('#dialog-close').addEventListener('click',()=>$('#detail-dialog').close());
$('#detail-dialog').addEventListener('click',event=>{if(event.target===$('#detail-dialog'))$('#detail-dialog').close();});
$('#load-more').addEventListener('click',()=>{state.visible+=25;render();});
$('#reset-filters').addEventListener('click',reset);$('#empty-reset').addEventListener('click',reset);
$('#nav-favorites').addEventListener('click',()=>{state.onlyFavorites=!state.onlyFavorites;state.visible=25;render();$('#explore').scrollIntoView({behavior:'smooth'});$('#mobile-menu').setAttribute('aria-expanded','false');$('.main-nav').classList.remove('open');});
$('#search-shortcut').addEventListener('click',()=>{$('#explore').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#search-input').focus(),300);});
$('#random-pick').addEventListener('click',()=>{if(catalog.length)showDetail(catalog[Math.floor(Math.random()*catalog.length)].id);});
$('#mobile-menu').addEventListener('click',()=>{const open=$('.main-nav').classList.toggle('open');$('#mobile-menu').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',event=>{if(event.key==='/'&&(document.activeElement?.tagName!=='INPUT')){event.preventDefault();$('#search-input').focus();$('#explore').scrollIntoView({behavior:'smooth'});}if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('#search-input').focus();$('#explore').scrollIntoView({behavior:'smooth'});}});
init();
