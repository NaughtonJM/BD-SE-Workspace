/* HIGHSPOT_PAGE_RECOVERY_V20_5_3 */
(function(){
'use strict';
const VERSION='20.5.3';
const HIGHSPOT_HOME='https://blackduck.highspot.com/';
let selectedProduct='';
let cachedResources=[];
let rendering=false;
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanProduct=v=>String(v||'General').split(/[;/]/)[0].trim()||'General';
const isVideo=x=>x&&x.category==='Highspot Video';
const style=document.createElement('style');style.id='highspot-page-recovery-v20-5-3-style';style.textContent=`
.v2053-shell{margin-bottom:16px}.v2053-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#180825}.v2053-product{margin:0!important;border:0!important;border-right:1px solid var(--line)!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;padding:11px!important;background:#241038!important;text-align:left!important}.v2053-product:hover,.v2053-product.active{background:#572681!important;box-shadow:inset 0 -4px 0 var(--gold)}.v2053-product strong{display:block}.v2053-product span{font-size:11px;color:var(--muted)}.v2053-actions{display:flex;gap:8px;flex-wrap:wrap;margin:13px 0}.v2053-filter{display:grid;grid-template-columns:1fr 230px;gap:10px}.v2053-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.v2053-card{background:#180825;border:1px solid var(--line);border-radius:10px;padding:14px}.v2053-card h3{margin-top:0}.v2053-review{display:none;border:1px solid var(--line);border-left:5px solid #20b7af;border-radius:10px;background:#180825;padding:15px;margin-top:12px}.v2053-review.open{display:block}.v2053-review-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v2053-add-bottom{margin-top:24px;border-top:2px solid var(--gold);padding-top:18px}.v2053-empty{text-align:center;color:var(--muted);padding:22px}@media(max-width:900px){.v2053-filter,.v2053-grid,.v2053-review-grid{grid-template-columns:1fr}}
`;document.head.appendChild(style);
function form(){return document.getElementById('resourceForm')}
function setField(name,value){const field=form()?.elements.namedItem(name);if(field){field.value=value;field.dispatchEvent(new Event('change',{bubbles:true}))}}
function validUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&/(^|\.)highspot\.com$/i.test(u.hostname)&&/^\/(items|spots)\//.test(u.pathname)}catch{return false}}
function moveForm(){
 const section=document.getElementById('resources'),f=form();if(!section||!f)return;
 let bottom=document.getElementById('v2053AddBottom');
 if(!bottom){bottom=document.createElement('div');bottom.id='v2053AddBottom';bottom.className='panel v2053-add-bottom';bottom.innerHTML='<h2>Add or Edit Resource Link</h2><p class="muted">Paste an exact governed Highspot item link or add another internal resource.</p>';section.appendChild(bottom)}
 const oldParent=f.parentElement;
 if(oldParent!==bottom){f.classList.remove('panel');bottom.appendChild(f)}
 if(oldParent&&oldParent.classList.contains('grid2')&&oldParent.children.length===0)oldParent.remove();
}
function counts(){const m=new Map();cachedResources.filter(isVideo).forEach(x=>{const p=cleanProduct(x.product);m.set(p,(m.get(p)||0)+1)});return m}
function productButtons(){const c=counts(),total=[...c.values()].reduce((a,b)=>a+b,0);return `<button class="v2053-product ${selectedProduct?'':'active'}" data-product=""><strong>All Videos</strong><span>${total} items</span></button>`+[...c.keys()].sort().map(p=>`<button class="v2053-product ${selectedProduct===p?'active':''}" data-product="${E(p)}"><strong>${E(p)}</strong><span>${c.get(p)} video${c.get(p)===1?'':'s'}</span></button>`).join('')}
function videoCard(x){return `<article class="v2053-card"><h3>${E(x.title)}</h3><span class="pill">${E(cleanProduct(x.product))}</span><p>${E(x.description||'Highspot product video')}</p><a class="btn primary" href="${E(x.url)}" target="_blank" rel="noopener noreferrer">Open in Highspot</a><button class="danger" onclick="deleteResource(${Number(x.id)})">Delete</button></article>`}
function renderCards(){const view=document.getElementById('resourceView');if(!view)return;const q=(document.getElementById('v2053Search')?.value||'').toLowerCase();const rows=cachedResources.filter(isVideo).filter(x=>(!selectedProduct||cleanProduct(x.product)===selectedProduct)&&JSON.stringify(x).toLowerCase().includes(q));view.innerHTML=rows.length?`<div class="v2053-grid">${rows.map(videoCard).join('')}</div>`:'<div class="v2053-empty">No matching product videos.</div>'}
function renderPage(){
 if(rendering)return;rendering=true;
 try{
  const section=document.getElementById('resources'),view=document.getElementById('resourceView');if(!section||!view)return;
  let shell=document.getElementById('v2053Shell');if(!shell){shell=document.createElement('div');shell.id='v2053Shell';shell.className='panel v2053-shell';section.querySelector('.hero')?.insertAdjacentElement('afterend',shell)}
  shell.innerHTML=`<h2>Highspot Product Video Library</h2><div class="v2053-products">${productButtons()}</div><div class="v2053-actions"><button class="primary" id="v2053Find">Find New Videos in Highspot</button><button id="v2053ReviewButton">Review and Add Link</button><button id="v2053Refresh">Refresh Library</button></div><div class="v2053-filter"><div class="field"><label>Filter current videos</label><input id="v2053Search" placeholder="Search title, product, or description"></div><div class="field"><label>Current product</label><input value="${E(selectedProduct||'All products')}" disabled></div></div><div id="v2053Review" class="v2053-review"><h3>Add a newly discovered Highspot video</h3><p>Search in the authenticated Highspot tab, copy the exact item URL, then review it here before saving.</p><div class="v2053-review-grid"><div><div class="field"><label>Exact Highspot URL</label><input id="v2053Url" placeholder="https://blackduck.highspot.com/items/..."></div><div class="field"><label>Title</label><input id="v2053Title"></div></div><div><div class="field"><label>Product</label><select id="v2053Candidate">${[...new Set(['Black Duck SCA','BDBA','Polaris','Coverity','Seeker','Continuous Dynamic','Defensics','Software Risk Manager','Code Sight','Signal',...counts().keys()])].sort().map(p=>`<option ${p===selectedProduct?'selected':''}>${E(p)}</option>`).join('')}</select></div><div class="field"><label>Description</label><textarea id="v2053Description" rows="3"></textarea></div></div></div><button class="primary" id="v2053Stage">Stage in Add Link Form</button></div>`;
  shell.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>{selectedProduct=b.dataset.product;renderPage()});
  shell.querySelector('#v2053Find').onclick=()=>{window.open(HIGHSPOT_HOME,'_blank','noopener');shell.querySelector('#v2053Review').classList.add('open')};
  shell.querySelector('#v2053ReviewButton').onclick=()=>shell.querySelector('#v2053Review').classList.toggle('open');
  shell.querySelector('#v2053Refresh').onclick=()=>window.loadResources(true);
  shell.querySelector('#v2053Search').oninput=renderCards;
  shell.querySelector('#v2053Stage').onclick=()=>{const url=shell.querySelector('#v2053Url').value.trim(),title=shell.querySelector('#v2053Title').value.trim();if(!validUrl(url))return alert('Paste an exact HTTPS Highspot /items/ or /spots/ URL.');if(!title)return alert('Enter the video title.');setField('title',title);setField('category','Highspot');setField('product',shell.querySelector('#v2053Candidate').value);setField('url',url);setField('description',shell.querySelector('#v2053Description').value.trim()||'Product-specific Highspot video.');moveForm();form().scrollIntoView({behavior:'smooth',block:'start'})};
  moveForm();renderCards();
 }finally{rendering=false}
}
const baseLoad=window.loadResources;
window.loadResources=async function(render=true){
 if(typeof baseLoad==='function')await baseLoad.call(this,false);
 cachedResources=Array.isArray(window.RESOURCES)?window.RESOURCES:(typeof RESOURCES!=='undefined'&&Array.isArray(RESOURCES)?RESOURCES:[]);
 if(render)renderPage();
 if(typeof renderProducts==='function')renderProducts();
 return cachedResources;
};
const baseRoute=window.route;
window.route=function(id){const result=baseRoute.apply(this,arguments);if(id==='resources')setTimeout(()=>window.loadResources(true),0);return result};
console.log('HIGHSPOT_PAGE_RECOVERY_V20_5_3 loaded');
})();