(function(){
  "use strict";
  const MARKER="EXECUTIVE_NARRATIVE_REPORT_V19";
  const esc=v=>String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  const arr=v=>Array.isArray(v)?v:(v==null||v===""?[]:[v]);
  const compact=a=>[...new Set(arr(a).flat(Infinity).filter(Boolean).map(x=>String(x).trim()).filter(Boolean))];
  const first=(...values)=>values.flatMap(arr).find(v=>v!=null&&v!=="")||"";
  const title=s=>String(s||"").replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
  const sentence=s=>{const x=String(s||"").trim();return !x?"":/[.!?]$/.test(x)?x:x+"."};
  const text=v=>{if(v==null)return"";if(typeof v==="string"||typeof v==="number")return String(v);if(Array.isArray(v))return v.map(text).filter(Boolean).join("; ");return first(v.description,v.assessment,v.recommendation,v.analysis,v.verified_fact_or_context,v.evidence,v.partner_or_client_value,v.commercial_or_mission_impact,v.significance,v.problem,v.customer_outcome,v.known,v.title,v.name);};
  const itemTitle=(x,i)=>typeof x==='object'?first(x.title,x.name,x.theme,x.factor,x.pillar,x.element,x.stakeholder,x.action,x.development,x.headline,`Item ${i+1}`):`Item ${i+1}`;
  const confidence=x=>typeof x==='object'?first(x.confidence,x.verification_status,x.status):"";
  const list=items=>`<ul>${compact(items).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
  const chips=items=>`<div class="nr19-chips">${compact(items).map(x=>`<span>${esc(x)}</span>`).join("")}</div>`;
  const card=(heading,body,meta="")=>`<article class="nr19-card"><h3>${esc(heading)}</h3><div class="nr19-prose">${body}</div>${meta?`<div class="nr19-meta">${meta}</div>`:""}</article>`;
  const section=(heading,intro,body)=>`<section class="nr19-section"><div class="nr19-section-head"><h2>${esc(heading)}</h2>${intro?`<p>${esc(intro)}</p>`:""}</div>${body}</section>`;

  function paragraphFromFacts(items){
    const facts=arr(items).map((x,i)=>{
      if(typeof x!=="object")return sentence(x);
      const subject=itemTitle(x,i);
      const fact=first(x.verified_fact_or_context,x.description,x.assessment,x.recommendation,x.evidence);
      const analysis=first(x.analysis,x.significance,x.partner_or_client_value,x.commercial_or_mission_impact);
      return [subject?`<strong>${esc(subject)}.</strong>`:"",esc(sentence(fact)),analysis?esc(sentence(analysis)):""].filter(Boolean).join(" ");
    }).filter(Boolean);
    return facts.length?facts.map(x=>`<p>${x}</p>`).join(""):'<p class="muted">No material facts captured.</p>';
  }

  function challengeCards(items){
    return arr(items).map((x,i)=>{
      const heading=itemTitle(x,i);
      const description=text(x);
      const opening=typeof x==='object'?first(x.black_duck_opening,x.black_duck_response,x.recommendation):"";
      const risk=typeof x==='object'?first(x.risk_class,x.affected_market,x.mission_environment):"";
      return card(heading,`<p>${esc(sentence(description))}</p>${opening?`<p><strong>Black Duck opening:</strong> ${esc(sentence(opening))}</p>`:""}`,chips([risk,confidence(x)]));
    }).join('')||'<p class="muted">No challenges captured.</p>';
  }

  function opportunityCards(items){
    return arr(items).map((x,i)=>{
      const heading=itemTitle(x,i);
      const scope=typeof x==='object'?first(x.scope,x.recommendation,x.description,x.assessment):text(x);
      const entry=typeof x==='object'?first(x.black_duck_entry,x.black_duck_contribution,x.next_step,x.first_action):"";
      const meta=typeof x==='object'?[x.agency_or_customer,x.status,x.timing,x.qualification,x.confidence]:[];
      return card(heading,`<p>${esc(sentence(scope))}</p>${entry?`<p><strong>Recommended entry:</strong> ${esc(sentence(entry))}</p>`:""}`,chips(meta));
    }).join('')||'<p class="muted">No qualified opportunities captured.</p>';
  }

  function actionCards(items){
    return arr(items).map((x,i)=>{
      const heading=itemTitle(x,i);
      const outcome=typeof x==='object'?first(x.desired_outcome,x.success_measure,x.success_criterion,x.recommendation):text(x);
      return card(heading,`<p>${esc(sentence(outcome))}</p>`,chips(typeof x==='object'?[x.owner,x.timing,x.period]:[]));
    }).join('')||'<p class="muted">No immediate actions captured.</p>';
  }

  function strategicNarrative(r,record){
    r=r||{};
    const partner=record?.partner_name||"Partner";
    const client=record?.account_name||"Prospective Client";
    const summary=first(r.executive_summary,r.summary,record?.prepared_call?.meeting_thesis);
    const decision=first(r.decision,r.recommendation);
    const whyNow=first(r.why_now,r.important_event);
    const thesis=first(r.partnership_thesis,r.strategy,r.value_proposition_description);
    const corporate=r.corporate_profile||[];
    const challenges=r.challenges||[];
    const trends=r.trends||[];
    const opportunities=r.opportunities||r.opportunities_and_initiatives||[];
    const stakeholders=r.stakeholders||[];
    const actions=r.immediate_actions||[];
    const unresolved=r.unresolved_questions||[];
    const qa=r.qa_findings||r.quality_assurance||[];
    const value=r.value_proposition||[];
    const themes=r.executive_themes||[];
    const channel=r.channel_plan||[];
    const sources=r.sources||[];

    const trendNarrative=paragraphFromFacts(trends);
    const valueNarrative=paragraphFromFacts(value);
    const stakeholderNarrative=arr(stakeholders).map((x,i)=>card(itemTitle(x,i),`<p>${esc(sentence(first(x.value_proposition,x.approach,x.assessment,text(x))))}</p>${x.next_step?`<p><strong>Next step:</strong> ${esc(sentence(x.next_step))}</p>`:""}`,chips([x.influence,x.interest,x.verification_status]))).join('');
    const executiveThemeNarrative=paragraphFromFacts(themes);
    const planCards=(arr(channel).length?channel:actions).map((x,i)=>card(itemTitle(x,i),`<p>${esc(sentence(first(x.desired_outcome,x.recommendation,x.description,x.success_criterion,text(x))))}</p>`,chips([x.period,x.owner,x.dependency]))).join('');

    return `<div class="nr19-page" data-marker="${MARKER}">
      <section class="nr19-hero">
        <span>Executive Partner Strategy</span>
        <h1>${esc(partner)} + ${esc(client)}</h1>
        <p>${esc(sentence(summary))}</p>
        <div class="nr19-decision-grid">
          <div><b>Decision</b><p>${esc(sentence(decision||"Continue qualification while validating mutual value and evidence."))}</p></div>
          <div><b>Why now</b><p>${esc(sentence(whyNow||"Validate the compelling event, priority, and timing with the customer or partner."))}</p></div>
        </div>
      </section>
      ${section("Partnership Thesis","The joint value story in plain language.",`<article class="nr19-talk"><p>${esc(sentence(thesis||summary))}</p></article>`)}
      ${section("Partner and Market Position","What is known about the partner, why it matters, and where evidence is still required.",`<div class="nr19-narrative">${paragraphFromFacts(corporate)}</div>`)}
      ${section("Business Drivers and Headwinds","The most important customer, market, compliance, delivery, and competitive pressures.",`<div class="nr19-grid">${challengeCards(challenges)}</div>`)}
      ${section("Market Direction","Trends that make the partnership relevant now.",`<div class="nr19-narrative">${trendNarrative}</div>`)}
      ${section("Black Duck Value","How Black Duck capabilities translate to partner, customer, and mission value.",`<div class="nr19-narrative">${valueNarrative}</div>`)}
      ${section("Priority Opportunities","Qualified initiatives and the recommended Black Duck entry point.",`<div class="nr19-grid">${opportunityCards(opportunities)}</div>`)}
      ${section("Executive Themes","The narrative to carry into executive and partner conversations.",`<div class="nr19-narrative">${executiveThemeNarrative}</div>`)}
      ${section("Stakeholders","Who matters, why, and what engagement is required.",`<div class="nr19-grid">${stakeholderNarrative||'<p class="muted">No stakeholders validated.</p>'}</div>`)}
      ${section("Action Plan","Concrete actions, owners, dependencies, and success measures.",`<div class="nr19-grid">${planCards||actionCards(actions)}</div>`)}
      ${section("What Still Needs Validation","Questions and evidence gaps that should drive the next conversation.",`${list(compact([...arr(unresolved),...arr(qa).map(x=>first(x.required_action,x.finding,text(x)))]))||'<p class="muted">No unresolved questions recorded.</p>'}`)}
      <details class="nr19-evidence"><summary>Supporting Evidence and Sources</summary><div class="nr19-evidence-body">${arr(sources).map((x,i)=>`<article><strong>${esc(itemTitle(x,i))}</strong><p>${esc(sentence(first(x.used_for,x.publisher,x.url,text(x))))}</p></article>`).join('')||'<p>No source records captured.</p>'}</div></details>
    </div>`;
  }

  async function api(url){const response=await fetch(url);const raw=await response.text();let body={};try{body=raw?JSON.parse(raw):{};}catch{body={raw};}if(!response.ok)throw new Error(body.error||body.raw||`HTTP ${response.status}`);return body;}

  async function addNarrative(id){
    const root=document.getElementById('v18tabs_'+id);
    if(!root||root.querySelector('[data-marker="'+MARKER+'"]'))return;
    const record=await api('/api/call-report-v4/'+encodeURIComponent(id));
    const research=record.reconciled_research||record.partner_research||record.client_research||{};
    const tabs=root.querySelector('.v18-tabs');
    if(!tabs)return;
    const panes=[...root.querySelectorAll(':scope > .v18-pane')];
    const button=document.createElement('button');
    button.textContent='Executive Narrative';
    const pane=document.createElement('div');
    pane.className='v18-pane';
    pane.innerHTML=strategicNarrative(research,record);
    tabs.prepend(button);
    const firstPane=panes[0];
    if(firstPane)firstPane.insertAdjacentElement('beforebegin',pane);else root.appendChild(pane);
    const allButtons=[...tabs.querySelectorAll('button')];
    const allPanes=[...root.querySelectorAll(':scope > .v18-pane')];
    allButtons.forEach((b,index)=>{b.onclick=()=>{allButtons.forEach((x,n)=>x.classList.toggle('active',n===index));allPanes.forEach((x,n)=>x.classList.toggle('active',n===index));};});
    allButtons[0].click();
  }

  const style=document.createElement('style');
  style.textContent=`
    .nr19-page{display:grid;gap:18px;width:100%;color:#fff}.nr19-hero,.nr19-section,.nr19-evidence{border:1px solid #654184;border-left:6px solid #fcaf1a;border-radius:12px;background:linear-gradient(115deg,#351057dd,#1c0a2dee);padding:22px}.nr19-hero>span{color:#fcaf1a;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.nr19-hero h1{margin:8px 0 12px}.nr19-hero>p{font-size:18px;line-height:1.7;max-width:1200px}.nr19-decision-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.nr19-decision-grid>div,.nr19-card,.nr19-talk,.nr19-narrative{border:1px solid #654184;border-radius:10px;background:#180825;padding:16px}.nr19-decision-grid b,.nr19-card strong,.nr19-talk strong,.nr19-narrative strong{color:#fcaf1a}.nr19-section-head{display:grid;grid-template-columns:minmax(260px,.75fr) minmax(0,1.25fr);gap:16px;align-items:end;margin-bottom:14px}.nr19-section-head h2{margin:0}.nr19-section-head p{margin:0;color:#cdbddd}.nr19-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.nr19-card h3{margin:0 0 10px}.nr19-card p,.nr19-narrative p,.nr19-talk p{font-size:16px;line-height:1.65;margin:0 0 12px}.nr19-chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.nr19-chips span{display:inline-block;padding:5px 9px;border-radius:999px;background:#572681;color:#fff;border:1px solid #9a73b3;font-size:12px}.nr19-evidence summary{cursor:pointer;color:#fcaf1a;font-weight:800;font-size:18px}.nr19-evidence-body{display:grid;gap:10px;margin-top:14px}.nr19-evidence-body article{border-top:1px solid #654184;padding-top:10px}.nr19-page ul{padding-left:24px}.nr19-page li{margin:7px 0}@media(max-width:850px){.nr19-decision-grid,.nr19-section-head,.nr19-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const original=window.openResearchReport;
  if(typeof original!=='function'){console.error(MARKER+' could not wrap openResearchReport');return;}
  window.openResearchReport=async function(id){const result=await original.apply(this,arguments);try{await addNarrative(id);}catch(error){console.error(MARKER,error);}return result;};
  window.__executiveNarrativeV19={marker:MARKER,addNarrative,strategicNarrative};
  console.info(MARKER+' loaded');
})();
