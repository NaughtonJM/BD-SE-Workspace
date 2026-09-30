'use strict';
// EXECUTIVE_STRATEGY_ENGINE_V20
module.exports = function executiveStrategyV20(app, db) {
  const VERSION = '20.0.0';
  const safeJson = (value, fallback = {}) => {
    try { return typeof value === 'string' ? JSON.parse(value) : (value || fallback); }
    catch { return fallback; }
  };
  const clean = value => String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  const list = value => Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
  const uniq = values => [...new Set(values.map(clean).filter(Boolean))];
  const first = (...values) => values.map(clean).find(Boolean) || '';
  const tableExists = name => !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name);
  const columns = name => tableExists(name) ? db.prepare(`PRAGMA table_info(${name})`).all().map(x => x.name) : [];
  const readRow = (table, id) => {
    if (!tableExists(table)) return null;
    const cols = columns(table);
    const key = ['id','call_prep_id','meeting_id','record_id'].find(x => cols.includes(x));
    if (!key) return null;
    return db.prepare(`SELECT * FROM ${table} WHERE ${key}=? ORDER BY rowid DESC LIMIT 1`).get(id) || null;
  };
  const evidence = (statement, source, confidence='observed') => statement ? {statement:clean(statement),source,confidence} : null;
  const scanObjects = (obj, names, out=[]) => {
    if (!obj || typeof obj !== 'object') return out;
    for (const [k,v] of Object.entries(obj)) {
      if (names.includes(k.toLowerCase()) && v) out.push(...list(v));
      if (v && typeof v === 'object') scanObjects(v,names,out);
    }
    return out;
  };

  // V20_RECORD_LOOKUP_FIX_20_1
  // History IDs are call_prep_results.id values. Load that authoritative row first,
  // then merge its JSON research and synthesis payloads for strategy generation.
  const loadContext = id => {
    const row = db.prepare(`
      SELECT *
      FROM call_prep_results
      WHERE id = ?
    `).get(id);

    if (!row) {
      const err = new Error(`No call_prep_results record found for History ID ${id}`);
      err.status = 404;
      throw err;
    }

    const merged = { ...row };
    const jsonFields = [
      'input_json',
      'result_json',
      'research_json',
      'partner_research_json',
      'client_research_json',
      'combined_research_json',
      'meeting_plan_json',
      'account_plan_json',
      'strategy_brief_json',
      'post_meeting_json',
      'resynthesis_json'
    ];

    for (const field of jsonFields) {
      if (!(field in row) || row[field] == null || row[field] === '') continue;
      const parsed = safeJson(row[field], null);
      if (parsed && typeof parsed === 'object') {
        merged[field] = parsed;
        Object.assign(merged, parsed);
      }
    }

    // Preserve the named research objects even after their contents are merged.
    merged.input = safeJson(row.input_json, merged.input || {});
    merged.prepared_call = safeJson(row.result_json, merged.prepared_call || {});
    merged.partner_research = safeJson(row.partner_research_json, merged.partner_research || {});
    merged.client_research = safeJson(row.client_research_json, merged.client_research || {});
    merged.combined_research = safeJson(
      row.combined_research_json || row.research_json,
      merged.combined_research || {}
    );

    // Normalize fields that the V20 synthesis expects.
    merged.account_name = first(
      row.account_name,
      merged.account_name,
      merged.account,
      merged.client_research && merged.client_research.subject_name
    );
    merged.partner_name = first(
      row.partner_name,
      merged.partner_name,
      merged.partner,
      merged.partner_research && merged.partner_research.subject_name
    );
    merged.objective = first(
      merged.objective,
      merged.meeting_objective,
      merged.prepared_call && merged.prepared_call.objective,
      merged.combined_research && merged.combined_research.partnership_objective &&
        merged.combined_research.partnership_objective.customer_outcome
    );
    merged.primary_risk = first(
      merged.primary_risk,
      merged.combined_research && merged.combined_research.primary_risk,
      merged.client_research && merged.client_research.primary_risk,
      merged.partner_research && merged.partner_research.primary_risk
    );
    merged.stakeholders =
      merged.stakeholders ||
      (merged.combined_research && merged.combined_research.stakeholders) ||
      (merged.client_research && merged.client_research.stakeholders) ||
      [];
    merged.trigger_events =
      merged.trigger_events ||
      (merged.combined_research && merged.combined_research.headwinds_tailwinds) ||
      [];
    merged.metrics =
      merged.metrics ||
      (merged.combined_research && merged.combined_research.immediate_actions) ||
      [];

    return {
      data: merged,
      provenance: [
        'call_prep_results',
        ...jsonFields.filter(field => row[field] != null && row[field] !== '')
      ]
    };
  };

  // EXECUTIVE_NARRATIVE_ENGINE_V20_2
  const build = id => {
    const {data:d,provenance}=loadContext(id), c=d.combined_research||{}, p=d.partner_research||{}, u=d.client_research||{}, pc=d.prepared_call||{};
    const pick=(...v)=>first(...v), rows=v=>Array.isArray(v)?v:[];
    const account=pick(d.account_name,d.account,u.subject_name), partner=pick(d.partner_name,d.partner,p.subject_name);
    const stage=pick(d.sales_stage,d.stage,d.current_stage,pc.sales_stage,'Unspecified');
    const mission=pick(c.partnership_objective&&c.partnership_objective.customer_outcome,c.executive_summary,u.executive_summary,d.objective);
    const risk=pick(c.primary_risk,u.primary_risk,p.primary_risk,d.primary_risk);
    const whyNow=pick(c.why_now,u.why_now,p.why_now,d.why_now);
    const thesis=pick(c.partnership_thesis,p.partnership_thesis,u.partnership_thesis);
    const lighthouse=pick(c.lighthouse,u.lighthouse,p.lighthouse);
    const themes=rows(c.executive_themes).map(x=>({headline:pick(x.headline,x.theme),why:pick(x.why_it_matters,x.evidence)})).filter(x=>x.headline);
    const challenges=rows(c.challenges).map(x=>({title:pick(x.title,x.name),description:pick(x.description,x.evidence),confidence:pick(x.confidence,'Unspecified')})).filter(x=>x.title);
    const stakeholders=rows(c.stakeholders).concat(rows(u.stakeholders)).map(x=>({name:pick(x.stakeholder,x.name,x.title_or_type),role:pick(x.title_or_type,x.role),influence:pick(x.influence,'Unknown'),status:pick(x.verification_status,'Needs validation'),next:pick(x.next_step,x.approach)})).filter(x=>x.name);
    const actions=rows(c.immediate_actions).concat(rows(u.immediate_actions)).map(x=>({action:pick(x.action,x.recommendation),owner:pick(x.owner,'Unassigned'),timing:pick(x.timing,'Unspecified'),measure:pick(x.success_measure,x.success_criterion)})).filter(x=>x.action);
    const opportunities=rows(c.opportunities).map(x=>({name:pick(x.name,x.motion),entry:pick(x.black_duck_entry,x.appsec_need),status:pick(x.status,x.qualification)})).filter(x=>x.name);
    const claims=rows(c.claim_ledger).map(x=>({claim:x.claim,status:pick(x.classification,'Unverified'),confidence:pick(x.confidence,'Unknown')})).filter(x=>x.claim);
    const unresolved=uniq([...rows(c.unresolved_questions),...rows(u.unresolved_questions),...rows(p.unresolved_questions)]);
    const gaps=[];
    if(!mission)gaps.push('Mission outcome'); if(!risk)gaps.push('Consequence of failure'); if(!whyNow)gaps.push('Trigger or compelling event');
    if(!stakeholders.length)gaps.push('Stakeholder coalition'); if(!actions.length)gaps.push('Customer-owned next action');
    if(!pick(d.economic_buyer,pc.economic_buyer))gaps.push('Named economic buyer'); if(!pick(d.decision_process,pc.decision_process))gaps.push('Decision process');
    if(!pick(d.metrics,pc.metrics))gaps.push('Quantified success metric');
    const score=Math.max(0,100-Math.min(100,gaps.length*11));
    return {version:'20.2.0',record_id:Number(id),account,partner,stage,generated_at:new Date().toISOString(),
      executive_summary:[pick(c.executive_summary,u.executive_summary,p.executive_summary),thesis,whyNow].filter(Boolean).join('\n\n')||'Executive narrative requires additional validated evidence.',
      why_now:whyNow||null,mission_outcome:mission||null,consequence_of_failure:risk||null,executive_thesis:thesis||null,lighthouse:lighthouse||null,
      executive_opener:{data:whyNow||mission||`History record ${id} contains research but no validated trigger.`,insight:risk||'The consequence of inaction needs executive validation.',question:pick(c.thought_provoking_question,u.thought_provoking_question,p.thought_provoking_question,'Which mission outcome is exposed by unresolved software risk?')},
      themes:themes.slice(0,5),challenges:challenges.slice(0,6),stakeholder_map:stakeholders.slice(0,10),opportunities:opportunities.slice(0,5),recommended_actions:actions.slice(0,8),claim_ledger:claims.slice(0,10),unresolved_questions:unresolved.slice(0,10),evidence_gaps:gaps,
      readiness:{score,status:score>=80?'Executive-ready':score>=55?'Developing':'Evidence gaps block executive use'},
      provenance:{tables:provenance,method:'Deterministic narrative synthesis from call_prep_results. Unverified claims remain labeled; missing facts are not invented.'}};
  };
  app.get('/api/executive-strategy-v20/health',(req,res)=>res.json({status:'running',version:VERSION}));
  app.get('/api/executive-strategy-v20/:id',(req,res)=>{try{res.json(build(req.params.id));}catch(e){res.status(e.status||500).json({error:e.message});}});
  app.post('/api/executive-strategy-v20/:id/regenerate',(req,res)=>{try{res.json(build(req.params.id));}catch(e){res.status(e.status||500).json({error:e.message});}});
};