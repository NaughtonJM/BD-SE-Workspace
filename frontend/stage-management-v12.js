(function(){
  'use strict';
  const MARKER='MEDDPICC_STAGE_SCORING_V13';
  const DISCOVERY_MARKER='PROJECT_ELEVATE_DISCOVERY_TREE_V14';
  const sm14Style=document.createElement('style');
  sm14Style.textContent=`
    .sm14-context{border-left:4px solid #fcaf1a!important}
    .sm14-context-group{margin-top:12px;padding:12px;border:1px solid #654184;border-radius:9px;background:#180825}
    .sm14-context-group>b{display:block;color:#fcaf1a;margin-bottom:7px}
    .sm14-context-group ul{margin:0;padding-left:22px}
    .sm14-context-group li{margin:7px 0}
  `;
  document.head.appendChild(sm14Style);
  let matrix=null;

  const WEIGHTS={metrics:15,economic_buyer:15,decision_criteria:12,decision_process:12,paper_process:12,identify_pain:15,champion:12,competition:7};
  const TITLES={metrics:'Metrics',economic_buyer:'Economic Buyer',decision_criteria:'Decision Criteria',decision_process:'Decision Process',paper_process:'Paper Process',identify_pain:'Identify Pain',champion:'Champion',competition:'Competition'};
  const LEVELS={unknown:0,hypothesis:.33,partial:.67,validated:.67,evidenced:1,confirmed:1,complete:1};
  const STAGE_THRESHOLDS={0:0,1:15,2:30,3:45,4:60,5:73,6:85,7:95,8:100};
  const STAGE_GATES={
    0:{identify_pain:1},
    1:{identify_pain:1,champion:1},
    2:{identify_pain:2,decision_criteria:1},
    3:{identify_pain:2,metrics:2,champion:2,economic_buyer:1},
    4:{metrics:3,economic_buyer:2,decision_criteria:2,decision_process:2},
    5:{economic_buyer:2,decision_process:2,paper_process:1},
    6:{paper_process:2,decision_process:2,economic_buyer:2},
    7:{paper_process:3,economic_buyer:2},
    8:{}
  };
  const QUESTIONS={
    0:{title:'Prospecting',groups:{'Trigger and Fit':['What changed recently that makes this worth exploring now?','Who requested the conversation, and what outcome is expected?','Who owns the problem today?'],'Initial Qualification':['Is software assurance already funded or prioritized?','What customer, regulatory, or mission event is creating urgency?','What would make a discovery meeting worthwhile?']}},
    1:{title:'Discovery',groups:{'Pain and Consequence':['What is difficult or risky in the current process?','What happens if nothing changes?','Which teams, programs, or missions are affected?'],'Metrics and Stakeholders':['How is success measured today?','Who owns the initiative and who is affected?','What budget, timeline, or compelling event applies?']}},
    2:{title:'Solution Exploration & Demo',groups:{'Current Environment':['How are SCA, SAST, SBOM, binary, runtime, or API risks handled today?','Which repositories, build systems, CI/CD tools, and deployment models are in scope?','What access or compliance constraints must the solution respect?'],'Decision Criteria':['Which capabilities are mandatory?','What must the demo prove?','What alternatives, internal tools, or status quo approaches are being considered?']}},
    3:{title:'POV Planning & Executive Buyer Meeting',groups:{'POV Scope':['Which applications, repositories, binaries, or environments are in scope?','What is explicitly out of scope?','Who owns data access, execution, and issue resolution?'],'Success and Executive Alignment':['What measurable result proves success?','Who is the Economic Buyer, and what outcome matters to that person?','Who signs off on success and what Mutual Success Plan is required?']}},
    4:{title:'POV & Readout',groups:{'Results':['Which success criteria were achieved, missed, or require qualification?','What quantified technical and business value was demonstrated?','What limitations or residual risks remain?'],'Decision':['Who reviews the readout and makes the decision?','What is the next approval step?','What competitive or status quo risk remains?']}},
    5:{title:'Proposal',groups:{'Business Value':['What ROI, risk reduction, compliance, or mission outcome supports the proposal?','Has the Economic Buyer acknowledged the value?','What scope, products, services, and implementation assumptions are final?'],'Commercial Path':['What budget and funding source apply?','What procurement route or contract vehicle will be used?','What reverse timeline leads to signature?']}},
    6:{title:'Contract Redlines',groups:{'Paper Process':['Who owns procurement, legal, security, and signature approval?','Which agreements, redlines, reviews, or approvals remain open?','What is the target signature date?'],'Execution Risk':['What issue could still delay execution?','Who can resolve each open issue?','Is the quote and discount approval complete?']}},
    7:{title:'Sales Won',groups:{'Order and Handoff':['Is the agreement or approved purchase order complete?','Has Order Management validated the order?','Who owns implementation, enablement, and Customer Success handoff?'],'Expansion':['Which adjacent programs, agencies, products, or use cases should be explored next?','What success milestones should trigger expansion?']}},
    8:{title:'Close',groups:{'Final Disposition':['What is the final win or loss reason?','Which competitor, internal approach, or status quo prevailed?','What lessons should be retained for future pursuits?'],'Lifecycle':['For wins, what handoff and expansion actions remain?','For losses, what conditions would justify re-engagement?']} }
  };

  const esc=v=>String(v==null?'':v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  async function api(url,options){const r=await fetch(url,options);const text=await r.text();let body={};try{body=text?JSON.parse(text):{};}catch{body={raw:text};}if(!r.ok)throw new Error(body.error||body.raw||('HTTP '+r.status));return body;}
  async function getMatrix(){if(!matrix)matrix=await api('/api/stage-management-v12/matrix');return matrix;}
  function stagesFor(motion){return motion==='Renewal'?matrix.renewal:matrix.newBusiness;}
  function normalizeStatus(item){const raw=String(item?.status||'Unknown').toLowerCase();if(raw.includes('evidence')||raw.includes('confirm')||raw.includes('complete'))return 3;if(raw.includes('partial')||raw.includes('valid'))return 2;if(raw.includes('hypoth'))return 1;return 0;}
  function maturityName(level){return ['Unknown','Hypothesis','Customer-validated','Evidenced'][level]||'Unknown';}
  function calculate(meddpicc){let score=0;const elements={};Object.keys(WEIGHTS).forEach(k=>{const item=meddpicc?.[k]||{};const level=normalizeStatus(item);const factor=[0,.33,.67,1][level];const points=Math.round(WEIGHTS[k]*factor*100)/100;score+=points;elements[k]={level,status:maturityName(level),weight:WEIGHTS[k],points,known:item.known||'',gaps:item.gaps||[],questions:item.questions||[]};});return {score:Math.round(score),elements};}
  function gateCheck(stageNumber,elements){const gates=STAGE_GATES[stageNumber]||{};const missing=[];Object.entries(gates).forEach(([k,min])=>{if((elements[k]?.level||0)<min)missing.push(TITLES[k]+' requires '+maturityName(min));});return missing;}
  function recommendation(calc,stages){let recommended=stages[0];for(const stage of stages){const threshold=STAGE_THRESHOLDS[stage.number]??0;const missing=gateCheck(stage.number,calc.elements);if(calc.score>=threshold&&!missing.length)recommended=stage;}return recommended;}
  function sm14Text(value){
    if(value==null)return '';
    if(typeof value==='string')return value;
    try{return JSON.stringify(value);}catch{return String(value);}
  }

  function sm14Corpus(report){
    const r=report||{};
    return [
      r.partner_name,
      r.account_name,
      r.input,
      r.partner_research,
      r.client_research,
      r.reconciled_research,
      r.prepared_call,
      r.answers
    ].map(sm14Text).join(' ').toLowerCase();
  }

  function sm14ContextQuestions(report){
    const corpus=sm14Corpus(report);
    const groups=[];
    const add=(title,questions)=>groups.push({title,questions});
    const has=(pattern)=>pattern.test(corpus);

    if(has(/\b(cisa|federal|government|agency|public sector|public-sector)\b/)){
      add('Federal Mission and Software Assurance',[
        'Which federal mission, program, or acquisition is driving this initiative?',
        'How is software assurance evidence collected from internal teams, contractors, and suppliers today?',
        'Which federal requirements or agency policies must the solution demonstrate compliance with?',
        'Which contract vehicle, reseller, partner, or procurement path is expected?'
      ]);
    }

    if(has(/\b(sbom|software bill of materials|open source|sca|software composition)\b/)){
      add('SBOM and Open Source Governance',[
        'How are SBOMs generated, validated, stored, and delivered today?',
        'How quickly can the organization identify every application affected by a newly disclosed open-source vulnerability?',
        'How are license, operational, and component-origin risks governed across applications?',
        'What SBOM format, quality threshold, and delivery evidence are required?'
      ]);
    }

    if(has(/\b(eo 14028|executive order 14028|nist sp 800-218|ssdf|secure software development framework)\b/)){
      add('Federal Secure Development Requirements',[
        'How are EO 14028 and NIST SP 800-218 requirements translated into operational controls?',
        'What evidence is required to prove secure software development practices?',
        'Where are attestation, reporting, or audit gaps creating delivery risk?',
        'Who accepts or rejects the compliance evidence?'
      ]);
    }

    if(has(/\b(cloud|container|kubernetes|docker|aws|azure|gcp)\b/)){
      add('Cloud and Container Environment',[
        'Which cloud platforms, container registries, orchestration platforms, and deployment environments are in scope?',
        'Where must scanning run, and what network or data-boundary restrictions apply?',
        'How are container images and cloud-native dependencies assessed before deployment?',
        'Which teams own remediation and policy enforcement in the delivery pipeline?'
      ]);
    }

    if(has(/\b(binary|firmware|third-party software|third party software|vendor software|supplier software|bdba)\b/)){
      add('Binary and Third-Party Software',[
        'How is software assessed when source code is unavailable?',
        'What evidence must suppliers or vendors provide before software is accepted?',
        'How are binaries, firmware, containers, and acquired applications monitored after acceptance?',
        'What is the disposition process when an unacceptable component or vulnerability is found?'
      ]);
    }

    if(has(/\b(ai-assisted|ai generated|ai-generated|copilot|large language model|llm|generative ai|genai)\b/)){
      add('AI-Assisted Development',[
        'Which AI coding assistants or generative-development tools are in use?',
        'How is AI-generated code reviewed for security, provenance, and open-source risk?',
        'What policy governs developer use of AI-generated code and dependencies?',
        'How will the organization measure whether AI-assisted development increases or reduces software risk?'
      ]);
    }

    if(has(/\b(air[- ]?gap|classified|enclave|offline|disconnected|data sovereignty|on-prem|on premises)\b/)){
      add('Deployment Boundary and Access',[
        'What deployment boundary, connectivity model, and data-handling restrictions must be supported?',
        'Is the environment connected, restricted, disconnected, or air-gapped?',
        'How will signatures, rule updates, licenses, and scan results move across the boundary?',
        'Which security and operations teams must approve the deployment pattern?'
      ]);
    }

    return groups;
  }

  function sm14RenderContextQuestions(report){
    const groups=sm14ContextQuestions(report);
    if(!groups.length)return '';
    return `<div class="sm13-qgroup sm14-context"><strong>Account and Strategy Context Questions</strong>${groups.map(group=>`<div class="sm14-context-group"><b>${esc(group.title)}</b><ul>${group.questions.map(question=>`<li>${esc(question)}</li>`).join('')}</ul></div>`).join('')}</div>`;
  }
  function questionTree(stageNumber,calc,report){const tree=QUESTIONS[stageNumber]||QUESTIONS[0];const gapQuestions=[];Object.entries(calc.elements).forEach(([k,v])=>{if(v.level<2){(v.questions||[]).forEach(q=>gapQuestions.push({element:TITLES[k],question:q}));(v.gaps||[]).forEach(q=>gapQuestions.push({element:TITLES[k],question:q}));}});return `<div class="sm13-questions" data-discovery-version="${DISCOVERY_MARKER}"><h3>Adaptive Discovery Tree: ${esc(tree.title)}</h3>${Object.entries(tree.groups).map(([group,qs])=>`<div class="sm13-qgroup"><strong>${esc(group)}</strong><ul>${qs.map(q=>`<li>${esc(q)}</li>`).join('')}</ul></div>`).join('')}${gapQuestions.length?`<div class="sm13-qgroup sm13-gap"><strong>MEDDPICC Gap Questions</strong><ul>${gapQuestions.map(x=>`<li><span class="pill">${esc(x.element)}</span> ${esc(x.question)}</li>`).join('')}</ul></div>`:''}${sm14RenderContextQuestions(report)}</div>`;}
  function scorePanel(calc,current,recommended,stages){const readiness=current.number===recommended.number?'Ready for current stage':current.number<recommended.number?'Eligible to advance':'Current stage exceeds evidence recommendation';return `<div class="sm13-score"><div><span>MEDDPICC Score</span><strong>${calc.score}/100</strong></div><div><span>Current Stage</span><strong>${current.number} - ${esc(current.name)}</strong></div><div><span>Recommended Stage</span><strong>${recommended.number} - ${esc(recommended.name)}</strong></div><div><span>Readiness</span><strong>${esc(readiness)}</strong></div></div><div class="sm13-elements">${Object.entries(calc.elements).map(([k,v])=>`<div><b>${esc(TITLES[k])}</b><span>${esc(v.status)} Â· ${v.points}/${v.weight}</span></div>`).join('')}</div>`;}
  function section(id,record,report){const state=record.state||{};const motion=state.motion||'New Business';const stages=stagesFor(motion);const generated=report?.prepared_call?.sales_stage?.number;const current=stages.find(s=>s.number===Number(state.stage_number))||stages.find(s=>s.number===Number(generated))||stages[0];const calc=calculate(report?.prepared_call?.meddpicc||{});const rec=recommendation(calc,stages);return `<section class="v18-box stage-v12 sm13" id="stageV12_${id}"><h2>Opportunity Stage Management</h2><p class="muted">Current stage is user controlled and audited. Recommended stage is calculated from MEDDPICC evidence and stage gates.</p>${scorePanel(calc,current,rec,stages)}<div class="stage-v12-grid"><div class="field"><label>Motion</label><select class="stage-v12-motion"><option ${motion==='New Business'?'selected':''}>New Business</option><option ${motion==='Renewal'?'selected':''}>Renewal</option></select></div><div class="field"><label>Stage</label><select class="stage-v12-stage">${stages.map(s=>`<option value="${s.number}" ${s.number===current.number?'selected':''}>${s.number} - ${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label>Changed By</label><input class="stage-v12-user" value="${esc(state.updated_by||'Justin Naughton')}"></div></div><div class="stage-v12-guidance"></div>${questionTree(current.number,calc,report)}<div class="field"><label>Reason for Change *</label><textarea class="stage-v12-reason" rows="3"></textarea></div><div class="field"><label>Evidence / Links / Notes</label><textarea class="stage-v12-evidence" rows="3"></textarea></div><label class="stage-v12-override"><input type="checkbox" style="width:auto"> Record authorized override when criteria are incomplete</label><div><button class="primary stage-v12-save">Save Stage Change</button><span class="stage-v12-status muted"></span></div><details class="stage-v12-history"><summary>Stage Change History (${record.history?.length||0})</summary>${(record.history||[]).map(h=>`<article class="v18-card"><strong>${esc(h.from_stage_name||'Not set')} â†’ ${esc(h.to_stage_name)}</strong><p>${esc(h.reason)}</p><p class="muted">${esc(h.changed_at)} | ${esc(h.changed_by)}${h.override_used?' | Override recorded':''}</p>${h.evidence?`<p><strong>Evidence:</strong> ${esc(h.evidence)}</p>`:''}</article>`).join('')||'<p>No stage changes recorded.</p>'}</details></section>`;}
  function bind(id,report){const root=document.getElementById('stageV12_'+id);if(!root)return;const motion=root.querySelector('.stage-v12-motion'),stage=root.querySelector('.stage-v12-stage'),guide=root.querySelector('.stage-v12-guidance');function refresh(reset){const stages=stagesFor(motion.value);if(reset)stage.innerHTML=stages.map(s=>`<option value="${s.number}">${s.number} - ${esc(s.name)}</option>`).join('');const s=stages.find(x=>x.number===Number(stage.value))||stages[0];const calc=calculate(report?.prepared_call?.meddpicc||{});const gateMissing=gateCheck(s.number,calc.elements);guide.innerHTML=`<div class="v18-card"><h3>${esc(s.name)}</h3><p>${esc(s.purpose)}</p><p><strong>Exit Criteria and Required Evidence</strong></p>${s.exitCriteria.map(c=>`<label class="stage-v12-criterion"><input type="checkbox" style="width:auto" value="${esc(c)}"> ${esc(c)}</label>`).join('')}<p><strong>Discovery Focus</strong></p><ul>${s.focus.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><strong>MEDDPICC Emphasis</strong></p><div>${s.meddpicc.map(x=>`<span class="pill">${esc(x)}</span>`).join('')}</div>${gateMissing.length?`<div class="sm13-blocked"><strong>MEDDPICC Gate Gaps</strong><ul>${gateMissing.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'<p class="sm13-ready">MEDDPICC minimums satisfied for this stage.</p>'}</div>`;const old=root.querySelector('.sm13-questions');if(old)old.outerHTML=questionTree(s.number,calc,report);}motion.addEventListener('change',()=>refresh(true));stage.addEventListener('change',()=>refresh(false));refresh(false);root.querySelector('.stage-v12-save').addEventListener('click',async()=>{const status=root.querySelector('.stage-v12-status');status.textContent=' Saving...';try{const criteria=[...root.querySelectorAll('.stage-v12-criterion input:checked')].map(x=>x.value);await api('/api/stage-management-v12/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({motion:motion.value,stageNumber:Number(stage.value),changedBy:root.querySelector('.stage-v12-user').value,reason:root.querySelector('.stage-v12-reason').value,evidence:root.querySelector('.stage-v12-evidence').value,criteria,overrideUsed:root.querySelector('.stage-v12-override input').checked})});status.textContent=' Saved and audited.';await install(id);}catch(e){status.textContent=' '+e.message;}});}
  async function install(id){if(!window.meetingplanView)return;await getMatrix();const [record,report]=await Promise.all([api('/api/stage-management-v12/'+id),api('/api/call-report-v4/'+id)]);document.getElementById('stageV12_'+id)?.remove();const hero=meetingplanView.querySelector('.v18-hero');if(hero)hero.insertAdjacentHTML('afterend',section(id,record,report));else meetingplanView.insertAdjacentHTML('afterbegin',section(id,record,report));bind(id,report);}
  const original=window.openMeetingPlan;if(typeof original==='function')window.openMeetingPlan=async function(id){const result=await original.apply(this,arguments);try{await install(id);}catch(e){console.error(MARKER,e);}return result;};
  const css=document.createElement('style');css.textContent='.stage-v12-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}.stage-v12-guidance{margin:12px 0}.stage-v12-criterion{display:block;margin:8px 0}.stage-v12-status{margin-left:10px}.stage-v12-history{margin-top:16px}.stage-v12-history summary{cursor:pointer;font-weight:800;color:#fcaf1a}.sm13-score{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.sm13-score>div,.sm13-elements>div{padding:12px;background:#180825;border:1px solid #654184;border-radius:9px}.sm13-score span,.sm13-elements span{display:block;color:#cdbddd;font-size:12px}.sm13-score strong{display:block;margin-top:4px}.sm13-elements{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}.sm13-elements>div{display:flex;justify-content:space-between;gap:8px}.sm13-questions{margin:16px 0;padding:16px;background:#180825;border:1px solid #654184;border-radius:10px}.sm13-qgroup{margin:12px 0}.sm13-gap{border-left:4px solid #fcaf1a;padding-left:12px}.sm13-blocked{margin-top:12px;padding:12px;background:#351020;border-left:4px solid #e45c78}.sm13-ready{color:#6ee7a8}@media(max-width:900px){.stage-v12-grid,.sm13-score,.sm13-elements{grid-template-columns:1fr 1fr}}@media(max-width:600px){.stage-v12-grid,.sm13-score,.sm13-elements{grid-template-columns:1fr}}';document.head.appendChild(css);
  window.__stageManagementV13={installed:true,weights:WEIGHTS,thresholds:STAGE_THRESHOLDS,install,calculate};
})();
