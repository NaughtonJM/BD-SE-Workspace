/* CONTENT_PRESENTATION_ENGINE_V20_3_0 */
(function(){
'use strict';
const VERSION='20.3.0';
const E=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const L=k=>typeof v18Label==='function'?v18Label(k):String(k||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
const has=v=>v!=null&&v!==''&&!(Array.isArray(v)&&!v.length);
const plain=v=>{
 if(v==null)return'';
 if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return String(v);
 if(Array.isArray(v))return v.map(plain).filter(Boolean).join('; ');
 return Object.values(v).map(plain).filter(Boolean).join('; ');
};
const safeUrl=v=>{try{const u=new URL(String(v));return /^https?:$/.test(u.protocol)?u.href:''}catch{return''}};
const link=v=>{const u=safeUrl(v);return u?`<a class="v203-source" href="${E(u)}" target="_blank" rel="noopener noreferrer">ðŸ”— View source</a>`:E(plain(v))};
const statusIcon=v=>{const s=String(v||'Unverified');if(/high|verified fact|confirmed/i.test(s))return'ðŸŸ¢';if(/medium|partial|hypothesis/i.test(s))return'ðŸŸ¡';if(/low|risk/i.test(s))return'ðŸ”´';return'âšª'};
const genericResearch=v=>String(v??'').replace(/\bGDIT\b/gi,'Partner Research').replace(/\bBoeing\b/gi,'Client Research');
const style=document.createElement('style');style.id='content-presentation-v20-3-0-style';style.textContent=`
:root{--v203-bg:#6b4a86;--v203-card:#795894;--v203-card2:#6f4f8a;--v203-line:#b59ac9;--v203-text:#fff;--v203-muted:#f0e8f5;--v203-gold:#ffd166;--v203-link:#b9efff}
#historyView{overflow-x:auto}.v203-history{min-width:1160px;border:1px solid var(--v203-line);border-radius:13px;overflow:hidden;background:var(--v203-bg)}
.v203-head,.v203-row{display:grid;grid-template-columns:minmax(210px,1.25fr) 175px minmax(690px,3.7fr);gap:12px;align-items:center;padding:9px 12px}
.v203-head{background:#5d3878;border-bottom:2px solid var(--v203-gold);font-size:11pt;font-weight:850;color:#fff}.v203-row{height:72px;min-height:72px;max-height:72px;border-top:1px solid var(--v203-line);background:var(--v203-card)}.v203-row:nth-child(even){background:var(--v203-card2)}
.v203-meeting{min-width:0}.v203-meeting strong{display:block;color:#fff;font-size:12.5pt;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v203-meeting span{display:block;color:var(--v203-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v203-date{font-size:10.5pt;color:#fff;white-space:nowrap}.v203-date small{display:block;color:var(--v203-muted)}
.v203-actions{display:flex;align-items:center;gap:5px;flex-wrap:nowrap;min-width:0}.v203-actions button,.v203-actions .pill{flex:0 0 auto;width:auto!important;min-width:0!important;min-height:30px!important;height:30px!important;padding:3px 8px!important;margin:0!important;font-size:10.5pt!important;line-height:1.05!important;white-space:nowrap!important;border-radius:6px!important}.v203-actions .pill{display:inline-flex;align-items:center;background:#67447f;color:#eee;opacity:.75}
.v203-section{background:var(--v203-bg)!important;border:1px solid var(--v203-line)!important;border-left:5px solid var(--v203-gold)!important;color:var(--v203-text)!important}.v203-card{background:linear-gradient(145deg,var(--v203-card),var(--v203-card2));border:1px solid var(--v203-line);border-left:5px solid var(--v203-gold);border-radius:14px;padding:19px;margin:13px 0;color:var(--v203-text);box-shadow:0 6px 18px rgba(20,5,32,.18)}
.v203-card h3{margin:0 0 9px!important;color:#fff!important}.v203-card p{margin:0 0 10px!important;color:#fff!important;line-height:1.62}.v203-card ul{margin:7px 0 12px 22px}.v203-card li{color:#fff!important;margin:4px 0}.v203-meta{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.25)}.v203-confidence{display:inline-flex;align-items:center;gap:5px;background:#583971;border:1px solid var(--v203-line);border-radius:999px;padding:4px 9px;color:#fff;font-weight:750}.v203-source{color:var(--v203-link)!important;text-decoration:underline!important;font-weight:750;overflow-wrap:anywhere}.v203-detail{background:rgba(35,14,51,.22);border-radius:9px;padding:10px 12px;margin:8px 0}.v203-detail b{color:var(--v203-gold)!important}.v203-pipeline strong,.v203-pipeline p{color:#fff!important}.v203-pipeline{background:var(--v203-card)!important;border-color:var(--v203-line)!important}
#researchreport .v18-box,#meetingplan .v18-box,#executivestrategy .v202-card{background:var(--v203-bg)!important;border-color:var(--v203-line)!important;color:#fff!important}#researchreport .v18-box p,#meetingplan .v18-box p{color:#fff!important}#researchreport a,#meetingplan a{color:var(--v203-link)!important}
@media(max-width:820px){.v203-history{min-width:1040px}.v203-actions button,.v203-actions .pill{padding:3px 6px!important;font-size:10pt!important}}
`;document.head.appendChild(style);

const titleKeys=new Set(['title','headline','name','theme','factor','pillar','element','stakeholder','capability','dimension','action','development']);
const confidenceKeys=new Set(['confidence','classification','verification_status','status']);
const urlKeys=new Set(['source_url','url']);
const listWords={questions:'Questions',gaps:'Gaps',pillars:'Pillars',missions:'Missions',affected_markets:'Affected markets'};
function sentence(k,v){
 const raw=plain(v).replace(/\s+/g,' ').trim();if(!raw)return'';const low=String(k).toLowerCase();
 const direct=new Set(['description','analysis','assessment','significance','effect','scope','problem','opening','recommendation','response','approach','verified_fact_or_context','evidence','exact_quote','differentiation_or_complementarity']);
 if(direct.has(low))return raw;
 const map={why_it_matters:'This matters because',black_duck_opening:"Black Duck's opening is",black_duck_contribution:'Black Duck contributes',customer_outcome:'The intended customer outcome is',partner_or_client_value:'The partner or client value is',commercial_or_mission_impact:'The commercial or mission impact is',joint_action:'The recommended joint action is',success_measure:'Success is measured by',success_criterion:'Success is measured by',success_measures:'Success is measured by',next_step:'The next step is',first_action:'The first action is',owner:'The proposed owner is',timing:'The expected timing is',period:'The expected period is',black_duck_response:'Black Duck should respond by',subject_benefit:'The partner benefit is',black_duck_benefit:'The Black Duck benefit is',mutual_business_case:'The mutual business case is'};
 if(map[low])return`${map[low]} ${raw.charAt(0).toLowerCase()+raw.slice(1)}`;
 return`${L(k)}: ${raw}`;
}
function itemTitle(o,i){return [...titleKeys].map(k=>o[k]).find(has)||`Item ${i+1}`}
function nestedBlock(k,v){
 if(Array.isArray(v)){
  if(v.every(x=>typeof x!=='object'))return`<div class="v203-detail"><b>${E(listWords[k]||L(k))}:</b><ul>${v.map(x=>`<li>${E(plain(x))}</li>`).join('')}</ul></div>`;
  return`<div class="v203-detail"><b>${E(L(k))}</b>${v.map((x,i)=>proseCard(x,i,true)).join('')}</div>`;
 }
 if(v&&typeof v==='object')return`<div class="v203-detail"><b>${E(L(k))}</b>${Object.entries(v).filter(([,x])=>has(x)).map(([a,x])=>typeof x==='object'?nestedBlock(a,x):`<p>${E(sentence(a,x))}${/[.!?]$/.test(sentence(a,x))?'':'.'}</p>`).join('')}</div>`;
 return'';
}
function proseCard(o,i,compact=false){
 if(typeof o!=='object'||o==null)return`<article class="v203-card"><p>${E(plain(o))}</p></article>`;
 const conf=[...confidenceKeys].map(k=>o[k]).find(has);const urls=Object.entries(o).filter(([k,v])=>urlKeys.has(k)&&safeUrl(v));
 const body=[];
 for(const[k,v]of Object.entries(o)){
  if(titleKeys.has(k)||confidenceKeys.has(k)||urlKeys.has(k)||!has(v))continue;
  if(typeof v==='object')body.push(nestedBlock(k,v));else{const s=sentence(k,v);body.push(`<p>${E(s)}${/[.!?]$/.test(s)?'':'.'}</p>`)}
 }
 return`<article class="v203-card${compact?' v203-compact':''}"><h3>${E(itemTitle(o,i))}</h3>${body.join('')||'<p>No narrative details were supplied.</p>'}<div class="v203-meta">${conf?`<span class="v203-confidence">${statusIcon(conf)} ${E(conf)}</span>`:''}${urls.map(([,u])=>link(u)).join(' ')}</div></article>`;
}
window.v18ProseItem=proseCard;

window.v18Pipeline=async function(id){
 const r=await v18Timeout('/api/meeting-plan-v7/'+id+'/pipeline'),p=await r.json();if(!r.ok)throw Error(p.error||'Pipeline failed');
 return`<div class="v18-box v203-section"><h2>Pipeline Evidence</h2><p>${E(genericResearch(p.design_decision||''))}</p>${(p.stages||[]).map(s=>`<div class="v18-pipeline v203-pipeline"><div class="v18-num">${E(s.number)}</div><div><strong>${E(genericResearch(s.name||'Pipeline stage'))}</strong><p>${E(genericResearch(s.framework||''))}</p></div><div><strong>Inputs and Processing</strong><p>${E(genericResearch((s.inputs||[]).join(' | ')))}</p><p>${E(genericResearch(s.processing||''))}</p></div><div><strong>Output</strong><p>${E(genericResearch(s.output||''))}</p><p>${s.captured?'Audit captured':'Historical record not fully audited'}</p></div></div>`).join('')}</div>`;
};

window.loadCallPrepHistory=async function(){
 historyView.innerHTML='<p>Loading...</p>';
 try{
  const r=await v18Timeout('/api/call-report-v4',{},10000),rows=await r.json();if(!r.ok)throw Error(rows.error||'History failed');
  historyView.innerHTML=`<div class="v203-history"><div class="v203-head"><div>Meeting</div><div>Created</div><div>Actions</div></div>${rows.map(x=>`<article class="v203-row record"><div class="v203-meeting"><strong>${E(x.partner_name||'Partner')}</strong><span>${E(x.account_name||'')}</span></div><div class="v203-date">${E(x.created_date||'')}<small>${E(x.model||'')}</small></div><div class="v203-actions"><button onclick="openMeetingPlan(${x.id})">Plan</button><button class="primary" onclick="openMeetingExecution(${x.id})">Execute</button><button onclick="openResearchReport(${x.id})">Research</button><button class="v20-open" onclick="openExecutiveStrategyV20(${x.id})">Executive</button>${x.account_plan_url?`<button onclick="openHistoryPreview(${x.id},'plan')">Account</button>`:'<span class="pill">No Account</span>'}${x.strategy_brief_url?`<button onclick="openHistoryPreview(${x.id},'brief')">Brief</button>`:'<span class="pill">No Brief</span>'}<button class="danger" onclick="deleteV18(${x.id})">Delete</button></div></article>`).join('')}</div>`;
 }catch(e){historyView.innerHTML=`<div class="v18-error"><h3>History failed</h3><p>${E(e.message)}</p><button onclick="loadCallPrepHistory()">Retry</button></div>`}
};
console.log('CONTENT_PRESENTATION_ENGINE_V20_3_0 loaded');
})();