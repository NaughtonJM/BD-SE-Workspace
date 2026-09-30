/* PRESENTATION_NARRATIVE_V20_2_2 */
(function () {
  'use strict';

  const VERSION = '20.2.2';
  const html = value => typeof esc === 'function' ? esc(value) : String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const label = key => typeof v18Label === 'function' ? v18Label(key) : String(key || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  const present = value => value != null && value !== '' && !(Array.isArray(value) && !value.length);
  const text = value => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join('; ');
    return Object.values(value).map(text).filter(Boolean).join('; ');
  };
  const redactPipeline = value => String(value ?? '')
    .replace(/\bGDIT\b/gi, 'Partner Research')
    .replace(/\bBoeing\b/gi, 'Client Research');

  const style = document.createElement('style');
  style.id = 'presentation-narrative-v20-2-2-style';
  style.textContent = `
    .v2022-history{width:100%;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#180825}
    .v2022-history-head,.v2022-history-row{display:grid;grid-template-columns:minmax(180px,1.05fr) minmax(145px,.72fr) minmax(330px,1.75fr) minmax(150px,.72fr) minmax(180px,.9fr);gap:12px;align-items:center;padding:13px 15px}
    .v2022-history-head{background:#572681;border-bottom:2px solid var(--gold);font-size:11pt;font-weight:850}
    .v2022-history-row{border-top:1px solid #55366e;background:#210d34;min-height:92px}
    .v2022-history-row:nth-child(odd){background:#1c0a2d}
    .v2022-meeting strong{display:block;color:#fff;font-size:13pt;margin-bottom:3px}.v2022-meeting .muted{display:block}
    .v2022-action-grid{display:grid;grid-template-columns:repeat(2,minmax(135px,1fr));gap:7px}.v2022-action-grid button,.v2022-strategy button,.v2022-files button{width:100%;min-height:40px;margin:0;white-space:normal;line-height:1.2}
    .v2022-strategy,.v2022-files{display:grid;grid-template-columns:1fr;gap:7px}.v2022-files .pill{display:flex;align-items:center;justify-content:center;min-height:40px;text-align:center;margin:0}
    .v2022-narrative{background:linear-gradient(145deg,#1b0a2b,#241035);border:1px solid #76538d;border-left:5px solid var(--gold);border-radius:13px;padding:18px;margin:13px 0;color:#f8f4fb}
    .v2022-narrative h3{color:#fff!important;margin:0 0 10px!important}.v2022-narrative p{color:#f8f4fb!important;line-height:1.62;margin:0 0 11px!important}
    .v2022-narrative .v2022-confidence{display:inline-block;background:#32134a;border:1px solid #9a73b3;border-radius:999px;padding:4px 9px;color:#fff!important;font-size:10.5pt}
    .v2022-narrative details{margin-top:12px;border-top:1px solid #654184;padding-top:9px}.v2022-narrative summary{cursor:pointer;color:#fcaf1a;font-weight:800}
    .v2022-evidence{display:grid;grid-template-columns:minmax(140px,210px) minmax(0,1fr);gap:7px 14px;margin-top:10px}.v2022-evidence dt{color:#fcaf1a;font-weight:800}.v2022-evidence dd{margin:0;color:#e9e0ef;overflow-wrap:anywhere}
    .v2022-pipeline-name{color:#fff;font-size:13pt}.v2022-pipeline-copy{color:#f8f4fb;line-height:1.55}
    @media(max-width:1250px){.v2022-history-head,.v2022-history-row{grid-template-columns:1fr 1fr}.v2022-history-head div:nth-child(n+3){display:none}.v2022-history-row>div{min-width:0}.v2022-action-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:760px){.v2022-history-head{display:none}.v2022-history-row{grid-template-columns:1fr}.v2022-action-grid{grid-template-columns:1fr}.v2022-evidence{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function narrativeSentence(key, value) {
    const raw = text(value).trim();
    if (!raw) return '';
    const clean = raw.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1');
    const lower = String(key || '').toLowerCase();
    if (['description','analysis','assessment','significance','effect','scope','problem','opening','recommendation','response','approach'].includes(lower)) return clean;
    if (lower === 'verified_fact_or_context') return clean;
    if (lower === 'why_it_matters') return `This matters because ${clean.replace(/^[Tt]his matters because\s*/,'')}`;
    if (lower === 'black_duck_opening') return `Black Duck's opening is ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'black_duck_contribution') return `Black Duck contributes ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'customer_outcome') return `The intended customer outcome is ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'partner_or_client_value') return `The partner or client value is ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'commercial_or_mission_impact') return `The commercial or mission impact is ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'joint_action') return `The recommended joint action is ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'success_measure' || lower === 'success_criterion' || lower === 'success_measures') return `Success is measured by ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'next_step' || lower === 'first_action') return `The next step is ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'owner') return `The proposed owner is ${clean}`;
    if (lower === 'timing' || lower === 'period') return `The expected timing is ${clean}`;
    if (lower === 'factor_type') return `This is categorized as a ${clean.toLowerCase()}`;
    if (lower === 'black_duck_response') return `Black Duck should respond by ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    if (lower === 'differentiation_or_complementarity') return clean;
    return `${label(key)}: ${clean}`;
  }

  function readableTitle(item, index) {
    return item.title || item.headline || item.name || item.theme || item.factor || item.pillar || item.element || item.stakeholder || item.capability || item.dimension || item.action || item.development || `Item ${index + 1}`;
  }

  function proseItem(item, index) {
    if (typeof item !== 'object' || item == null) return `<article class="v2022-narrative"><p>${html(text(item))}</p></article>`;
    const titleKeys = new Set(['title','headline','name','theme','factor','pillar','element','stakeholder','capability','dimension','action','development']);
    const metadataKeys = new Set(['source_url','url','exact_quote','evidence','verified_basis','confidence','classification','verification_status','status','date_verified','publisher','date','used_for']);
    const narrative = [];
    const metadata = [];
    for (const [key, value] of Object.entries(item)) {
      if (titleKeys.has(key) || !present(value)) continue;
      if (metadataKeys.has(key)) metadata.push([key,value]);
      else narrative.push(narrativeSentence(key,value));
    }
    const confidence = item.confidence || item.verification_status || item.classification || item.status || '';
    const body = narrative.filter(Boolean).map(sentence => `<p>${html(sentence)}${/[.!?]$/.test(sentence)?'':'.'}</p>`).join('') || '<p>No narrative details were supplied.</p>';
    const evidence = metadata.length ? `<details><summary>Evidence, sources, and validation</summary><dl class="v2022-evidence">${metadata.map(([key,value])=>`<dt>${html(label(key))}</dt><dd>${html(text(value))}</dd>`).join('')}</dl></details>` : '';
    return `<article class="v2022-narrative"><h3>${html(readableTitle(item,index))}</h3>${body}${confidence?`<span class="v2022-confidence">${html(confidence)}</span>`:''}${evidence}</article>`;
  }

  window.v18ProseItem = proseItem;

  window.v18Pipeline = async function(id) {
    const response = await v18Timeout('/api/meeting-plan-v7/' + id + '/pipeline');
    const pipeline = await response.json();
    if (!response.ok) throw new Error(pipeline.error || 'Pipeline failed');
    const stages = Array.isArray(pipeline.stages) ? pipeline.stages : [];
    return `<div class="v18-box"><h2>Pipeline Evidence</h2><p>${html(redactPipeline(pipeline.design_decision || ''))}</p>${stages.map(stage => {
      const stageName = redactPipeline(stage.name || 'Pipeline stage');
      const framework = redactPipeline(stage.framework || '');
      const inputs = redactPipeline((stage.inputs || []).join(' | '));
      const processing = redactPipeline(stage.processing || '');
      const output = redactPipeline(stage.output || '');
      return `<div class="v18-pipeline"><div class="v18-num">${html(stage.number)}</div><div><strong class="v2022-pipeline-name">${html(stageName)}</strong><p class="v2022-pipeline-copy">${html(framework)}</p></div><div><strong>Inputs and Processing</strong><p class="v2022-pipeline-copy">${html(inputs)}</p><p class="v2022-pipeline-copy">${html(processing)}</p></div><div><strong>Output</strong><p class="v2022-pipeline-copy">${html(output)}</p><p>${stage.captured ? 'Audit captured' : 'Historical record not fully audited'}</p></div></div>`;
    }).join('')}</div>`;
  };

  window.loadCallPrepHistory = async function() {
    historyView.innerHTML = '<p>Loading...</p>';
    try {
      const response = await v18Timeout('/api/call-report-v4', {}, 10000);
      const rows = await response.json();
      if (!response.ok) throw new Error(rows.error || 'History failed');
      historyView.innerHTML = `<div class="v2022-history"><div class="v2022-history-head"><div>Meeting</div><div>Created</div><div>Meeting Actions</div><div>Strategy</div><div>Deliverables</div></div>${rows.map(row => {
        const accountPlan = row.account_plan_url ? `<button onclick="openHistoryPreview(${row.id},'plan')">Account Plan</button>` : '<span class="pill">No Account Plan</span>';
        const strategyBrief = row.strategy_brief_url ? `<button onclick="openHistoryPreview(${row.id},'brief')">Strategy Brief</button>` : '<span class="pill">No Strategy Brief</span>';
        return `<article class="v2022-history-row record"><div class="v2022-meeting"><strong>${html(row.partner_name || 'Partner')}</strong><span class="muted">${html(row.account_name || '')}</span></div><div>${html(row.created_date || '')}<div class="muted">${html(row.model || '')}</div></div><div class="v2022-action-grid"><button onclick="openMeetingPlan(${row.id})">Meeting Plan</button><button class="primary" onclick="openMeetingExecution(${row.id})">Meeting Execution</button><button onclick="openResearchReport(${row.id})">Research Report</button><button class="danger" onclick="deleteV18(${row.id})">Delete</button></div><div class="v2022-strategy"><button class="v20-open" onclick="openExecutiveStrategyV20(${row.id})">Executive Strategy</button></div><div class="v2022-files">${accountPlan}${strategyBrief}</div></article>`;
      }).join('')}</div>`;
    } catch (error) {
      historyView.innerHTML = `<div class="v18-error"><h3>History failed</h3><p>${html(error.message)}</p><button onclick="loadCallPrepHistory()">Retry</button></div>`;
    }
  };

  console.log('PRESENTATION_NARRATIVE_V20_2_2 loaded');
})();