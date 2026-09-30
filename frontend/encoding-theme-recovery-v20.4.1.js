/* ENCODING_THEME_RECOVERY_V20_4_1 */
(function(){
'use strict';
const VERSION='20.4.1';

const style=document.createElement('style');
style.id='encoding-theme-recovery-v20-4-1-style';
style.textContent=`
:root{
 --v203-bg:#1b0a2b!important;
 --v203-card:#241035!important;
 --v203-card2:#2c153f!important;
 --v203-line:#654184!important;
 --v203-text:#f8f2fc!important;
 --v203-muted:#d8cbe2!important;
 --v203-gold:#fcaf1a!important;
 --v203-link:#73d7ff!important
}
.v203-history{background:#1b0a2b!important;border-color:#654184!important}
.v203-head{background:#32134a!important;border-color:#fcaf1a!important}
.v203-row,.v203-row:nth-child(even){background:#241035!important;border-color:#654184!important}
.v203-row:nth-child(odd){background:#1e0c30!important}
.v203-actions .pill{background:#32134a!important;color:#e7ddeb!important}
.v203-card,.v203-section,.v203-pipeline{background:#241035!important;border-color:#654184!important;color:#f8f2fc!important}
.v203-card .v203-card,.v203-detail{background:#1b0a2b!important}
.v203-confidence{background:#32134a!important;border-color:#76538d!important}
.v203-source{color:#73d7ff!important}
.v2031-hero,.v204-hero{background:linear-gradient(135deg,#2b0b43,#151020)!important;border-color:#654184!important}
.v2031-card,.v204-card{background:#241035!important;border-color:#654184!important;color:#f8f2fc!important}
.v2031-card p,.v2031-card li,.v204-card p,.v204-card li{color:#f8f2fc!important}
.v2031-table th,.v2031-table td,.v204-table th,.v204-table td{border-color:#654184!important}
.v2031-tag,.v204-status{background:#32134a!important;border-color:#76538d!important}
.v2031-opener,.v204-opener{background:#160821!important}
.v204-recommendation{border-left-color:#20b7af!important;background:linear-gradient(145deg,#241035,#182d34)!important}
.v204-recommendation-grid{display:grid;grid-template-columns:180px minmax(0,1fr);gap:14px;align-items:start}
.v204-recommendation-score{font-size:38px;font-weight:900;color:#fcaf1a}
.v204-recommendation-label{display:inline-block;border:1px solid #20b7af;border-radius:999px;padding:5px 11px;background:#16393b;color:#fff;font-weight:800}
.v204-recommendation p{margin:5px 0 10px!important}
.v2041-sequence{background:#1b0a2b;border:1px solid #654184;border-left:5px solid #20b7af;border-radius:10px;padding:13px 16px;margin:10px 0;color:#f8f2fc}
.v2041-sequence strong{color:#fff!important}.v2041-sequence ol{margin:9px 0 0 22px;padding:0}.v2041-sequence li{margin:5px 0;color:#f8f2fc!important}
@media(max-width:760px){.v204-recommendation-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

const exactSequence=[
 'Outcome',
 'Workload and access',
 'Testing perspective',
 'Depth and timing',
 'Deployment boundary',
 'Governance',
 'Primary, complementary, alternative, and excluded solutions'
];

function repairText(value){
 let s=String(value??'');
 if(!s)return s;
 s=s
  .replace(/ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚\s*ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢/g,' -> ')
  .replace(/ÃƒÂ¢Ã¢â‚¬\s*Ã¢â‚¬â„¢|ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢|Ã¢â€ â€™|ÃƒÂ¢Ã¢â‚¬ Ã¢â‚¬â„¢/g,' -> ')
  .replace(/Ãƒâ€šÃ‚Â·|Ã‚Â·|ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â·/g,' â€¢ ')
  .replace(/ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¢|ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¡|ÃƒÂ°Ã…Â¸Ã¢â‚¬Ã‚Â´|ÃƒÂ¢Ã…Â¡Ã‚Âª/g,'')
  .replace(/ÃƒÆ’Ã†â€™|Ãƒâ€ Ã¢â‚¬â„¢|ÃƒÆ’Ã¢â‚¬Å¡|Ãƒâ€šÃ‚|ÃƒÆ’Ã‚Â¢|ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡|ÃƒÆ’Ã‚Â¢|ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾/g,'')
  .replace(/\s{2,}/g,' ');
 return s;
}

function replaceSequenceElement(el){
 const raw=repairText(el.textContent||'');
 if(!/^Sequence\s*:/i.test(raw))return false;
 const normalized=raw.toLowerCase();
 if(!normalized.includes('outcome')||!normalized.includes('workload')||!normalized.includes('governance'))return false;
 const box=document.createElement('div');
 box.className='v2041-sequence';
 box.innerHTML='<strong>Sequence</strong><ol>'+exactSequence.map(item=>'<li>'+item+'</li>').join('')+'</ol>';
 el.replaceWith(box);
 return true;
}

function repairRoot(root){
 if(!root||root.nodeType!==1)return;
 const candidates=[root,...root.querySelectorAll('p,div,span,strong,li')];
 for(const el of candidates){
  if(!el.isConnected)continue;
  if(el.children.length===0&&replaceSequenceElement(el))continue;
  if(el.children.length===0){
   const fixed=repairText(el.textContent);
   if(fixed!==el.textContent)el.textContent=fixed;
  }
 }
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{if(node.parentElement&&node.parentElement.closest('script,style'))return;const fixed=repairText(node.nodeValue);if(fixed!==node.nodeValue)node.nodeValue=fixed});
}

function recommendation(strategy){
 const score=Number(strategy&&strategy.readiness&&strategy.readiness.score)||0;
 const gaps=Array.isArray(strategy&&strategy.evidence_gaps)?strategy.evidence_gaps:[];
 const actions=Array.isArray(strategy&&strategy.recommended_actions)?strategy.recommended_actions:[];
 let decision='Hold and validate';
 if(score>=80)decision='Pursue';
 else if(score>=60)decision='Pursue conditionally';
 const reason=score>=80
  ? 'The available evidence is sufficient for an executive pursuit motion, while remaining gaps should be managed explicitly.'
  : score>=60
   ? 'The opportunity shows credible mission and partner alignment, but material qualification gaps remain.'
   : 'The current evidence does not yet support an executive commitment. Resolve the core qualification gaps first.';
 const next=actions[0]&&actions[0].action?actions[0].action:(gaps[0]?('Validate '+gaps[0]+'.'):'Agree a named owner, evidence artifact, and dated customer action.');
 return{score,decision,reason,next};
}

function injectRecommendation(strategy){
 const wrap=document.querySelector('#boardbriefView .v204-wrap');
 if(!wrap||wrap.querySelector('.v204-recommendation'))return;
 const r=recommendation(strategy);
 const section=document.createElement('section');
 section.className='v204-card v204-recommendation';
 section.innerHTML='<h2>Executive Recommendation</h2><div class="v204-recommendation-grid"><div><div class="v204-recommendation-score">'+r.score+'%</div><span class="v204-recommendation-label">'+r.decision+'</span></div><div><h3>Rationale</h3><p>'+r.reason+'</p><h3>Next action</h3><p>'+r.next+'</p></div></div>';
 const hero=wrap.querySelector('.v204-hero');
 if(hero&&hero.nextSibling)wrap.insertBefore(section,hero.nextSibling);else wrap.appendChild(section);
}

const previousBoard=window.openBoardBriefV204;
if(typeof previousBoard==='function'){
 window.openBoardBriefV204=async function(id){
  await previousBoard.call(this,id);
  try{
   const response=await fetch('/api/executive-strategy-v20/'+encodeURIComponent(id));
   const strategy=await response.json();
   if(response.ok)injectRecommendation(strategy);
  }catch(error){console.warn('V20.4.1 recommendation unavailable',error)}
  const view=document.getElementById('boardbriefView');if(view)repairRoot(view);
 };
}

let scheduled=false;
function scheduleRepair(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;repairRoot(document.body)});
}
new MutationObserver(scheduleRepair).observe(document.body,{childList:true,subtree:true,characterData:true});
scheduleRepair();
console.log('ENCODING_THEME_RECOVERY_V20_4_1 loaded');
})();