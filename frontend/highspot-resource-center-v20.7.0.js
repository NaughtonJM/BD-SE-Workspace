/* HIGHSPOT_RESOURCE_CENTER_V20_7_0 */
(function(){
'use strict';
const VERSION='20.7.0';
const MANAGED=new Set(['Highspot Catalog','Product Overview','Datasheet','Implementation Services','Battlecard','Competitive Intelligence','Highspot Video']);
const TYPE_ORDER=['All','Datasheet','Sales Presentation','Highspot Video','Battlecard','Win Story','Implementation Services','Competitive Intelligence','Product Overview','Highspot Catalog'];
const TYPE_LABELS={'All':'All Resources','Datasheet':'Datasheets','Sales Presentation':'Sales Presentations','Highspot Video':'Videos','Battlecard':'Battlecards','Win Story':'Win Stories','Implementation Services':'Implementation','Competitive Intelligence':'Competitive Intel','Product Overview':'Product Overviews','Highspot Catalog':'Catalog Links'};
let source=[];
let selectedType='All';
let selectedProduct='All';
let query='';
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalizedProduct=v=>String(v||'Portfolio').trim()||'Portfolio';
function effectiveType(item){
  if(/win story/i.test(item.title||''))return 'Win Story';
  if(item.category==='Highspot Catalog'&&/sales presentation/i.test(item.title||''))return 'Sales Presentation';
  return item.category||'Other';
}
function managedItems(){return source.filter(x=>MANAGED.has(x.category)||effectiveType(x)==='Win Story'||effectiveType(x)==='Sales Presentation')}

const style=document.createElement('style');
style.id='highspot-resource-center-v20-7-0-style';
style.textContent=`
#resources>.grid2{display:none!important}
#v205ResourceTools,#v2052Shell,#v2053Shell,#v206Shell{display:none!important}
.v207-top{margin-bottom:16px}.v207-heading{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}.v207-heading h2{margin:0}.v207-count{color:var(--muted)}
.v207-types{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}.v207-types button{margin:0!important;min-height:34px;padding:6px 10px!important}.v207-types button.active{background:var(--gold)!important;color:#210936!important;border-color:var(--gold)!important}
.v207-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#180825;margin:12px 0}.v207-product{margin:0!important;border:0!important;border-right:1px solid var(--line)!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;background:#241038!important;text-align:left!important;padding:11px!important}.v207-product:hover,.v207-product.active{background:#572681!important;box-shadow:inset 0 -4px 0 var(--gold)}.v207-product strong{display:block}.v207-product small{display:block;color:var(--muted)}.v207-product.active small{color:#fff}
.v207-search{display:grid;grid-template-columns:minmax(260px,1fr) auto;gap:10px;align-items:end}.v207-search .btn{margin:0;height:43px;display:flex;align-items:center}
.v207-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.v207-card{background:#180825;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:10px;padding:14px}.v207-card h3{margin:0 0 8px}.v207-card p{color:#eee}.v207-card .btn{margin-left:0}.v207-empty{text-align:center;color:var(--muted);padding:25px}
.v207-bottom{margin-top:28px;border-top:2px solid var(--gold);padding-top:18px}.v207-admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.v207-video-admin{margin-top:12px}.v207-video-admin h2{margin-top:0}.v207-video-admin .muted{margin-bottom:10px}.v207-video-summary{font-weight:700;color:#fff;margin:8px 0}.v207-video-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v207-video-row{background:#180825;border:1px solid var(--line);border-radius:8px;padding:10px}.v207-video-row strong{display:block}.v207-video-row span{color:var(--muted);font-size:11px}
@media(max-width:900px){.v207-grid,.v207-admin-grid,.v207-video-list,.v207-search{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

function ensureStructure(){
  const section=document.getElementById('resources');
  const view=document.getElementById('resourceView');
  const form=document.getElementById('resourceForm');
  if(!section||!view||!form)return null;
  let top=document.getElementById('v207Top');
  if(!top){
    top=document.createElement('div');
    top.id='v207Top';
    top.className='panel v207-top';
    section.querySelector('.hero')?.insertAdjacentElement('afterend',top);
  }
  let bottom=document.getElementById('v207Bottom');
  if(!bottom){
    bottom=document.createElement('div');
    bottom.id='v207Bottom';
    bottom.className='v207-bottom';
    bottom.innerHTML='<div class="v207-admin-grid"><section class="panel"><h2>How to use this area</h2><p>Add the exact Highspot URLs you use for customer decks, partner decks, demo videos, battlecards, and technical enablement. Links remain editable and are grouped by category and product.</p></section><section id="v207Manual" class="panel"><h2>Add or Edit Resource Link</h2><p class="muted">Manual link entry is intentionally placed below the catalog.</p></section></div><section id="v207VideoAdmin" class="panel v207-video-admin"><h2>Highspot Product Video Catalog</h2><div class="field"><label>Search videos</label><input id="v207VideoSearch" placeholder="Search videos by title, product, or description"></div><div id="v207VideoSummary" class="v207-video-summary"></div><div id="v207VideoList" class="v207-video-list"></div><button id="v207Refresh" type="button">Refresh</button></section>';
    section.appendChild(bottom);
  }
  const manual=bottom.querySelector('#v207Manual');
  if(form.parentElement!==manual){form.classList.remove('panel');manual.appendChild(form)}
  if(view.nextElementSibling!==bottom)section.insertBefore(bottom,view.nextSibling);
  const videoSearch=bottom.querySelector('#v207VideoSearch');
  if(videoSearch&&!videoSearch.dataset.bound){videoSearch.dataset.bound='1';videoSearch.addEventListener('input',renderVideoAdministration)}
  const refresh=bottom.querySelector('#v207Refresh');
  if(refresh&&!refresh.dataset.bound){refresh.dataset.bound='1';refresh.addEventListener('click',()=>window.loadResources(true))}
  return {section,view,top,bottom};
}
function typeCounts(){const map=new Map();managedItems().forEach(x=>{const t=effectiveType(x);map.set(t,(map.get(t)||0)+1)});return map}
function productCounts(){const map=new Map();managedItems().forEach(x=>{const p=normalizedProduct(x.product);map.set(p,(map.get(p)||0)+1)});return map}
function card(item){return `<article class="v207-card"><h3>${E(item.title)}</h3><span class="pill">${E(effectiveType(item))}</span><span class="pill">${E(normalizedProduct(item.product))}</span><p>${E(item.description||'Official Highspot resource')}</p><a class="btn primary" href="${E(item.url)}" target="_blank" rel="noopener noreferrer">Open in Highspot</a><button class="danger" onclick="deleteResource(${Number(item.id)})">Delete</button></article>`}
function renderCatalog(){
  const structure=ensureStructure();if(!structure)return;
  const typeCountsMap=typeCounts(),productCountsMap=productCounts(),items=managedItems();
  structure.top.innerHTML=`<div class="v207-heading"><h2>Highspot Resource Center</h2><div class="v207-count">${items.length} governed links</div></div><div class="v207-types">${TYPE_ORDER.filter(t=>t==='All'||typeCountsMap.has(t)).map(t=>`<button type="button" data-type="${E(t)}" class="${selectedType===t?'active':''}">${E(TYPE_LABELS[t]||t)}${t==='All'?'':` (${typeCountsMap.get(t)})`}</button>`).join('')}</div><div class="v207-products"><button type="button" data-product="All" class="v207-product ${selectedProduct==='All'?'active':''}"><strong>All Products</strong><small>${items.length} resources</small></button>${[...productCountsMap.keys()].sort().map(p=>`<button type="button" data-product="${E(p)}" class="v207-product ${selectedProduct===p?'active':''}"><strong>${E(p)}</strong><small>${productCountsMap.get(p)} resources</small></button>`).join('')}</div><div class="v207-search"><div class="field"><label>Search current catalog</label><input id="v207Query" value="${E(query)}" placeholder="Search title, product, category, or description"></div><a class="btn" href="https://blackduck.highspot.com/spots/64c937f6a3538d4619854c67" target="_blank" rel="noopener noreferrer">Open Sales &amp; Marketing Materials</a></div>`;
  structure.top.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{selectedType=b.dataset.type;renderCatalog()}));
  structure.top.querySelectorAll('[data-product]').forEach(b=>b.addEventListener('click',()=>{selectedProduct=b.dataset.product;renderCatalog()}));
  const search=structure.top.querySelector('#v207Query');search.addEventListener('input',()=>{query=search.value;renderResults()});
  renderResults();renderVideoAdministration();
}
function renderResults(){
  const view=document.getElementById('resourceView');if(!view)return;
  const q=query.trim().toLowerCase();
  const rows=managedItems().filter(x=>(selectedType==='All'||effectiveType(x)===selectedType)&&(selectedProduct==='All'||normalizedProduct(x.product)===selectedProduct)&&(!q||JSON.stringify(x).toLowerCase().includes(q)));
  view.innerHTML=rows.length?`<div class="v207-grid">${rows.map(card).join('')}</div>`:'<div class="v207-empty">No matching Highspot resources.</div>';
}
function renderVideoAdministration(){
  const summary=document.getElementById('v207VideoSummary'),list=document.getElementById('v207VideoList'),field=document.getElementById('v207VideoSearch');if(!summary||!list)return;
  const q=(field?.value||'').toLowerCase();const videos=source.filter(x=>x.category==='Highspot Video').filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q));const products=new Set(source.filter(x=>x.category==='Highspot Video').map(x=>normalizedProduct(x.product)));
  summary.textContent=`Showing ${videos.length} of ${source.filter(x=>x.category==='Highspot Video').length} product-specific Highspot videos across ${products.size} products.`;
  list.innerHTML=videos.map(x=>`<div class="v207-video-row"><strong>${E(x.title)}</strong><span>${E(normalizedProduct(x.product))}</span></div>`).join('')||'<div class="v207-empty">No matching videos.</div>';
}
window.loadResources=async function(render=true){
  const response=await fetch('/api/se-resources');if(!response.ok)throw new Error('Resource API failed with HTTP '+response.status);
  source=await response.json();window.RESOURCES=source;try{RESOURCES=source}catch{}
  if(render)renderCatalog();if(typeof renderProducts==='function')renderProducts();return source;
};
const priorRoute=window.route;
window.route=function(id){const result=priorRoute.apply(this,arguments);if(id==='resources')setTimeout(()=>window.loadResources(true),0);return result};
function boot(){if(document.getElementById('resources')?.classList.contains('active'))window.loadResources(true).catch(console.error)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
console.log('HIGHSPOT_RESOURCE_CENTER_V20_7_0 loaded');
})();