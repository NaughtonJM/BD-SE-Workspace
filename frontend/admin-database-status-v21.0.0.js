/* ADMIN_DATABASE_STATUS_UI_V21_0_0 */
(function(){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const style=document.createElement('style');style.textContent=`.db-admin{margin-top:16px;border-left:5px solid #20b7af}.db-path{font-family:monospace;word-break:break-all;background:#180825;border:1px solid var(--line);padding:10px;border-radius:8px}.db-state{font-weight:700;margin:10px 0}.db-counts{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}`;document.head.appendChild(style);
async function call(url,options){const r=await fetch(url,options);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);return d}
async function render(){
 const admin=document.getElementById('admin');if(!admin)return;let p=document.getElementById('dbAdminV210');if(!p){p=document.createElement('section');p.id='dbAdminV210';p.className='panel db-admin';admin.appendChild(p)}
 p.innerHTML='<h2>Portable Database</h2><div id="dbContent">Loading database status...</div>';
 const content=p.querySelector('#dbContent');
 try{const d=await call('/api/admin/database-status');content.innerHTML=`<div class="db-state">${d.initialized?'Connected and initialized':'Database initialization required'}</div><div class="db-path">${esc(d.databasePath)}</div><p class="muted">Repository root: ${esc(d.portableRoot)}</p><div class="db-counts">${Object.entries(d.counts||{}).map(([k,v])=>`<span class="pill">${esc(k)}: ${v}</span>`).join('')}</div>${d.initialized?'':`<button id="dbInitialize" class="primary">Initialize Database</button>`}`;const b=p.querySelector('#dbInitialize');if(b)b.onclick=async()=>{b.disabled=true;b.textContent='Initializing...';try{await call('/api/admin/database-initialize',{method:'POST'});await render()}catch(e){content.textContent=e.message}}}catch(e){content.textContent=e.message}
}
const previous=window.route;window.route=function(id){const r=previous.apply(this,arguments);if(id==='admin')setTimeout(render,0);return r};
console.log('ADMIN_DATABASE_STATUS_UI_V21_0_0 loaded');
})();