/* BOARDROOM_BRIEFING_ENGINE_V20_4_0 */
(function(){
'use strict';
const VERSION='20.4.0';
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const A=v=>Array.isArray(v)?v:[];
const clean=v=>String(v??'').replace(/Ãƒâ€šÃ‚Â·|Ã‚Â·/g,' â€¢ ').replace(/\s+/g,' ').trim();
const pick=(...v)=>v.map(clean).find(Boolean)||'';
const arr=v=>Array.isArray(v)?v:[];
const confidence=(value,status)=>{
 const s=String(status||value||'').toLowerCase();
 if(/validated|confirmed|high|executive-ready/.test(s))return{icon:'&#x1F7E2;',label:'Validated'};
 if(/partial|medium|developing|hypothesis/.test(s))return{icon:'&#x1F7E1;',label:'Developing'};
 if(/unknown|gap|low|block/.test(s))return{icon:'&#x1F534;',label:'Gap'};
 return{icon:'&#x26AA;',label:'Unverified'};
};
const css=document.createElement('style');css.id='boardroom-v20-4-0-style';css.textContent=`
.v204-wrap{max-width:1280px;margin:auto;color:#fff}.v204-hero{background:linear-gradient(135deg,#5f3d7a,#7b5a95);border:1px solid #c3acd4;border-radius:16px;padding:24px;margin-bottom:16px}.v204-hero h1{margin:8px 0 4px;color:#fff}.v204-toolbar{display:flex;gap:8px;flex-wrap:wrap}.v204-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.v204-card{background:#76558f;border:1px solid #c3acd4;border-left:5px solid #ffd166;border-radius:14px;padding:20px;margin-bottom:15px;color:#fff}.v204-card h2{color:#fff;margin:0 0 12px}.v204-card h3{color:#ffe39a}.v204-card p,.v204-card li{color:#fff;line-height:1.62}.v204-card ul,.v204-card ol{padding-left:23px}.v204-score{font-size:44px;font-weight:900;color:#ffd166}.v204-status{display:inline-flex;align-items:center;gap:6px;background:#5b3b72;border:1px solid #c3acd4;border-radius:999px;padding:5px 10px;margin:3px;color:#fff}.v204-opener{background:rgba(34,15,49,.25);border-left:4px solid #8ff0e8;padding:13px;border-radius:8px}.v204-table{width:100%;border-collapse:collapse}.v204-table th,.v204-table td{position:static!important;border:1px solid #c3acd4;padding:9px;text-align:left;vertical-align:top;color:#fff}.v204-empty{color:#f1e9f6}.v204-actions button{min-height:32px;padding:5px 10px}.v203-actions .v204-board{background:#167b75!important;border-color:#8ff0e8!important;color:#fff!important}.v204-print-only{display:none}@media(max-width:900px){.v204-grid{grid-template-columns:1fr}}@media print{nav,.sidebar,.v204-toolbar,.v203-history{display:none!important}.v204-wrap{max-width:none}.v204-card,.v204-hero{break-inside:avoid;background:#fff!important;color:#111!important;border-color:#777!important}.v204-card *,.v204-hero *{color:#111!important}.v204-print-only{display:block}}
`;document.head.appendChild(css);

const section=(title,body,cls='')=>`<section class="v204-card ${cls}"><h2>${E(title)}</h2>${body}</section>`;
const paras=v=>clean(v).split(/\n\s*\n/).filter(Boolean).map(x=>`<p>${E(x)}</p>`).join('')||'<p class="v204-empty">Not yet evidenced.</p>';
const bullets=(values,render=v=>E(clean(v)))=>{
 const list=arr(values).filter(Boolean);return list.length?`<ul>${list.map(v=>`<li>${render(v)}</li>`).join('')}</ul>`:'<p class="v204-empty">No evidence captured.</p>';
};
const actionList=values=>{
 const list=arr(values).filter(x=>x&&x.action);return list.length?`<ol>${list.map(x=>`<li><strong>${E(clean(x.action))}</strong><br>Owner: ${E(clean(x.owner||'Unassigned'))}; Timing: ${E(clean(x.timing||'Unspecified'))}${x.measure?`<br>Success: ${E(clean(x.measure))}`:''}</li>`).join('')}</ol>`:'<p class="v204-empty">No actions captured.</p>';
};
const stakeholderTable=values=>{
 const list=arr(values);if(!list.length)return'<p class="v204-empty">No stakeholder evidence captured.</p>';
 return`<table class="v204-table"><thead><tr><th>Stakeholder</th><th>Role</th><th>Influence</th><th>Next move</th></tr></thead><tbody>${list.map(x=>`<tr><td>${E(clean(x.name))}</td><td>${E(clean(x.role))}</td><td>${E(clean(x.influence))}</td><td>${E(clean(x.next))}</td></tr>`).join('')}</tbody></table>`;
};
const qualification=(strategy,record)=>{
 const gaps=arr(strategy.evidence_gaps).join(' ').toLowerCase();
 const prepared=record&&record.prepared_call||{};
 const items=[
  ['Metrics',!gaps.includes('metric')&&(prepared.metrics||strategy.readiness&&strategy.readiness.score>=75),'Metrics still require a quantified baseline and target.'],
  ['Economic Buyer',!gaps.includes('economic buyer')&&prepared.economic_buyer,'A named funding authority is still required.'],
  ['Decision Criteria',!gaps.includes('decision criteria')&&prepared.decision_criteria,'Criteria require force-ranking and ownership.'],
  ['Decision Process',!gaps.includes('decision process')&&prepared.decision_process,'Approvers, veto holders, artifacts, and dates are required.'],
  ['Paper Process',!gaps.includes('procurement')&&!gaps.includes('paper process'),'The vehicle, holder, scope, and ordering path require confirmation.'],
  ['Pain',!!strategy.consequence_of_failure,'The consequence of inaction requires customer validation.'],
  ['Champion',!gaps.includes('champion')&&prepared.champion,'Champion strength requires observable action and access.'],
  ['Competition',!gaps.includes('competition')&&prepared.competition,'The incumbent and selection context require validation.']
 ];
 return`<div>${items.map(([name,ok,note])=>{const c=confidence(ok,ok?'validated':'gap');return`<div class="v204-status">${c.icon} <strong>${E(name)}</strong>: ${ok?'Validated':E(note)}</div>`}).join('')}</div>`;
};

async function fetchJson(url){const r=await fetch(url);const x=await r.json();if(!r.ok)throw Error(x.error||`Request failed: ${url}`);return x}
function ensureView(){
 let view=document.getElementById('boardbrief');
 if(!view){const main=document.querySelector('main.main')||document.querySelector('main');view=document.createElement('section');view.id='boardbrief';view.className='view';view.innerHTML='<div id="boardbriefView"></div>';main.appendChild(view)}
 return view;
}
window.openBoardBriefV204=async function(id){
 ensureView();window.__v204id=id;if(typeof route==='function')route('boardbrief');else document.getElementById('boardbrief').style.display='block';
 const out=document.getElementById('boardbriefView');out.innerHTML=section('Boardroom Brief','<p>Building executive decision brief...</p>');
 try{
  const [strategy,record]=await Promise.all([fetchJson('/api/executive-strategy-v20/'+encodeURIComponent(id)),fetchJson('/api/meeting-records/'+encodeURIComponent(id))]);
  const account=pick(strategy.account,record.account_name);const partner=pick(strategy.partner,record.partner_name);
  const ci=record.prepared_call&&record.prepared_call.conversation_intelligence||{};
  const themes=arr(strategy.themes);const risks=arr(strategy.challenges);const opportunities=arr(strategy.opportunities);
  out.innerHTML=`<div class="v204-wrap"><div class="v204-hero"><div class="v204-toolbar"><button onclick="route('history')">Back to History</button><button onclick="window.print()">Print Brief</button><button id="v204Refresh">Regenerate</button></div><h1>${E(partner||'Partner')} + ${E(account||'Account')} Boardroom Brief</h1><p>Decision intelligence generated from stored research, meeting evidence, qualification, and executive strategy.</p><span class="v204-status">Stage ${E(clean(strategy.stage||'Unspecified'))}</span><span class="v204-status">V${VERSION}</span></div>
  ${section('Executive Summary',paras(strategy.executive_summary))}
  <div class="v204-grid">${section('Why This Matters',paras(strategy.why_now))}${section('Executive Confidence',`<div class="v204-score">${E(strategy.readiness&&strategy.readiness.score||0)}%</div><p>${E(clean(strategy.readiness&&strategy.readiness.status||'Not assessed'))}</p>`)}</div>
  ${section('Mission Outcome and Consequence',`<h3>Mission outcome</h3>${paras(strategy.mission_outcome)}<h3>Consequence if ignored</h3>${paras(strategy.consequence_of_failure)}`)}
  ${section('Executive Opener',`<div class="v204-opener"><p><strong>Data:</strong> ${E(clean(strategy.executive_opener&&strategy.executive_opener.data))}</p><p><strong>Insight:</strong> ${E(clean(strategy.executive_opener&&strategy.executive_opener.insight))}</p><p><strong>Question:</strong> ${E(clean(strategy.executive_opener&&strategy.executive_opener.question))}</p></div>`)}
  ${section('Qualification Status',qualification(strategy,record))}
  <div class="v204-grid">${section('What We Learned',bullets(themes,x=>`<strong>${E(clean(x.headline))}</strong><br>${E(clean(x.why))}`))}${section('Strategic Risks',bullets(risks,x=>`<strong>${E(clean(x.title))}</strong><br>${E(clean(x.description))}`))}</div>
  ${section('Stakeholder and Influence Strategy',stakeholderTable(strategy.stakeholder_map))}
  <div class="v204-grid">${section('Lighthouse Opportunity',paras(strategy.lighthouse))}${section('Opportunity Portfolio',bullets(opportunities,x=>`<strong>${E(clean(x.name))}</strong><br>${E(clean(x.entry))}<br>${E(clean(x.status))}`))}</div>
  ${section('Conversation Signals',bullets([...(arr(ci.themes)),...(arr(ci.capability_areas)),...(arr(ci.discovery_paths))]))}
  ${section('Recommended 30-Day Actions',actionList(strategy.recommended_actions))}
  <div class="v204-grid">${section('Evidence Gaps',bullets(strategy.evidence_gaps))}${section('Unresolved Questions',bullets(strategy.unresolved_questions))}</div>
  <p class="v204-print-only">Generated by Black Duck Sales Engineer Workspace V20.4.0.</p></div>`;
  document.getElementById('v204Refresh').onclick=()=>window.openBoardBriefV204(id);
 }catch(e){out.innerHTML=section('Boardroom Brief unavailable',`<p>${E(e.message)}</p>`)}
};

const priorLoad=window.loadCallPrepHistory;
window.loadCallPrepHistory=async function(){
 if(typeof priorLoad==='function')await priorLoad.apply(this,arguments);
 const root=document.getElementById('historyView')||document;
 root.querySelectorAll('.v203-row.record').forEach(row=>{
  const actions=row.querySelector('.v203-actions');if(!actions||actions.querySelector('.v204-board'))return;
  const button=[...actions.querySelectorAll('button')].find(b=>/openMeetingPlan\((\d+)\)/.test(b.getAttribute('onclick')||''));
  const match=(button&&button.getAttribute('onclick')||'').match(/openMeetingPlan\((\d+)\)/);if(!match)return;
  const board=document.createElement('button');board.className='v204-board';board.textContent='Board';board.onclick=()=>window.openBoardBriefV204(Number(match[1]));
  const executive=[...actions.children].find(x=>/Executive/i.test(x.textContent||''));if(executive&&executive.nextSibling)actions.insertBefore(board,executive.nextSibling);else actions.appendChild(board);
 });
};
ensureView();
const observer=new MutationObserver(()=>{const root=document.getElementById('historyView');if(!root)return;root.querySelectorAll('.v203-row.record').forEach(row=>{const actions=row.querySelector('.v203-actions');if(!actions||actions.querySelector('.v204-board'))return;const b=[...actions.querySelectorAll('button')].find(x=>/openMeetingPlan\((\d+)\)/.test(x.getAttribute('onclick')||''));const m=(b&&b.getAttribute('onclick')||'').match(/openMeetingPlan\((\d+)\)/);if(!m)return;const n=document.createElement('button');n.className='v204-board';n.textContent='Board';n.onclick=()=>window.openBoardBriefV204(Number(m[1]));actions.appendChild(n)})});
observer.observe(document.body,{childList:true,subtree:true});
console.log('BOARDROOM_BRIEFING_ENGINE_V20_4_0 loaded');
})();