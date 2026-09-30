/* HIGHSPOT_PRODUCT_VIDEO_AUTOLOADER_V20_5_0 */
(function(){
'use strict';
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=document.createElement('style');css.textContent=`
.v205-tools{display:grid;grid-template-columns:1.4fr 1fr auto;gap:10px;align-items:end;margin-bottom:14px}.v205-summary{color:var(--muted);margin:8px 0}.v205-group{border:1px solid var(--line);border-left:5px solid var(--gold);border-radius:11px;padding:15px;background:#210d34;margin:12px 0}.v205-group h2{margin-top:0}.v205-video-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v205-video{background:#180825;border:1px solid #654184;border-radius:9px;padding:13px}.v205-video h3{margin:0 0 7px}.v205-video p{color:#eee}.v205-video .btn{margin-left:0}@media(max-width:900px){.v205-tools,.v205-video-grid{grid-template-columns:1fr}}
`;document.head.appendChild(css);
function normalizeProduct(value){return String(value||'General').split(';')[0].trim()||'General'}
function ensureTools(){
 const view=document.getElementById('resourceView');if(!view)return null;
 let tools=document.getElementById('v205ResourceTools');if(tools)return tools;
 tools=document.createElement('div');tools.id='v205ResourceTools';tools.className='panel';tools.innerHTML='<h2>Highspot Product Video Catalog</h2><div class="v205-tools"><div class="field"><label>Search videos</label><input id="v205Search" placeholder="Search title, product, or description"></div><div class="field"><label>Product</label><select id="v205Product"><option value="">All products</option></select></div><button id="v205Refresh">Refresh</button></div><div id="v205Summary" class="v205-summary"></div>';
 view.parentElement.insertBefore(tools,view);tools.querySelector('#v205Search').oninput=renderVideoCatalog;tools.querySelector('#v205Product').onchange=renderVideoCatalog;tools.querySelector('#v205Refresh').onclick=()=>window.loadResources();return tools;
}
function card(x){return `<article class="v205-video"><h3>${E(x.title)}</h3><span class="pill">${E(normalizeProduct(x.product))}</span><p>${E(x.description||'Highspot product video')}</p><a class="btn primary" href="${E(x.url)}" target="_blank" rel="noopener noreferrer">Open in Highspot</a><button class="danger" onclick="deleteResource(${Number(x.id)})">Delete</button></article>`}
function renderVideoCatalog(){
 ensureTools();const view=document.getElementById('resourceView');if(!view)return;
 const videos=(window.RESOURCES||RESOURCES||[]).filter(x=>x.category==='Highspot Video');
 const products=[...new Set(videos.map(x=>normalizeProduct(x.product)))].sort();const select=document.getElementById('v205Product');const current=select.value;select.innerHTML='<option value="">All products</option>'+products.map(p=>`<option value="${E(p)}">${E(p)}</option>`).join('');select.value=products.includes(current)?current:'';
 const q=(document.getElementById('v205Search').value||'').toLowerCase(),p=select.value;
 const filtered=videos.filter(x=>(!p||normalizeProduct(x.product)===p)&&JSON.stringify(x).toLowerCase().includes(q));
 document.getElementById('v205Summary').textContent=`Showing ${filtered.length} of ${videos.length} product-specific Highspot videos across ${products.length} products.`;
 const groups=Object.groupBy?Object.groupBy(filtered,x=>normalizeProduct(x.product)):filtered.reduce((a,x)=>((a[normalizeProduct(x.product)]??=[]).push(x),a),{});
 view.innerHTML=Object.entries(groups).sort(([a],[b])=>a.localeCompare(b)).map(([product,items])=>`<section class="v205-group"><h2>${E(product)}</h2><div class="v205-video-grid">${items.map(card).join('')}</div></section>`).join('')||'<div class="empty">No matching product-specific Highspot videos.</div>';
}
const original=window.loadResources;
window.loadResources=async function(render=true){if(typeof original==='function')await original.call(this,false);ensureTools();if(render)renderVideoCatalog();if(typeof renderProducts==='function')renderProducts()};
const originalRoute=window.route;
window.route=function(id){const result=originalRoute.apply(this,arguments);if(id==='resources')setTimeout(renderVideoCatalog,0);return result};
console.log('HIGHSPOT_PRODUCT_VIDEO_AUTOLOADER_V20_5_0 loaded');
})();