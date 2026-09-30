/* HIGHSPOT_PRODUCT_NAVIGATION_V20_5_2 */
(function(){
'use strict';
const VERSION='20.5.2';
const HIGHSPOT_HOME='https://blackduck.highspot.com/';
let selectedProduct='';
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanProduct=v=>String(v||'General').split(/[;/]/)[0].trim()||'General';
const isVideo=x=>x&&x.category==='Highspot Video';
const resources=()=>Array.isArray(window.RESOURCES)?window.RESOURCES:(typeof RESOURCES!=='undefined'&&Array.isArray(RESOURCES)?RESOURCES:[]);

const style=document.createElement('style');style.textContent=`
.v2052-shell{margin-bottom:16px}.v2052-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#180825}.v2052-product{margin:0!important;border:0!important;border-right:1px solid var(--line)!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;padding:12px!important;background:#241038!important;text-align:left!important}.v2052-product:hover,.v2052-product.active{background:#572681!important;box-shadow:inset 0 -4px 0 var(--gold)}.v2052-product strong{display:block;color:#fff}.v2052-product span{font-size:11px;color:var(--muted)}.v2052-command{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:13px 0}.v2052-search{display:grid;grid-template-columns:1fr 230px;gap:10px}.v2052-discovery{display:none;border:1px solid var(--line);border-left:5px solid #20b7af;border-radius:10px;background:#180825;padding:16px;margin-top:12px}.v2052-discovery.open{display:block}.v2052-review{display:grid;grid-template-columns:1.2fr 1fr;gap:12px}.v2052-add-bottom{margin-top:25px;border-top:2px solid var(--gold);padding-top:18px}.v2052-video-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.v2052-card{background:#180825;border:1px solid var(--line);border-radius:10px;padding:14px}.v2052-card h3{margin-top:0}.v2052-empty{padding:24px;text-align:center;color:var(--muted)}@media(max-width:900px){.v2052-search,.v2052-review,.v2052-video-grid{grid-template-columns:1fr}}
`;document.head.appendChild(style);

function getForm(){return document.getElementById('resourceForm')}
function setField(name,value){const f=getForm();const field=f&&f.elements.namedItem(name);if(field){field.value=value;field.dispatchEvent(new Event('change',{bubbles:true}))}}
function validHighspotUrl(value){try{const u=new URL(value);return /^https:$/.test(u.protocol)&&/(^|\.)highspot\.com$/i.test(u.hostname)&&/^\/(items|spots)\//.test(u.pathname)}catch{return false}}

function moveAddForm(){
 const section=document.getElementById('resources'),form=getForm();if(!section||!form)return;
 let bottom=document.getElementById('v2052AddBottom');
 if(!bottom){bottom=document.createElement('div');bottom.id='v2052AddBottom';bottom.className='panel v2052-add-bottom';bottom.innerHTML='<h2>Add or Edit Resource Link</h2><p class="muted">Use this section after reviewing an item in Highspot. Exact governed-content links stay in Highspot; the workspace stores only the reference.</p>';section.appendChild(bottom)}
 if(form.parentElement!==bottom){bottom.appendChild(form);form.classList.remove('panel')}
 const originalGrid=[...section.querySelectorAll('.grid2')].find(x=>x.contains(form));if(originalGrid&&originalGrid.children.length===0)originalGrid.remove();
}

function videoCounts(){const map=new Map();for(const x of resources().filter(isVideo)){const p=cleanProduct(x.product);map.set(p,(map.get(p)||0)+1)}return map}
function productBar(){
 const counts=videoCounts(),products=[...counts.keys()].sort();
 return '<button class="v2052-product '+(!selectedProduct?'active':'')+'" data-product=""><strong>All Videos</strong><span>'+[...counts.values()].reduce((a,b)=>a+b,0)+' items</span></button>'+products.map(p=>`<button class="v2052-product ${selectedProduct===p?'active':''}" data-product="${E(p)}"><strong>${E(p)}</strong><span>${counts.get(p)} video${counts.get(p)===1?'':'s'}</span></button>`).join('');
}
function card(x){return `<article class="v2052-card"><h3>${E(x.title)}</h3><span class="pill">${E(cleanProduct(x.product))}</span><p>${E(x.description||'Highspot product video')}</p><a class="btn primary" href="${E(x.url)}" target="_blank" rel="noopener noreferrer">Open in Highspot</a><button class="danger" onclick="deleteResource(${Number(x.id)})">Delete</button></article>`}
function render(){
 const section=document.getElementById('resources'),view=document.getElementById('resourceView');if(!section||!view)return;
 let shell=document.getElementById('v2052Shell');if(!shell){shell=document.createElement('div');shell.id='v2052Shell';shell.className='panel v2052-shell';const hero=section.querySelector('.hero');hero.insertAdjacentElement('afterend',shell)}
 shell.innerHTML=`<h2>Product Video Library</h2><div id="v2052Products" class="v2052-products">${productBar()}</div><div class="v2052-command"><button class="primary" id="v2052Find">Find New Videos in Highspot</button><button id="v2052Review">Review and Add a Discovered Link</button><button id="v2052Refresh">Refresh Library</button></div><div class="v2052-search"><div class="field"><label>Filter current library</label><input id="v2052Filter" placeholder="Search titles and descriptions"></div><div class="field"><label>Current product</label><input value="${E(selectedProduct||'All products')}" disabled></div></div><div id="v2052Discovery" class="v2052-discovery"><h3>Review a newly discovered Highspot video</h3><p>Highspot opens in a separate authenticated tab. Search there, copy the exact item link, then paste it below. This workspace does not store Highspot credentials.</p><div class="v2052-review"><div><div class="field"><label>Exact Highspot item URL</label><input id="v2052Url" placeholder="https://blackduck.highspot.com/items/..."></div><div class="field"><label>Video title</label><input id="v2052Title" placeholder="Product demo or training video title"></div></div><div><div class="field"><label>Product</label><select id="v2052CandidateProduct">${[...new Set(['Black Duck SCA','BDBA','Polaris','Coverity','Seeker','Continuous Dynamic','Defensics','Software Risk Manager','Code Sight','Signal',...videoCounts().keys()])].sort().map(p=>`<option ${p===selectedProduct?'selected':''}>${E(p)}</option>`).join('')}</select></div><div class="field"><label>Description</label><textarea id="v2052Description" rows="3" placeholder="Why this video is useful, audience, and internal/external status"></textarea></div></div></div><button class="primary" id="v2052Stage">Stage in Add Link Form</button></div>`;
 shell.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>{selectedProduct=b.dataset.product;render()});
 shell.querySelector('#v2052Find').onclick=()=>{window.open(HIGHSPOT_HOME,'_blank','noopener');shell.querySelector('#v2052Discovery').classList.add('open')};
 shell.querySelector('#v2052Review').onclick=()=>shell.querySelector('#v2052Discovery').classList.toggle('open');
 shell.querySelector('#v2052Refresh').onclick=()=>window.loadResources();
 shell.querySelector('#v2052Filter').oninput=renderCards;
 shell.querySelector('#v2052Stage').onclick=()=>{
  const url=shell.querySelector('#v2052Url').value.trim(),title=shell.querySelector('#v2052Title').value.trim(),product=shell.querySelector('#v2052CandidateProduct').value,description=shell.querySelector('#v2052Description').value.trim();
  if(!validHighspotUrl(url))return alert('Paste an exact HTTPS Highspot /items/ or /spots/ URL.');if(!title)return alert('Enter the video title.');
  setField('title',title);setField('category','Highspot');setField('product',product);setField('url',url);setField('description',description||'Product-specific Highspot video.');moveAddForm();getForm().scrollIntoView({behavior:'smooth',block:'start'});
 };
 moveAddForm();renderCards();
}
function renderCards(){
 const view=document.getElementById('resourceView'),q=(document.getElementById('v2052Filter')?.value||'').toLowerCase();if(!view)return;
 const videos=resources().filter(isVideo).filter(x=>(!selectedProduct||cleanProduct(x.product)===selectedProduct)&&JSON.stringify(x).toLowerCase().includes(q));
 view.innerHTML=`<div class="v2052-video-grid">${videos.map(card).join('')}</div>`||( '<div class="v2052-empty">No matching videos.</div>');
}
const priorLoad=window.loadResources;
window.loadResources=async function(renderPage=true){if(typeof priorLoad==='function')await priorLoad.call(this,false);if(renderPage)render();if(typeof renderProducts==='function')renderProducts()};
const priorRoute=window.route;
window.route=function(id){const r=priorRoute.apply(this,arguments);if(id==='resources')setTimeout(render,0);return r};
new MutationObserver(()=>{if(document.getElementById('resources')?.classList.contains('active'))render()}).observe(document.body,{childList:true,subtree:true});
console.log('HIGHSPOT_PRODUCT_NAVIGATION_V20_5_2 loaded');
})();