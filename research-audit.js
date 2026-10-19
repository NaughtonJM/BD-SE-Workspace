function strip(v){return String(v||"").replace(/^```json\s*/i,"").replace(/\s*```$/i,"").trim()}
function decodeHtmlEntities(value){return String(value||"").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'\"').replace(/&#39;/gi,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))}
function normalizeRichContext(value){
 let text=String(value||"");
 text=text.replace(/<br\s*\/?\s*>/gi,"\n").replace(/<\/(p|div|li|h[1-6]|tr)>/gi,"\n").replace(/<li[^>]*>/gi,"â€¢ ").replace(/<h[1-6][^>]*>/gi,"\n").replace(/<[^>]+>/g,"");
 text=decodeHtmlEntities(text).replace(/\r/g,"").replace(/[ \t]+\n/g,"\n").replace(/\n[ \t]+/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
 const lines=text.split("\n").map(x=>x.trim()).filter((x,i,a)=>x||i===0||a[i-1]);
 return lines.join("\n");
}
function normalizeMeetingInput(input){const out={...(input||{})};for(const key of ["meeting_objective","attendees","known_context","constraints","additional_input"])if(out[key]!=null)out[key]=normalizeRichContext(out[key]);return out}

/* BLACKDUCK_UPSTREAM_FIELD_MAPPING_V22_1_1 */
function normalizeResearchResult(input){
  const result=(input && typeof input==="object" && !Array.isArray(input)) ? {...input} : {};
  const arr=v=>Array.isArray(v)?v:[];
  const clean=v=>{
    if(v===undefined||v===null)return "";
    const s=String(v).trim();
    return /^(undefined|null)$/i.test(s)?"":s;
  };
  const first=(...values)=>{
    for(const value of values){const s=clean(value);if(s)return s;}
    return "";
  };
  const uniq=values=>[...new Set(values.map(clean).filter(Boolean))];
  const rows=(primary,...alternates)=>{
    const source=arr(result[primary]).length?arr(result[primary]):alternates.flatMap(k=>arr(result[k]));
    return source.filter(x=>x&&typeof x==="object").map(x=>({...x}));
  };

  result.corporate_profile=rows("corporate_profile","company_profile","partner_profile","federal_market_profile").map(x=>({
    ...x,
    dimension:first(x.dimension,x.title,x.category,x.name),
    verified_fact_or_context:first(x.verified_fact_or_context,x.verified_context,x.context,x.fact,x.description,x.summary),
    analysis:first(x.analysis,x.channel_implication,x.implication,x.relevance,x.recommendation),
    confidence:first(x.confidence,x.confidence_level)
  }));

  result.trends=rows("trends","market_trends","forward_looking_trends").map(x=>({
    ...x,
    headline:first(x.headline,x.trend,x.title,x.name,x.development),
    significance:first(x.significance,x.why_it_matters,x.impact,x.description),
    affected_markets:first(x.affected_markets,x.markets,x.affected_environment,x.agencies),
    partnership_implication:first(x.partnership_implication,x.channel_implication,x.implication,x.recommendation)
  }));

  result.value_proposition=rows("value_proposition","value_propositions","business_case","mutual_business_case").map(x=>({
    ...x,
    capability:first(x.capability,x.title,x.name,x.offering),
    verified_basis:first(x.verified_basis,x.basis,x.evidence,x.context),
    partner_or_client_value:first(x.partner_or_client_value,x.partner_value,x.client_value,x.customer_value,x.subject_value,x.benefit),
    commercial_or_mission_impact:first(x.commercial_or_mission_impact,x.commercial_impact,x.mission_impact,x.business_impact,x.customer_outcome,x.outcome)
  }));

  result.stakeholders=rows("stakeholders","stakeholder_map","key_stakeholders").map(x=>({
    ...x,
    stakeholder:first(x.stakeholder,x.name,x.person,x.role,x.title_or_type),
    title_or_type:first(x.title_or_type,x.title,x.role,x.type),
    verification_status:first(x.verification_status,x.status,x.validation_status,"To be validated"),
    influence:first(x.influence,x.influence_level),
    interest:first(x.interest,x.interest_level),
    value_proposition:first(x.value_proposition,x.partner_value,x.client_value,x.relevance,x.why_it_matters,x.benefit),
    approach:first(x.approach,x.engagement_approach,x.recommendation,x.next_step),
    next_step:first(x.next_step,x.action,x.approach)
  })).map(x=>{
    if(/^(John Smith|Jane Doe|John Doe)$/i.test(clean(x.stakeholder)))x.stakeholder="Stakeholder to be confirmed";
    return x;
  });

  result.challenges=rows("challenges","material_challenges").map(x=>({
    ...x,
    title:first(x.title,x.challenge,x.name),
    affected_market:first(x.affected_market,x.affected_environment,x.environment,x.market),
    mission_environment:first(x.mission_environment,x.affected_environment,x.environment),
    black_duck_opening:first(x.black_duck_opening,x.opening,x.entry_point,x.recommendation,x.response)
  }));

  result.opportunities=rows("opportunities","opportunity_map","contracts").map(x=>({
    ...x,
    name:first(x.name,x.opportunity,x.title),
    agency_or_customer:first(x.agency_or_customer,x.agency,x.customer,x.account),
    status:first(x.status,x.stage,x.qualification),
    appsec_need:first(x.appsec_need,x.appsec_need_or_entry,x.need,x.entry_point,x.black_duck_entry),
    black_duck_entry:first(x.black_duck_entry,x.entry_point,x.appsec_need,x.recommendation)
  }));

  result.partnership_framework=rows("partnership_framework","partnership_themes","solution_model").map(x=>({
    ...x,
    theme:first(x.theme,x.title,x.name),
    joint_offering:first(x.joint_offering,x.offering,x.solution,x.recommendation),
    subject_benefit:first(x.subject_benefit,x.partner_value,x.partner_or_client_value,x.benefit),
    customer_outcome:first(x.customer_outcome,x.commercial_or_mission_impact,x.mission_impact,x.outcome)
  }));

  result.channel_plan=rows("channel_plan","action_plan","roadmap").map(x=>({
    ...x,
    desired_outcome:first(x.desired_outcome,x.outcome,x.success_criterion,x.measure),
    success_criterion:first(x.success_criterion,x.desired_outcome,x.measure,x.outcome)
  }));

  result.meeting_agenda=rows("meeting_agenda","agenda").map(x=>({
    ...x,
    topic:first(x.topic,x.agenda_item,x.title),
    desired_output:first(x.desired_output,x.outcome,x.success_criterion)
  }));

  result.executive_themes=rows("executive_themes","discussion_themes").map(x=>({
    ...x,
    headline:first(x.headline,x.title,x.theme),
    why_it_matters:first(x.why_it_matters,x.significance,x.impact,x.value_proposition)
  }));

  result.headwinds_tailwinds=rows("headwinds_tailwinds","tailwinds_headwinds").map(x=>({
    ...x,
    joint_action:first(x.joint_action,x.action,x.recommendation,x.black_duck_role)
  }));

  result.competitive_landscape=rows("competitive_landscape","competitors","partner_landscape").map(x=>({
    ...x,
    entity_or_risk:first(x.entity_or_risk,x.examples_risk,x.entity,x.risk,x.examples),
    differentiation_or_complementarity:first(x.differentiation_or_complementarity,x.differentiation,x.coexistence,x.response,x.recommendation)
  }));

  // Keep arrays compact and avoid downstream duplicate joins without inventing content.
  for(const key of ["corporate_profile","trends","value_proposition","stakeholders","challenges","opportunities","partnership_framework","channel_plan","meeting_agenda","executive_themes","headwinds_tailwinds","competitive_landscape"]){
    result[key]=arr(result[key]).filter(row=>Object.values(row).some(v=>clean(v)));
  }
  result._field_mapping={version:"22.1.1",normalized:true};
  return result;
}

/* BLACKDUCK_RESEARCH_QUALITY_GUARD_V22_2_0 */
function applyResearchQualityGuard(input){
  const result=(input&&typeof input==="object"&&!Array.isArray(input))?input:{};
  const arrays=["corporate_profile","challenges","trends","opportunities","swot","value_proposition","partnership_framework","stakeholders","channel_plan","meeting_agenda","executive_themes","headwinds_tailwinds","competitive_landscape","account_strategy","immediate_actions","sources","claim_ledger","qa_findings"];
  const empty=value=>value===undefined||value===null||String(value).trim()==="";
  const url=value=>/^https?:\/\//i.test(String(value||"").trim());
  const clean=value=>String(value??"").trim().replace(/\bblack Duck\b/g,"Black Duck").replace(/\bsBOM\b/g,"SBOM").replace(/\bsCA\b/g,"SCA").replace(/\bfY(\d{2,4})\b/g,"FY$1").replace(/\bq([1-4])\b/g,"Q$1");
  const confidence=row=>String(row?.confidence||"").trim().toLowerCase();
  const hasEvidence=row=>url(row?.source_url)||(!empty(row?.evidence)&&!/^(unverified|to be validated)$/i.test(String(row.evidence).trim()))||(!empty(row?.exact_quote)&&!/^(unverified|to be validated)$/i.test(String(row.exact_quote).trim()));

  for(const key of arrays){
    if(!Array.isArray(result[key]))result[key]=[];
    result[key]=result[key].filter(row=>{
      if(typeof row==="string")return clean(row)!=="";
      if(!row||typeof row!=="object")return false;
      for(const field of Object.keys(row)){
        if(typeof row[field]==="string")row[field]=clean(row[field]);
      }
      return Object.values(row).some(value=>!empty(value));
    });
  }

  // Never present unsupported claims as highly verified.
  for(const key of arrays){
    for(const row of result[key]){
      if(!row||typeof row!=="object")continue;
      if(!hasEvidence(row)&&["high","verified","high confidence"].includes(confidence(row))){
        row.confidence="Needs verification";
      }
      if(row.source_url&&!url(row.source_url))row.source_url="";
      if(row.verification_status&&/verified/i.test(row.verification_status)&&!hasEvidence(row))row.verification_status="To be validated";
    }
  }

  // Opportunities with no direct evidence must remain explicitly analytical.
  for(const row of result.opportunities){
    if(!hasEvidence(row)){
      row.qualification=row.qualification||"Analytical";
      row.status=row.status||"Prospective";
    }
  }

  // Named stakeholders require a source; otherwise preserve only a role label.
  for(const row of result.stakeholders){
    if(!hasEvidence(row)&&row.stakeholder&&/\s/.test(row.stakeholder)&&!/(lead|director|executive|officer|manager|stakeholder|team|practice|agency)/i.test(row.stakeholder)){
      row.stakeholder=row.title_or_type||"Stakeholder to be confirmed";
      row.verification_status="To be validated";
    }
  }

  // Remove unusable source placeholders instead of printing fake citations.
  result.sources=result.sources.filter(row=>row&&typeof row==="object"&&url(row.url)&&!/^unverified$/i.test(String(row.title||"").trim()));

  const findings=[];
  const required={
    corporate_profile:["dimension","verified_fact_or_context","analysis"],
    trends:["headline","significance","affected_markets","partnership_implication"],
    value_proposition:["capability","partner_or_client_value","commercial_or_mission_impact"],
    stakeholders:["stakeholder","influence","value_proposition","approach"],
    opportunities:["name","agency_or_customer","scope","appsec_need","motion"],
    executive_themes:["headline","why_it_matters"],
    headwinds_tailwinds:["type","development","effect","joint_action"],
    competitive_landscape:["category","entity_or_risk","differentiation_or_complementarity"]
  };
  for(const [section,fields] of Object.entries(required)){
    for(const [index,row] of result[section].entries()){
      const missing=fields.filter(field=>empty(row?.[field]));
      if(missing.length)findings.push({finding:`${section}[${index}] missing ${missing.join(", ")}`,status:"Needs verification",required_action:"Validate or complete before external use"});
    }
  }
  result.qa_findings=[...result.qa_findings,...findings];
  result.research_quality={version:"22.2.0",status:findings.length?"Needs verification":"Structurally complete",finding_count:findings.length};
  return result;
}

/* BLACKDUCK_RESEARCH_INTEGRITY_ENGINE_V22_3_0 */
function applyResearchIntegrityV2230(input){
  const result=(input&&typeof input==="object"&&!Array.isArray(input))?input:{};
  const sections=["corporate_profile","challenges","trends","opportunities","swot","value_proposition","partnership_framework","stakeholders","channel_plan","meeting_agenda","executive_themes","headwinds_tailwinds","competitive_landscape","account_strategy","immediate_actions","sources","claim_ledger","qa_findings"];
  const empty=v=>v===undefined||v===null||String(v).trim()==="";
  const placeholder=v=>/^(unverified|unknown|none|n\/a|null|undefined|to be validated)$/i.test(String(v||"").trim());
  const validUrl=v=>/^https?:\/\/[^\s]+$/i.test(String(v||"").trim());
  const clean=v=>String(v??"")
    .trim()
    .replace(/\bblack Duck\b/g,"Black Duck")
    .replace(/\bdHA\b/g,"DHA")
    .replace(/\brMF\b/g,"RMF")
    .replace(/\bsBOM\b/g,"SBOM")
    .replace(/\bsCA\b/g,"SCA")
    .replace(/\bfY(?=\d)/g,"FY")
    .replace(/\bq([1-4])\b/g,"Q$1")
    .replace(/Black Duck contributes provide\b/gi,"Black Duck contributes by providing")
    .replace(/Black Duck should respond by provide\b/gi,"Black Duck should respond by providing")
    .replace(/Black Duck should respond by leverage\b/gi,"Black Duck should respond by leveraging")
    .replace(/Black Duck should respond by position\b/gi,"Black Duck should respond by positioning")
    .replace(/Black Duck should respond by use\b/gi,"Black Duck should respond by using")
    .replace(/Black Duck can enter by provide\b/gi,"Black Duck can enter by providing")
    .replace(/The first action is identify\b/gi,"The first action is to identify")
    .replace(/The first action is demonstrate\b/gi,"The first action is to demonstrate")
    .replace(/Success should be measured through dHA\b/g,"Success should be measured by DHA")
    .replace(/\s+/g," ");

  const normalize=value=>{
    if(Array.isArray(value))return value.map(normalize);
    if(!value||typeof value!=="object")return typeof value==="string"?clean(value):value;
    for(const key of Object.keys(value))value[key]=normalize(value[key]);
    return value;
  };
  normalize(result);

  for(const section of sections){
    if(!Array.isArray(result[section]))result[section]=[];
    result[section]=result[section].filter(row=>{
      if(typeof row==="string")return !empty(row);
      return row&&typeof row==="object"&&Object.values(row).some(v=>!empty(v));
    });
  }

  const directSource=row=>Boolean(row&&validUrl(row.source_url));
  const evidence=row=>Boolean(row&&[row.evidence,row.exact_quote,row.verified_basis,row.verified_fact_or_context].some(v=>!empty(v)&&!placeholder(v)));
  const score=row=>directSource(row)&&evidence(row)?"High":directSource(row)||evidence(row)?"Medium":"Needs verification";
  const scored=["corporate_profile","challenges","trends","opportunities","value_proposition","stakeholders","executive_themes","headwinds_tailwinds","competitive_landscape","account_strategy"];

  for(const section of scored){
    for(const row of result[section]){
      if(!row||typeof row!=="object")continue;
      row.confidence=score(row);
      if(row.verification_status&&/verified/i.test(row.verification_status)&&!directSource(row))row.verification_status="To be validated";
    }
  }

  for(const row of result.opportunities){
    if(!row||typeof row!=="object")continue;
    row.classification=directSource(row)&&evidence(row)?"Verified Opportunity":directSource(row)||evidence(row)?"Supported Opportunity":"Analytical Opportunity";
    if(row.classification==="Analytical Opportunity"){
      row.status=row.status||"Prospective";
      row.qualification=row.qualification||"Analytical";
    }
    if(row.period&&(!directSource(row)||placeholder(row.period)))row.period="To be validated";
    if(row.timing&&(!directSource(row)||placeholder(row.timing)))row.timing="To be validated";
  }

  const role=/\b(lead|director|executive|officer|manager|architect|engineer|stakeholder|team|practice|agency|office|program)\b/i;
  for(const row of result.stakeholders){
    const name=String(row?.stakeholder||"").trim();
    if(name.includes(" ")&&!role.test(name)&&!directSource(row)){
      row.stakeholder=row.title_or_type||"Stakeholder to be confirmed";
      row.verification_status="To be validated";
      row.confidence="Needs verification";
    }
  }

  const seen=new Set();
  result.sources=result.sources.filter(row=>{
    if(!row||typeof row!=="object"||!validUrl(row.url)||empty(row.title)||placeholder(row.title)||placeholder(row.publisher))return false;
    const key=String(row.url).trim().toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);return true;
  });

  const required={
    corporate_profile:["dimension","verified_fact_or_context","analysis"],
    challenges:["title","description","affected_market","black_duck_opening"],
    trends:["headline","significance","affected_markets","partnership_implication"],
    opportunities:["name","agency_or_customer","scope","appsec_need","black_duck_entry","motion"],
    value_proposition:["capability","partner_or_client_value","commercial_or_mission_impact"],
    stakeholders:["stakeholder","influence","interest","value_proposition","approach"],
    executive_themes:["headline","why_it_matters"],
    headwinds_tailwinds:["type","development","effect","joint_action","measure"],
    competitive_landscape:["category","entity_or_risk","differentiation_or_complementarity"]
  };
  const findings=[];
  for(const [section,fields] of Object.entries(required)){
    for(const [index,row] of result[section].entries()){
      const missing=fields.filter(field=>empty(row?.[field]));
      if(missing.length)findings.push({finding:`${section}[${index}] missing ${missing.join(", ")}`,status:"Needs verification",required_action:"Complete or validate before external use"});
    }
  }

  const rows=scored.flatMap(section=>result[section]);
  const verified=rows.filter(row=>score(row)==="High").length;
  const supported=rows.filter(row=>score(row)==="Medium").length;
  const analytical=result.opportunities.filter(row=>row.classification==="Analytical Opportunity").length;
  const assumptions=rows.filter(row=>/assumption/i.test(String(row?.classification||row?.qualification||""))).length;
  const unresolved=Array.isArray(result.unresolved_questions)?result.unresolved_questions.filter(v=>!empty(v)).length:0;
  const total=verified+supported+analytical+assumptions;
  let quality=total?Math.round((verified*100+supported*65+analytical*35+assumptions*15)/total):0;
  quality=Math.max(0,Math.min(100,quality-Math.min(findings.length*2,30)));

  result.qa_findings=[...result.qa_findings,...findings];
  result.research_quality={version:"22.3.0",verified_claims:verified,supported_claims:supported,analytical_claims:analytical,assumptions,unresolved_questions:unresolved,source_count:result.sources.length,integrity_findings:findings.length,quality_score:quality,status:quality>=80?"Strong":quality>=60?"Usable with validation":"Needs research"};
  return result;
}

/* BLACKDUCK_FINAL_RESEARCH_QUALITY_FIX_V22_3_1 */
function applyResearchFinalizerV2231(input){
  const result=(input&&typeof input==="object"&&!Array.isArray(input))?input:{};
  const empty=v=>v===undefined||v===null||String(v).trim()==="";
  const placeholder=v=>/^(unverified|unknown|none|n\/a|null|undefined|to be validated)$/i.test(String(v||"").trim());
  const validUrl=v=>/^https?:\/\/[^\s]+$/i.test(String(v||"").trim());
  const clean=v=>String(v??"")
    .replace(/\bblack\s+duck\b/gi,"Black Duck")
    .replace(/\bdha\b/gi,"DHA")
    .replace(/\brmf\b/gi,"RMF")
    .replace(/\bsbom\b/gi,"SBOM")
    .replace(/\bsca\b/gi,"SCA")
    .replace(/\bdevsecops\b/gi,"DevSecOps")
    .replace(/\bguidepoint security\b/gi,"GuidePoint Security")
    .replace(/\bjustin naughton\b/gi,"Justin Naughton")
    .replace(/\bfy\s*(\d{2,4})\b/gi,"FY$1")
    .replace(/\bq\s*([1-4])\b/gi,"Q$1")
    .replace(/\bcontributes provide\b/gi,"contributes by providing")
    .replace(/\bcan enter by provide\b/gi,"can enter by providing")
    .replace(/\bcan enter by demonstrate\b/gi,"can enter by demonstrating")
    .replace(/\bshould respond by provide\b/gi,"should respond by providing")
    .replace(/\bshould respond by leverage\b/gi,"should respond by leveraging")
    .replace(/\bshould respond by position\b/gi,"should respond by positioning")
    .replace(/\bshould respond by use\b/gi,"should respond by using")
    .replace(/\bshould respond by conduct\b/gi,"should respond by conducting")
    .replace(/\bshould respond by utilize\b/gi,"should respond by utilizing")
    .replace(/\bthe first action is identify\b/gi,"the first action is to identify")
    .replace(/\bthe first action is validate\b/gi,"the first action is to validate")
    .replace(/\bthe first action is demonstrate\b/gi,"the first action is to demonstrate")
    .replace(/\bthe primary business value is ensures\b/gi,"the primary business value is ensuring")
    .replace(/\bthe expected mission and business impact is improves\b/gi,"the expected mission and business impact is improved")
    .replace(/\bsuccess should be measured through full\b/gi,"success should be measured by full")
    .replace(/\bthe recommended joint action is collaborate\b/gi,"the recommended joint action is to collaborate")
    .replace(/\s+/g," ")
    .trim();
  const normalize=value=>{
    if(Array.isArray(value))return value.map(normalize);
    if(!value||typeof value!=="object")return typeof value==="string"?clean(value):value;
    for(const key of Object.keys(value))value[key]=normalize(value[key]);
    return value;
  };
  normalize(result);

  const evidenceFields=row=>[row?.evidence,row?.exact_quote,row?.verified_basis,row?.verified_fact_or_context,row?.evidence_basis];
  const hasEvidence=row=>evidenceFields(row).some(v=>!empty(v)&&!placeholder(v));
  const hasSource=row=>validUrl(row?.source_url);
  const confidence=row=>hasSource(row)&&hasEvidence(row)?"High":hasSource(row)||hasEvidence(row)?"Medium":"Needs verification";

  const arrays=["corporate_profile","challenges","trends","opportunities","swot","value_proposition","partnership_framework","stakeholders","channel_plan","meeting_agenda","executive_themes","headwinds_tailwinds","competitive_landscape","account_strategy","immediate_actions","sources","claim_ledger","qa_findings"];
  for(const section of arrays)if(!Array.isArray(result[section]))result[section]=[];

  const scored=["corporate_profile","challenges","trends","opportunities","swot","value_proposition","partnership_framework","stakeholders","channel_plan","executive_themes","headwinds_tailwinds","competitive_landscape","account_strategy","immediate_actions"];
  for(const section of scored){
    for(const row of result[section]){
      if(!row||typeof row!=="object")continue;
      row.confidence=confidence(row);
      if(!hasSource(row)&&row.verification_status&&/verified/i.test(row.verification_status))row.verification_status="To be validated";
    }
  }
  if(result.strategic_vision&&Array.isArray(result.strategic_vision.pillars)){
    for(const row of result.strategic_vision.pillars)row.confidence=confidence(row);
  }

  // Claims about a named customer's priorities are analytical unless directly sourced.
  const customerPriority=/\b(DHA|customer|agency)\b.*\b(priorit|focus|need|require|plan|initiative)/i;
  for(const section of ["challenges","trends","opportunities","partnership_framework","executive_themes","headwinds_tailwinds","account_strategy"]){
    for(const row of result[section]){
      if(!row||typeof row!=="object"||hasSource(row))continue;
      for(const key of ["evidence","exact_quote","verified_basis","evidence_basis"]){
        if(row[key]&&customerPriority.test(row[key])&&!/^Analytical assessment:/i.test(row[key]))row[key]="Analytical assessment: "+row[key];
      }
      if(customerPriority.test(JSON.stringify(row)))row.confidence="Needs verification";
    }
  }

  // Opportunity integrity: no unsourced program names, dates, vehicles, or certainty.
  for(const row of result.opportunities){
    if(!row||typeof row!=="object")continue;
    if(hasSource(row)&&hasEvidence(row))row.classification="Verified Opportunity";
    else if(hasSource(row)||hasEvidence(row))row.classification="Supported Opportunity";
    else row.classification="Analytical Opportunity";
    if(row.classification!=="Verified Opportunity"){
      row.status=row.classification;
      row.period="To be validated";
      row.timing="To be validated";
      if(!hasSource(row))row.vehicle_or_path="To be validated";
    }
  }

  // Source list contains only usable, unique citations. Source rows themselves are verified metadata.
  const seen=new Set();
  result.sources=result.sources.filter(row=>{
    if(!row||typeof row!=="object"||!validUrl(row.url)||empty(row.title)||placeholder(row.title))return false;
    const key=String(row.url).trim().toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);
    row.confidence="Verified source metadata";
    return true;
  });

  // Avoid unsupported competitive names. Preserve the category and convert the entity to a validation question.
  for(const row of result.competitive_landscape){
    if(!row||typeof row!=="object")continue;
    if(!hasSource(row)&&row.entity_or_risk&&!placeholder(row.entity_or_risk)){
      row.entity_or_risk="Competitor set to be validated";
      row.confidence="Needs verification";
    }
  }

  // Quantified success measures require evidence; otherwise convert them to directional measures.
  for(const row of result.headwinds_tailwinds){
    if(!row||typeof row!=="object"||hasSource(row))continue;
    if(/\b\d+%|\b\d+\s+(contracts?|days?|systems?|applications?)\b/i.test(String(row.measure||"")))row.measure="Directional improvement; baseline and target to be validated";
  }

  // Rebuild quality metrics after final enforcement.
  const rows=scored.flatMap(section=>result[section]).filter(row=>row&&typeof row==="object");
  const verified=rows.filter(row=>confidence(row)==="High").length;
  const supported=rows.filter(row=>confidence(row)==="Medium").length;
  const needs=rows.filter(row=>confidence(row)==="Needs verification").length;
  const analytical=result.opportunities.filter(row=>row.classification==="Analytical Opportunity").length;
  const unresolved=Array.isArray(result.unresolved_questions)?result.unresolved_questions.filter(v=>!empty(v)).length:0;
  const total=Math.max(1,verified+supported+needs);
  let quality=Math.round((verified*100+supported*65+needs*20)/total);
  quality=Math.max(0,Math.min(100,quality));
  result.research_quality={...(result.research_quality||{}),version:"22.3.1",verified_claims:verified,supported_claims:supported,needs_verification_claims:needs,analytical_opportunities:analytical,unresolved_questions:unresolved,source_count:result.sources.length,quality_score:quality,status:quality>=80?"Strong":quality>=60?"Usable with validation":"Needs research"};
  return result;
}
async function ask(key,model,system,user){
 const r=await fetch("https://llm.core.blackduck.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,temperature:.12,response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content:user}]})});
 const raw=await r.text();if(!r.ok)throw new Error(`LLM gateway ${r.status}: ${raw.slice(0,1800)}`);const e=JSON.parse(raw),c=e?.choices?.[0]?.message?.content;if(!c)throw new Error("The LLM returned no content.");return applyResearchFinalizerV2231(applyResearchIntegrityV2230(applyResearchQualityGuard(normalizeResearchResult(JSON.parse(strip(c))))));
}
const RESEARCH_SHAPE=`{
 "subject_name":"", "research_type":"", "executive_summary":"", "decision":"", "why_now":"", "opening":"", "lighthouse":"", "primary_risk":"", "partnership_thesis":"",
 "partnership_objective":{"mutual_business_case":"","black_duck_value":"","subject_value":"","customer_outcome":""},
 "corporate_profile":[{"dimension":"","verified_fact_or_context":"","source_url":"","analysis":"","confidence":""}],
 "challenges":[{"title":"","description":"","affected_market":"","mission_environment":"","risk_class":"","evidence":"","exact_quote":"","source_url":"","black_duck_opening":"","confidence":""}],
 "trends":[{"headline":"","evidence":"","source_url":"","significance":"","affected_markets":"","partnership_implication":"","confidence":""}],
 "strategic_vision":{"strapline":"","pillars":[{"pillar":"","significance":"","evidence":"","source_url":"","missions":"","success_measures":"","black_duck_contribution":""}]},
 "opportunities":[{"name":"","agency_or_customer":"","business_unit":"","vehicle_or_path":"","role":"","value":"","period":"","status":"","scope":"","appsec_need":"","black_duck_entry":"","motion":"","timing":"","source_url":"","exact_quote":"","confidence":"","qualification":""}],
 "swot":[{"factor_type":"Strength|Weakness|Opportunity|Threat","factor":"","assessment":"","black_duck_response":""}],
 "value_proposition":[{"capability":"","verified_basis":"","source_url":"","partner_or_client_value":"","commercial_or_mission_impact":""}],
 "partnership_framework":[{"theme":"","strapline":"","problem":"","markets_or_missions":"","black_duck_capability":"","joint_offering":"","procurement_path":"","subject_benefit":"","black_duck_benefit":"","customer_outcome":"","evidence":"","source_url":"","first_action":""}],
 "stakeholders":[{"stakeholder":"","title_or_type":"","verification_status":"","source_url":"","influence":"","interest":"","value_proposition":"","approach":"","next_step":""}],
 "channel_plan":[{"period":"30|60|90|180","action":"","owner":"","desired_outcome":"","success_criterion":"","dependency":""}],
 "meeting_agenda":[{"time":"","topic":"","desired_output":"","questions":["",""]}],
 "executive_themes":[{"headline":"","why_it_matters":"","evidence":"","source_url":"","black_duck_relevance":"","questions":["",""] ,"objection":"","response":""}],
 "headwinds_tailwinds":[{"type":"Headwind|Tailwind","development":"","evidence":"","source_url":"","affected_areas":"","effect":"","black_duck_role":"","joint_action":"","measure":""}],
 "competitive_landscape":[{"category":"","entity_or_risk":"","evidence":"","source_url":"","differentiation_or_complementarity":""}],
 "account_strategy":[{"element":"","recommendation":"","evidence_basis":"","confidence":""}],
 "immediate_actions":[{"action":"","owner":"","timing":"","success_measure":""}],
 "thought_provoking_question":"",
 "sources":[{"title":"","publisher":"","date":"","url":"","used_for":""}],
 "claim_ledger":[{"claim":"","classification":"Verified Fact|Analysis|Recommendation|Assumption|Prospective Opportunity|Unresolved Question","source_url":"","date_verified":"","confidence":""}],
 "qa_findings":[{"finding":"","status":"","required_action":""}],
 "unresolved_questions":[""]
}`;

// Evidence-Bounded Research Pipeline v23
function evidenceBoundResearch(result,input,subjectName,streamName){
 const out=result&&typeof result==="object"?JSON.parse(JSON.stringify(result)):{};
 const trustedUrls=new Set();
 const scan=v=>{if(Array.isArray(v))return v.forEach(scan);if(v&&typeof v==="object")return Object.values(v).forEach(scan);if(typeof v==="string")for(const m of v.matchAll(/https?:\/\/[^\s"'<>]+/gi))trustedUrls.add(m[0].replace(/[),.;]+$/,""));};
 scan(input);
 const trusted=u=>typeof u==="string"&&trustedUrls.has(u.trim());
 let downgraded=0;
 const walk=v=>{
  if(Array.isArray(v))return v.forEach(walk);
  if(!v||typeof v!=="object")return;
  const url=String(v.source_url||"").trim(), ok=trusted(url);
  if(url&&!ok)v.source_url="";
  if(v.classification==="Verified Fact"&&!ok){v.classification="Assumption";downgraded++;}
  if(/high|verified/i.test(String(v.confidence||""))&&!ok){v.confidence="Needs verification";downgraded++;}
  if(v.verification_status&&!ok)v.verification_status="UNVERIFIED";
  if(v.status&&/active|confirmed|current|awarded|verified/i.test(String(v.status))&&!ok){v.status="Prospective Opportunity";downgraded++;}
  if(Object.prototype.hasOwnProperty.call(v,"verified_fact_or_context")&&!ok){const x=String(v.verified_fact_or_context||"").trim();if(x&&!/^UNVERIFIED\b/i.test(x))v.verified_fact_or_context=`UNVERIFIED: ${x}`;}
  Object.entries(v).forEach(([k,x])=>{if(k!=="source_url")walk(x)});
 };
 walk(out);
 if(Array.isArray(out.sources))out.sources=out.sources.filter(s=>trusted(String(s?.url||"")));
 if(Array.isArray(out.claim_ledger))out.claim_ledger=out.claim_ledger.map(c=>{const x={...c};if(!trusted(String(x.source_url||""))){x.source_url="";if(x.classification==="Verified Fact")x.classification="Assumption";if(/high|verified/i.test(String(x.confidence||"")))x.confidence="Needs verification";}return x;});
 const evidenceCount=trustedUrls.size;
 if(evidenceCount===0){
  const ctx=String(input?.known_context||"").trim();
  const obj=String(input?.meeting_objective||"").trim();
  const ctxSentence=ctx?`The supplied meeting context states: "${ctx}".`:"No substantive organization evidence was supplied.";
  out.executive_summary=`${subjectName} is the named ${streamName} for this meeting. ${ctxSentence} No external source evidence was supplied to this execution, so ownership status, capabilities, contracts, customer relationships, geographic presence, procurement access, and named initiatives remain to be validated. Black Duck alignment is analytical and intended to guide discovery, not to assert facts about ${subjectName}.`;
  out.decision="Proceed with discovery only. Validate the organization profile, relationships, capabilities, procurement position, and opportunity context before treating the research as account intelligence.";
  out.why_now=obj?`The current meeting objective is "${obj}." Use the meeting to validate evidence and determine whether a qualified Black Duck motion exists.`:"Use the meeting to validate evidence and determine whether a qualified Black Duck motion exists.";
  out.partnership_thesis=`A potential Black Duck motion may exist, but it cannot be qualified from the supplied evidence alone. Test the application-security, software-assurance, and software-supply-chain hypotheses directly with ${subjectName}.`;
 }
 const qa=Array.isArray(out.qa_findings)?out.qa_findings:[];
 qa.unshift({finding:`Evidence gate evaluated ${streamName}. Trusted supplied URLs: ${evidenceCount}. Unsupported verified/high-confidence fields downgraded: ${downgraded}.`,status:evidenceCount?"REVIEW REQUIRED":"UNRESOLVED",required_action:evidenceCount?"Confirm every material claim resolves to supplied evidence before customer use.":"Supply authoritative evidence or convert unsupported factual claims into validation questions."});
 out.qa_findings=qa;
 const unresolved=Array.isArray(out.unresolved_questions)?out.unresolved_questions:[];
 if(evidenceCount===0)unresolved.unshift(`What authoritative evidence establishes ${subjectName}'s organizational profile, capabilities, customer relationships, contracts, geographic presence, and procurement access?`);
 out.unresolved_questions=[...new Set(unresolved.filter(Boolean))];
 return out;
}
const FULL_PARTNER_FRAMEWORK=`You are a senior public-sector channel and alliance strategist with expertise in federal contracting, systems integrators, cybersecurity, application security, software-supply-chain security, DevSecOps, cloud modernization, artificial intelligence, data analytics, defense, intelligence, civilian agencies, and government healthcare.

You have been engaged by Black Duck to develop a strategic partner-channel relationship with the partner named in the user input. Your objective is to determine how Black Duck can help that partner win new public-sector business, strengthen existing programs, reduce delivery and compliance risk, and incorporate Black Duck application-security capabilities into solutions, proposals, contract vehicles, and customer programs. Approach the assignment from the perspective of the Black Duck representative responsible for building and managing the partner relationship. Focus on actionable partner-development intelligence: whom to approach, what value proposition to present, which opportunities to pursue, and how to establish a mutually beneficial go-to-market motion.

RESEARCH STANDARD
EVIDENCE SUFFICIENCY OVERRIDES COMPLETENESS
- Never create a factual statement merely to populate a required field or complete a requested section.
- Partner and prospective-client names are identifiers, not evidence of ownership, capabilities, relationships, contracts, geographic presence, procurement access, certifications, or market position.
- Supplied meeting context is evidence only for its literal content; do not strengthen it into broader relationship or market claims.
- Without supporting evidence, use UNVERIFIED or To be validated and create an unresolved question.
- Unsupported facts are prohibited from executive_summary, decision, why_now, opening, lighthouse, primary_risk, and partnership_thesis.

FINAL RESEARCH QUALITY RULES
- Customer-specific priorities, programs, initiatives, procurement paths, dates, targets, and named competitors require direct supporting evidence. Otherwise state them as analytical hypotheses or validation questions.
- Never describe an analytical opportunity as an active customer program.
- Do not assign High confidence without both direct evidence and a valid source URL.
- Do not create numeric success targets unless a baseline and target are supplied or sourced.
- Sources must directly support the claim for which they are cited; generic home pages are insufficient for specific program claims.
- Recommendations must use complete, grammatically correct executive prose.
RESEARCH INTEGRITY REQUIREMENTS
- Separate verified external facts from Black Duck analysis, recommendations, assumptions, and prospective opportunities.
- Do not label unsupported statements High confidence or Verified.
- Every named contract, program, customer priority, person, date, budget, quotation, and award requires a directly supporting source URL.
- Unsupported opportunities must be labeled Analytical Opportunity or Prospective Opportunity.
- Do not invent URLs, people, contracts, acquisition vehicles, fiscal periods, or customer priorities.
- Do not use generic vendor home pages as proof of specific claims.
- Prefer fewer well-supported findings over many generic findings.
- Use complete executive prose and correct capitalization for Black Duck, DHA, RMF, SBOM, SCA, FY, and Q1 through Q4.
- When evidence is unavailable, state the validation question rather than inventing an answer.
RESEARCH QUALITY AND EVIDENCE RULES
- Never claim web research occurred unless source content is actually available to this execution.
- Do not invent contracts, programs, budgets, dates, customer priorities, stakeholder names, quotations, vendors, or URLs.
- A direct source URL must support every material external fact, named person, date, contract, program, and quoted statement.
- If evidence is absent, classify the statement as Analysis, Recommendation, Assumption, Prospective Opportunity, or Unresolved Question. Do not label unsupported content High confidence or Verified.
- Do not use placeholder URLs or generic publisher home pages as proof of a specific claim.
- Prefer fewer well-supported rows over many generic rows.
- Separate verified facts from Black Duck recommendations.
- Use current fiscal periods only when evidence explicitly states them; otherwise omit the period or mark it To be validated.
- Write concise executive prose. Avoid repetitive claims, malformed capitalization, and fragments such as "provide tools" when a complete recommendation is required.
BLACKDUCK_MANDATORY_RESEARCH_COMPLETION_V22_1_2
MANDATORY COMPLETION REQUIREMENTS

Return the exact JSON shape requested. Do not return empty placeholder rows or empty strings for required analytical fields.

For each corporate_profile item, populate:
- dimension
- verified_fact_or_context
- analysis
- confidence
Use supplied meeting context when applicable. If no verified external fact is available, label the content UNVERIFIED and provide a useful analytical implication based only on supplied context. Do not invent a source URL.

For each trends item, populate:
- headline
- significance
- affected_markets
- partnership_implication
- confidence

For each stakeholder item, populate:
- stakeholder or role
- verification_status
- influence
- interest
- value_proposition
- approach
- next_step
Do not fabricate a person's name. Use a role such as GDIT Program Director or NIWC Cybersecurity Lead when a verified person is unavailable.

For each challenge, populate affected_market or mission_environment and black_duck_opening.
For each opportunity, populate agency_or_customer, status, scope, appsec_need, black_duck_entry, motion, and confidence.
For each partnership_framework item, populate subject_benefit, black_duck_benefit, and customer_outcome.
For each meeting_agenda item, populate desired_output.
For each executive_theme, populate why_it_matters.
For each headwind_tailwind, populate joint_action.
For each competitive_landscape item, populate entity_or_risk and differentiation_or_complementarity.

If a required value cannot be verified, use UNVERIFIED or To be validated as appropriate, then provide a clearly labeled analysis or recommendation. Never emit undefined, null, fabricated people, or empty required fields.
Use accurate, current information from authoritative public sources only when such source content is actually supplied to you or genuinely available through your execution environment. Do not claim that you searched the internet if you did not. Do not invent facts, relationships, contracts, quotations, customer needs, titles, values, dates, sources, or capabilities. Clearly distinguish Verified Fact, Analysis, Recommendation, Assumption, Prospective Opportunity, and Unresolved Question. Prioritize evidence published in the prior 12 months when available, but use older evidence for enduring contracts, organizational structures, acquisition vehicles, technologies, or strategic priorities. Every material fact, number, contract value, date, title, and quotation must have a direct source URL or be marked UNVERIFIED. Label opportunity entry points as analytical unless reliable evidence confirms Black Duck involvement.

STEP 1 - DEFINE THE PARTNERSHIP OBJECTIVE
Explain why Black Duck should pursue the relationship and why the partner may benefit. Evaluate how Black Duck could help the partner win and expand public-sector contracts; differentiate technical solutions and proposals; secure custom-developed and third-party software; manage open-source and software-supply-chain risk; operationalize secure software development; satisfy federal cybersecurity and software-security requirements; accelerate authority-to-operate processes; reduce delivery, compliance, and program-performance risks; support cloud, DevSecOps, AI, zero-trust, and digital-modernization programs; and create repeatable application-security offerings. Identify the strongest mutual business case.

STEP 2 - RESEARCH THE PARTNER AND BLACK DUCK
Analyze the most recent authoritative material supplied or genuinely accessible, including annual reports and SEC filings where applicable; partner website, leadership materials, press releases, alliances, awards, case studies, and thought leadership; Black Duck public product documentation, case studies, certifications, and public-sector resources; procurement databases and award announcements; agency budgets and acquisition forecasts; GAO, CISA, NIST, DoD, OMB, and agency material; GSA schedules, GWACs, IDIQs, OTAs, and other vehicles; federal software-security requirements; public teaming relationships; and credible industry reporting. Use this evidence as the foundation for all later analysis.

STEP 3 - BUILD A CORPORATE AND FEDERAL-MARKET PROFILE
Cover corporate structure and parent relationship; major units and operating groups; defense, intelligence, homeland security, civilian, and healthcare markets as applicable; principal agencies and mission areas; technology and service capabilities; geographic and delivery footprint; contract vehicles and procurement channels; major programs and recent awards; growth priorities; alliance ecosystem; verified executive, growth, capture, technology, and cybersecurity leadership; and role as prime, subcontractor, managed-service provider, reseller, adviser, and solution integrator. Use tables where effective.

STEP 4 - IDENTIFY MATERIAL BUSINESS AND DELIVERY CHALLENGES
Identify five to seven consequential challenges affecting the partner's ability to win, execute, or expand public-sector programs. For each capture title, description, affected unit or market, customer or mission environment, risk classification, supporting evidence, exact quotation when available, source URL, Black Duck opening, and confidence. Consider secure delivery, legacy modernization, supply-chain exposure, open-source governance, compliance, AI adoption, cloud migration, DevSecOps maturity, technical debt, tool consolidation, acquisition timelines, workforce, margins, and competition.

STEP 5 - IDENTIFY PUBLIC-SECTOR MARKET TRENDS
Identify the five most important forward-looking trends involving secure by design, SBOM, software-supply-chain security, CISA and NIST guidance, DoD software factories and DevSecOps, zero trust, cloud and application modernization, AI adoption and AI-software risk, continuous authorization, technical debt, workforce constraints, and platform consolidation. Provide evidence, significance, affected markets, and specific partnership implications.

STEP 6 - DEFINE STRATEGIC VISION AND SUCCESS MEASURES
Create one concise strapline and no more than five strategic pillars. For each explain significance, evidence, relevant missions, likely success measures, and Black Duck contribution. Include measures such as contract wins, backlog, revenue growth, recompete retention, delivery performance, compliance outcomes, modernization milestones, security improvements, adoption, operating efficiency, and services revenue, but only where applicable.

STEP 7 - MAP CURRENT AND EMERGING OPPORTUNITIES
Build a current and next-fiscal-year map of programs, awards, recompetes, vehicles, modernization initiatives, and likely pipeline opportunities. Include program, agency, business unit, vehicle, known or likely role, public value or ceiling, period, status, mission and technical scope, AppSec need, Black Duck entry, teaming motion, timing, source, quotation, confidence, and qualification status. Do not characterize an opportunity as confirmed without reliable evidence. Mark analytical or prospective entries visibly.

STEP 8 - CONDUCT A PARTNERSHIP SWOT
Focus the SWOT specifically on the partner's ability to benefit from and commercialize a Black Duck relationship. Include response actions for each strength, weakness, opportunity, and threat.

STEP 9 - ESTABLISH BLACK DUCK'S PARTNER VALUE PROPOSITION
Use verified Black Duck capabilities relevant to SCA, SAST, DAST, open-source governance, SBOM, software-supply-chain risk, vulnerability prioritization, malware or malicious-component detection only where verified, policy enforcement, developer enablement, CI/CD, ASPM, cloud-native development, federal compliance support without claiming automatic compliance, risk reporting, AI-assisted development, and enterprise deployment. Explain how each capability could improve win probability, proposal differentiation, delivery performance, compliance evidence, margins, customer outcomes, or expansion. Do not attribute unsupported capabilities.

STEP 10 - DESIGN THE STRATEGIC PARTNERSHIP FRAMEWORK
Create up to five core themes. For each include theme, executive strapline, business problem, markets or missions, Black Duck capability, joint offering, potential procurement path, benefit to partner, benefit to Black Duck, customer outcome, evidence, and first action. Align themes to the partner's role, growth strategy, contracts, captures, delivery responsibilities, compliance obligations, and revenue model.

STEP 11 - DEVELOP THE CHANNEL-DEVELOPMENT PLAN
Create a 30-, 60-, 90-, and 180-day plan addressing stakeholder mapping, internal Black Duck alignment, partner intelligence, executive sponsorship, onboarding, technical enablement, seller and architect training, joint account mapping, incumbent programs and captures, lighthouse selection, joint solution development, proposal support, contracting and reseller considerations, marketing, pipeline governance, rules of engagement, opportunity registration and attribution, forecasting, and QBRs. Every action needs owner, desired outcome, measurable success criterion, dependency, and period.

STEP 12 - MAP RELEVANT STAKEHOLDERS
Include executive leadership, growth and BD, sector and division leaders, technology and innovation, cybersecurity, development and DevSecOps, architects, capture managers, program managers, alliance personnel, contracts and procurement, and priority-account leaders. Verify every named person's current title from a recent authoritative source. Do not infer emails. Classify influence, interest, value proposition, approach, and desired next step.

STEP 13 - PREPARE THE INITIAL PARTNER MEETING
Create a 45-minute agenda with desired outcomes, concise Black Duck introduction, partner growth and delivery priorities, partnership themes, target programs, technical and compliance alignment, lighthouse opportunity, enablement requirements, and agreed next steps. Provide two incisive discovery questions for each item.

STEP 14 - CREATE EXECUTIVE DISCUSSION THEMES
Create five commercially relevant themes for Black Duck and partner executives. Include provocative but credible headline, why it matters, evidence, Black Duck relevance, two executive questions, likely objection, and concise response.

STEP 15 - ANALYZE HEADWINDS AND TAILWINDS
Identify five headwinds and five tailwinds over the next five years. For each provide underlying development, evidence, affected customers and business areas, effect on wins, delivery, revenue, cost, risk, or differentiation, Black Duck role, joint action, and measurable outcome.

STEP 16 - ASSESS COMPETITIVE AND PARTNER LANDSCAPE
Identify application-security competitors only with reliable evidence; existing public alliances; hyperscalers and platforms; competing federal integrators; government-developed alternatives; bundled-platform risks; procurement or reseller conflicts; and areas where Black Duck complements rather than displaces existing relationships. Do not make unsupported competitor claims.

STEP 17 - PRODUCE THE RECOMMENDED PARTNER ACCOUNT STRATEGY
Conclude with the three strongest reasons to partner, three reasons to delay or decline, best organization or market to approach, ideal executive sponsor type, ideal technical sponsor type, first three qualified opportunity types, lighthouse use case, partner-specific value proposition, proposed joint solution, opening message, desired first-meeting outcome, 90-day plan, 12-month pipeline objective only if defensible, success metrics, and clear go/no-go criteria.

STEP 18 - QUALITY ASSURANCE
Verify every material fact, number, title, value, date, and quotation against a source. Prefer primary sources. Identify facts not independently confirmed. Separate facts from inference. Flag stale, inconsistent, or contradictory information. Identify assumptions requiring partner confirmation. Never imply an existing Black Duck relationship or nonpublic access unless supplied and verified. Never claim Black Duck satisfies a federal requirement without evidence. Summarize evidence gaps and anomalies. Populate a claim ledger.

REQUIRED PARTNER DELIVERABLE ORDER
Executive summary; corporate and federal-market profile; challenges and trends; opportunity and contract map; partnership SWOT; partner-specific Black Duck value proposition; partnership framework; stakeholder map; 30/60/90/180-day plan; meeting agenda and discovery questions; executive themes; headwinds and tailwinds; competitive and partner landscape; account strategy; immediate actions; source list; claim ledger; QA findings and unresolved questions.

Return JSON only using this exact schema: ${RESEARCH_SHAPE}`;

const FULL_CLIENT_FRAMEWORK=`You are an expert strategy partner in the named prospective client's industry and in cybersecurity, software assurance, data breaches, digital transformation, cloud, AI, data science, digital technologies, operations, quality assurance, client acquisition, retention, and expansion. You have been engaged to assess how Black Duck can enable and support the prospective client's mission, business, and market-expansion goals. Adapt your industry expertise to the actual organization named in the user input. Do not mention Boeing unless Boeing is the named prospective client.

RESEARCH STANDARD
EVIDENCE SUFFICIENCY OVERRIDES COMPLETENESS
- Never create a factual statement merely to populate a required field or complete a requested section.
- Partner and prospective-client names are identifiers, not evidence of ownership, capabilities, relationships, contracts, geographic presence, procurement access, certifications, or market position.
- Supplied meeting context is evidence only for its literal content; do not strengthen it into broader relationship or market claims.
- Without supporting evidence, use UNVERIFIED or To be validated and create an unresolved question.
- Unsupported facts are prohibited from executive_summary, decision, why_now, opening, lighthouse, primary_risk, and partnership_thesis.

Provide precise answers using up-to-date public information only when that information is supplied or genuinely accessible through your execution environment. Do not claim internet or private-data access you do not have. Do not invent answers. Prefer evidence from the prior 12 months when available, while retaining older enduring facts when necessary. Every material fact, number, project, budget, title, date, and quotation requires a direct source URL or must be marked UNVERIFIED. Separate Verified Fact, Analysis, Recommendation, Assumption, Prospective Opportunity, and Unresolved Question.

STEP 1 - STRATEGIC RELATIONSHIP
Focus on the prospective client's potential need for a strategic relationship with Black Duck and the business or mission outcomes that relationship could enable.

STEP 2 - RESEARCH FOUNDATION
Analyze the latest supplied or genuinely accessible company, agency, industry, market, compliance, AI, data, digital, cloud, cybersecurity, and Black Duck reports and evidence. Use that research as the factual foundation for all later answers.

STEP 3 - CORPORATE, MISSION, AND MARKET OVERVIEW
Provide an overview of the prospective client's corporate, government, consumer, commercial, defense, or mission segments as applicable. Explain key needs, goals, strategies, products, services, programs, divisions, geographies, operating context, customer groups, and market dynamics. Do not force private-sector categories onto a government agency. Use tables where useful.

STEP 4 - MATERIAL PAIN POINTS
Identify five to seven material pain points found in the evidence. Include title, description, affected business or mission area, classification as operating-cost impact, growth impact, delivery risk, cybersecurity risk, supply-chain risk, compliance risk, quality risk, workforce risk, reputational risk, or other, supporting evidence, exact quotation when available, source URL, Black Duck relevance, and confidence.

STEP 5 - FORWARD-LOOKING INDUSTRY TRENDS
Identify five relevant forward-looking trends. Provide headline, evidence, source, summary, why it matters to the organization and its industry or mission, and implication for Black Duck.

STEP 6 - STRATEGIC VISION AND MEASURES
Create a strategic-vision strapline and up to five pillars. Explain each pillar and identify measurable indicators of success supported by evidence or clearly labeled analysis.

STEP 7 - PROJECTS AND INITIATIVES
Map projects or initiatives planned for the current and next financial or fiscal year when supported. Include description, division or mission owner, intended outcomes, public budget or value if stated, status, evidence, exact quote, source URL, application-security implications, and confidence. Mark inferred initiatives clearly.

STEP 8 - SWOT
Create an evidence-based SWOT for the organization in its actual industry or mission environment.

STEP 9 - WHY BLACK DUCK
Explain why Black Duck may be an appropriate partner using verified public Black Duck capabilities and use cases. Focus on software assurance, SCA, SAST, DAST, open-source governance, SBOM, supply-chain risk, prioritization, policy, developer enablement, CI/CD, ASPM, cloud-native development, AI-assisted development, federal or regulated-environment needs, reporting, and deployment models. Do not claim unsupported capabilities, compliance, or outcomes.

STEP 10 - STRATEGIC RELATIONSHIP THEMES
Create up to five themes with strapline, client problem, Black Duck approach, alignment to supply chain, quality, mission, revenue, strategic pillars, and priorities, measurable outcome, evidence, and first action.

STEP 11 - INTRODUCTORY MEETING AGENDA
Create an introductory meeting agenda including every theme. For each item identify desired output and two key questions grounded in the prospective client's strategic outcomes.

STEP 12 - THOUGHT-PROVOKING QUESTION
Provide one open question that helps a human refine and deepen the opportunity and create a stronger proposition.

STEP 13 - QUALITY ASSURANCE AND FIVE-YEAR FORCES
Check every number and quotation against sources. Identify five headwinds and five tailwinds the organization must manage over five years. Provide evidence, consequences, Black Duck mitigation or acceleration, joint action, and measure.

STEP 14 - CEO-LEVEL DISCUSSION THEMES
Create five compelling, insightful, and provocative themes with two supporting questions each for a Black Duck executive to ask the prospective client's appropriate executive. Include evidence, why the theme matters, Black Duck relevance, likely objection, and response.

STEP 15 - DETAILED HEADWIND AND TAILWIND RESPONSE AND ANOMALIES
Explain specifically how Black Duck can mitigate each headwind and accelerate each tailwind. Review the answer against the available evidence. Identify stale, contradictory, unsupported, or anomalous claims and summarize them.

REQUIRED CLIENT DELIVERABLE ORDER
Executive summary; organization and market profile; material pain points; industry trends; strategic vision and measures; projects and initiatives; SWOT; Black Duck relevance; relationship themes; meeting agenda; executive themes; headwinds and tailwinds; competitive or alternative landscape; recommended client strategy; immediate actions; thought-provoking question; sources; claim ledger; QA findings and anomalies.

Return JSON only using this exact schema: ${RESEARCH_SHAPE}`;

const RECONCILIATION_FRAMEWORK=`You are the research quality and synthesis partner. Reconcile the full partner-channel research and full prospective-client research before any call script or deliverable is created.

Your duties:
1. Preserve the distinct purpose of each stream: partner research explains relationship, access, economics, capture, delivery, and go-to-market; client research explains the prospective client's mission or business, pain points, trends, initiatives, executive context, and forces.
2. Remove exact and semantic duplicates. Consolidate overlapping challenges, trends, opportunities, agendas, stakeholders, actions, SWOT factors, themes, sources, and QA findings into the richer entry.
3. Resolve contradictions where evidence permits; otherwise retain both views and flag the conflict.
4. Reject or visibly label unsupported claims, fabricated sources, unsupported precise values, and statements that imply research access not available.
5. Preserve source URLs, quotations, confidence, claim classifications, qualification labels, evidence gaps, and anomalies.
6. Identify the intersection: where partner access and delivery capability align with verified client priorities and a relevant Black Duck capability.
7. Produce one coherent research object suitable for the Account Plan and Strategy Brief. Do not merely concatenate arrays.

Return JSON only using exactly this schema: ${RESEARCH_SHAPE}`;

const CALL_FRAMEWORK=`You are a senior Black Duck public-sector partner sales engineer. Create a practical live discovery call only after reviewing the original meeting input, the complete full partner research, the complete full prospective-client research, and the reconciled research.

The prepared call must:
- Lead with mission or business outcomes, executive risk, partner economics, capture differentiation, delivery risk, and consequences of failure.
- Use verified data and clearly labeled hypotheses from the research.
- Never present an unresolved question, assumption, unqualified opportunity, unsupported claim, or stale item as fact.
- Translate the strongest research findings into Data -> Insight -> Question openings.
- Validate the partner role, client priorities, stakeholder map, relevant initiatives, procurement path, deployment constraints, and proposed lighthouse.
- Select only relevant Black Duck capabilities after the problem and outcome are established.
- Avoid a generic product overview unless that is explicitly the meeting objective.
- Fit the requested meeting duration and produce a natural conversational flow.
- Include next-step commitments with owners and a specific decision the next session should enable.


COMPLETE BLACK DUCK DISCOVERY DECISION FRAMEWORK
Use the following framework when selecting discovery questions and solution paths.

Coverage rule: If the supplied meeting input and reconciled research do not provide enough evidence to narrow the solution space, do not default to SCA or BDBA. Include a concise guided-discovery path covering every product family: Black Duck SCA, BDBA, Coverity, Polaris, Seeker, Defensics, Software Risk Manager, Code Sight, Polaris Assist, Signal, ContextAI, and Continuous Dynamic. Once answers qualify or disqualify paths, focus the later questions.

Ask in this logical order:
1. OUTCOME: What are they trying to secure or improve: open source and supply chain, third-party binaries, proprietary code, developer feedback, running applications and APIs, protocols and devices, enterprise posture, AI-assisted development, analyst triage, or deployment compliance?
2. WORKLOAD AND ACCESS: What artifact exists and what access is available: source, build, package manifests, binaries, firmware, containers, supplier SBOMs, running application, API specification, test traffic, or no internal access?
3. TESTING PERSPECTIVE: Do they need component discovery, static code analysis, external attacker testing, runtime internal dataflow, malformed-input robustness, portfolio governance, or AI-development controls?
4. DEPTH AND TIMING: Is feedback needed in the IDE, before commit, at pull request, in CI/CD, before release, during QA, against production-like targets, or continuously after release?
5. DEPLOYMENT AND DATA BOUNDARY: Can code and findings use SaaS, must they remain on premises, are workloads disconnected or classified, or is a hybrid model required?
6. GOVERNANCE AND ACTION: How are policies enforced, findings prioritized, issues assigned, SBOMs operationalized, evidence reported, and risk presented to leadership?
7. VALIDATION: Confirm primary solution, adjacent complementary products, excluded alternatives, deployment fit, success measures, owner, and next action.

Product branches and qualification questions:
- Black Duck SCA: source/package/signature/container/SBOM/license/policy/continuous open-source monitoring. Ask about package managers, copied or vendored code, containers, SBOM formats, license review, policies, and post-release monitoring.
- BDBA: binaries, firmware, supplier software, or no source/build access. Ask whether binaries can be obtained, whether supplier SBOMs must be validated, and whether firmware or acquired software is in scope.
- Coverity: deep proprietary-code security and quality analysis, especially release-grade or restricted deployments. Ask about languages, build systems, escaped security defects, quality defects, and required analysis depth.
- Polaris: SaaS delivery of SAST, SCA, DAST and application-level governance. Ask which workloads may use SaaS, which testing types are needed, how repositories are onboarded, and whether common policy/reporting is required.
- Seeker: IAST and internal runtime dataflow during QA or functional tests. Ask whether applications can be instrumented, whether findings are hard to reproduce, and whether actual runtime paths are required.
- Defensics: protocol, device, API and robustness fuzzing. Ask which interfaces are mission critical, how malformed input is tested, and what safety controls are required for negative testing.
- Software Risk Manager: ASPM, third-party finding aggregation, prioritization, portfolio governance and executive reporting. Ask how many scanners remain, what application context exists, and which metrics leadership needs.
- Code Sight: IDE security feedback for supported developer workflows. Ask when developers first receive feedback and whether IDE-based guidance is required.
- Polaris Assist: governed AI-assisted triage in Polaris. Ask where manual SAST triage is the bottleneck and which findings consume analyst time.
- Signal: agentic, incremental, language-agnostic security for human and AI-generated changes. Ask which coding assistants and languages are in use, whether pre-commit feedback is actionable, and how exploitability/noise is handled.
- ContextAI: security knowledge grounding for AI-enabled analysis and recommendations. Ask how AI recommendations are validated and where trusted security context is required.
- Continuous Dynamic: external DAST and API testing against running targets. Ask testing frequency, authentication, API scope, target reachability, and whether an external attacker perspective is required.

Solution relationship rules:
A. COMPLEMENTARY LAYERS: SCA plus SAST; SAST/SCA plus DAST; DAST plus Seeker when both external evidence and internal runtime context are needed; Defensics plus AST for protocol/API robustness; Software Risk Manager plus retained scanners for portfolio governance; Signal or Code Sight plus deeper pipeline/release analysis; BDBA plus source-based SCA when both supplier binaries and internally developed software exist.
B. OVERLAPPING DELIVERY CHOICES: Black Duck SCA versus Polaris SCA; Coverity versus Polaris SAST; Continuous Dynamic versus Polaris DAST; Code Sight versus Signal developer feedback; Software Risk Manager versus Polaris consolidation/reporting. These can coexist in a hybrid portfolio, but do not recommend duplicate coverage without a clear boundary, migration reason, or governance requirement.
C. ACCESS-DRIVEN ALTERNATIVES: BDBA is the primary branch when source/build access is unavailable; source-based SCA is primary when source/build access is available and deep component discovery is needed. Seeker requires instrumentation and a QA/testing path; external DAST does not. SaaS choices are excluded for workloads that cannot send code or findings outside the controlled environment.
D. EMBEDDED/DEPENDENT CAPABILITIES: Polaris Assist is used with Polaris; ContextAI provides security knowledge grounding used by AI-enabled experiences. Present them in the context of the workflow they support, not as unsupported stand-alone replacements.

Output requirements for discovery_paths:
- Include phase, objective, qualifying signal, disqualifying signal, primary product, complementary products, overlapping alternatives, relationship type, rationale, questions, follow-up-if-yes, follow-up-if-no, and next validation question.
- If evidence is insufficient, set discovery_coverage_mode to "Full portfolio" and include at least one differentiating question for all twelve products.
- If evidence is sufficient, set discovery_coverage_mode to "Focused" and include excluded_products with the evidence-based reason each was excluded.
- Never infer that SCA or BDBA is primary merely because open-source or binary language appears in notes; qualify the broader objective, workload, access, timing, deployment, and governance first.


PRESENTER SCRIPT REQUIREMENT
Every agenda item must include a complete, ready-to-say presenter script in talk_track. Do not return headings, fragments, implementation notes, or an empty talk_track. Each script must connect the meeting objective to the synthesized research, explain why the topic matters, transition naturally into the questions, and avoid unsupported claims. Use short paragraphs suitable for speaking aloud. The executive opening and every agenda talk_track are mandatory.

ADAPTIVE QID AND WHY-NOW FRAMEWORK
Discovery questions must change based on the original meeting input, full partner research, full prospective-client research, and reconciled research. Do not reuse generic questions when the research provides a more specific, evidence-grounded setup.

QID means Question, Insight, Data. For every material discovery sequence return:
- category: the business or technical area being explored.
- data: a verified fact, supplied meeting fact, client initiative, mandate, deadline, program, technology change, risk event, acquisition event, operating constraint, or clearly labeled hypothesis. Never invent an event.
- important_event: the dated or current event that creates urgency. If no verified event exists, say "No verified triggering event supplied".
- outrage_or_consequence: the unacceptable consequence, exposure, delay, cost, mission impact, compliance burden, lost opportunity, or delivery risk. Use neutral executive language; do not manufacture emotional outrage.
- insight: what the data and event imply for the client, partner, or delivery model.
- why_now: why action or clarification is timely now. If urgency is not evidenced, state that it must be validated.
- setup: two or three spoken sentences that connect Data -> Important Event -> Consequence -> Insight -> Why Now.
- question: one open, incisive question that follows naturally from the setup.
- follow_up_if_yes and follow_up_if_no.
- primary_product, complementary_products, overlapping_alternatives, and exclusion_logic only after the question qualifies the need.

Every partner call must include a category named "Client Current State and Activity". Its purpose is to understand, to the extent known by the partner:
1. What the client is doing now.
2. Active programs, initiatives, evaluations, modernization efforts, software factories, application portfolios, acquisition activity, or mandates.
3. What changed recently and which important event created urgency.
4. Who owns the mission, technical workflow, budget, procurement path, and decision.
5. Current tools, processes, deployment boundaries, evidence requirements, and known gaps.
6. What the partner knows directly versus what remains hypothesis.
7. What successful action would look like and by when, only where timing is supplied or verified.

Required client-current-state QID sequence:
- Data: summarize the strongest available client fact or state "Client activity is not yet verified."
- Important event: identify the research-supported trigger or state that it is unknown.
- Consequence: state the research-supported risk of inaction or the consequence that must be validated.
- Insight: explain what this could mean for the partner and Black Duck.
- Why now: articulate evidence-supported urgency or explicitly ask the partner to establish it.
- Question: ask the partner what the client is actively doing, what changed, and what decision or outcome is now required.

Question-selection rule:
- If research is rich, tailor the setup and question to named, sourced client initiatives and known constraints.
- If research is incomplete, use broad questions across the full portfolio and explicitly separate known facts from hypotheses.
- Never narrow to SCA/BDBA solely because notes mention SBOMs, binaries, or lack of source. First qualify client activity, desired outcome, workload, access, testing perspective, timing, deployment boundary, governance, and decision process.
- Ensure the final question set can drive to a primary solution, complementary layers, overlapping delivery choice, or evidence-based exclusion.

Every agenda time value must be numeric or a range without a unit, such as "0-5". The UI appends "mins" exactly once.

NUMBERED SALES STAGES AND MEDDPICC V16
Assign the call one primary numbered sales stage and tailor all discovery questions to that stage:
1. Intro and Alignment: establish client current state, important event, desired outcome, partner role, and permission for deeper discovery.
2. Business Discovery: identify pain, consequences, metrics, executive priorities, client activity, and why now.
3. Technical Discovery: qualify workload, source/build access, testing perspective, depth, timing, integrations, deployment boundary, governance, primary solution, adjacent solutions, alternatives, and exclusions.
4. Demonstration Planning: define personas, use cases, workflow, data, environment, proof points, objections, and decision criteria the demonstration must address.
5. Proof of Value or Evaluation: define bounded scope, success metrics, technical and business acceptance criteria, owners, evidence, schedule, risks, and exit decision.
6. Proposal and Procurement: validate commercial scope, economic buyer, decision criteria, decision process, paper process, security/legal reviews, partner transaction path, and competition.
7. Close and Expansion: confirm final decision, remaining gaps, signatures, implementation handoff, adoption metrics, expansion path, and next commitment.

Use MEDDPICC as a qualification overlay, not a rigid interrogation checklist:
- Metrics: quantified mission, risk, cost, time, quality, productivity, or compliance outcomes. Do not invent numbers.
- Economic Buyer: person or role with discretionary budget or final approval authority.
- Decision Criteria: technical, business, security, deployment, procurement, and partner requirements.
- Decision Process: stakeholders, sequence, evaluation, approval, and timing.
- Paper Process: procurement, legal, security, contracting, vehicle, reseller, and signature workflow.
- Identify or Implicate Pain: current problem, consequence, cost of inaction, mission impact, and why now.
- Champion: internal advocate with influence, access, and a reason to drive change.
- Competition: named vendors when verified, incumbent tools, internal build, status quo, or no decision.

Stage behavior:
- Stages 1-2 emphasize client current state, pain, important event, consequence, metrics, economic buyer hypothesis, champion hypothesis, and why now. Avoid premature product selection.
- Stage 3 emphasizes the Black Duck hierarchical discovery paths and full portfolio coverage when evidence is insufficient.
- Stage 4 uses confirmed pain and decision criteria to determine what the demo must prove.
- Stage 5 converts criteria into measurable evaluation success and exit criteria.
- Stage 6 emphasizes decision process, paper process, economic buyer, competition, and partner transaction path.
- Stage 7 emphasizes unresolved criteria, final approvals, implementation, adoption, and expansion.

Required structured output additions:
- sales_stage: {number, name, rationale, exit_criteria}
- meddpicc: eight objects named metrics, economic_buyer, decision_criteria, decision_process, paper_process, identify_pain, champion, competition. Each object contains status (Unknown, Hypothesis, Partially Validated, Validated), known, gaps, and questions.
- Every QID item must include sales_stage_number and meddpicc_elements.
- Every discovery path must include sales_stage_number and stage_objective.
- Include at least one question about Client Current State and Activity at stages 1-3.
- Never present a hypothesis as validated.
Return JSON only:
{"sales_stage":{"number":1,"name":"Intro and Alignment","rationale":"","exit_criteria":[""]},"meddpicc":{"metrics":{"status":"Unknown","known":"","gaps":[""],"questions":[""]},"economic_buyer":{"status":"Unknown","known":"","gaps":[""],"questions":[""]},"decision_criteria":{"status":"Unknown","known":"","gaps":[""],"questions":[""]},"decision_process":{"status":"Unknown","known":"","gaps":[""],"questions":[""]},"paper_process":{"status":"Unknown","known":"","gaps":[""],"questions":[""]},"identify_pain":{"status":"Unknown","known":"","gaps":[""],"questions":[""]},"champion":{"status":"Unknown","known":"","gaps":[""],"questions":[""]},"competition":{"status":"Unknown","known":"","gaps":[""],"questions":[""]}},"title":"","meeting_thesis":"","desired_outcomes":[""],"opening_talk_track":"","agenda":[{"minutes":"0-5","topic":"","talk_track":"","questions":["",""]}],"discovery_coverage_mode":"Full portfolio or Focused","excluded_products":[{"product":"","reason":""}],"discovery_paths":[{"phase":"","objective":"","customer_signal":"","disqualifying_signal":"","capability":"","primary_product":"","products":[""],"complementary_products":[""],"overlapping_alternatives":[""],"relationship_type":"Complementary|Overlapping delivery choice|Access-driven alternative|Embedded capability","questions":["","",""],"why_it_matters":"","follow_up_if_yes":"","follow_up_if_no":""}],"data_insight_questions":[{"category":"","data":"","classification":"Verified Fact|Supplied Fact|Analysis|Hypothesis","source_url":"","important_event":"","outrage_or_consequence":"","insight":"","why_now":"","setup":"","question":"","follow_up_if_yes":"","follow_up_if_no":"","primary_product":"","complementary_products":[""],"overlapping_alternatives":[""],"exclusion_logic":""}],"partner_value_hypotheses":[{"hypothesis":"","research_basis":"","validation_question":""}],"likely_objections":[{"objection":"","response":""}],"recommended_next_step":"","facts_to_verify":[""],"facilitator_notes":[""]}`;

module.exports=function(app,db){
 db.exec(`CREATE TABLE IF NOT EXISTS prep_query_audit(id INTEGER PRIMARY KEY AUTOINCREMENT,call_prep_id INTEGER NOT NULL,stage TEXT NOT NULL,system_query TEXT NOT NULL,user_query TEXT NOT NULL,response_json TEXT NOT NULL,model TEXT,created_date TEXT DEFAULT CURRENT_TIMESTAMP);`);
 const columns=db.prepare("PRAGMA table_info(call_prep_results)").all().map(x=>x.name);
 for(const [name,type] of [["partner_research_json","TEXT"],["client_research_json","TEXT"],["combined_research_json","TEXT"]])if(!columns.includes(name))db.exec(`ALTER TABLE call_prep_results ADD COLUMN ${name} ${type}`);
 app.post("/api/audited-partner-client-prep/generate",async(req,res)=>{
  try{
   const input=normalizeMeetingInput(req.body||{}),partner=String(input.partner_name||"").trim(),client=String(input.account_name||"").trim(),key=process.env.BLACKDUCK_LLM_API_KEY,model=process.env.BLACKDUCK_LLM_MODEL||"gpt-4o";
   if(!partner||!client)return res.status(400).json({error:"Partner and prospective client are required."});
   const original=JSON.stringify(input,null,2);
   const partnerUser=`NAMED PARTNER: ${partner}\nNAMED PROSPECTIVE CLIENT: ${client}\nBLACK DUCK PRESENTER: ${input.presenter||"Justin Naughton"}\n\nMEETING INPUT AND SUPPLIED EVIDENCE:\n${original}`;
   const partnerResearchRaw=await ask(key,model,FULL_PARTNER_FRAMEWORK,partnerUser);
   const partnerResearch=evidenceBoundResearch(partnerResearchRaw,input,partner,"partner");
   const clientUser=`NAMED PROSPECTIVE CLIENT: ${client}\nPARTNER INVOLVED: ${partner}\nBLACK DUCK PRESENTER: ${input.presenter||"Justin Naughton"}\n\nMEETING INPUT AND SUPPLIED EVIDENCE:\n${original}`;
   const clientResearchRaw=await ask(key,model,FULL_CLIENT_FRAMEWORK,clientUser);
   const clientResearch=evidenceBoundResearch(clientResearchRaw,input,client,"prospective client");
   const reconcileUser=`ORIGINAL MEETING INPUT:\n${original}\n\nFULL PARTNER-CHANNEL RESEARCH:\n${JSON.stringify(partnerResearch,null,2)}\n\nFULL PROSPECTIVE-CLIENT RESEARCH:\n${JSON.stringify(clientResearch,null,2)}`;
   const combinedRaw=await ask(key,model,RECONCILIATION_FRAMEWORK,reconcileUser);
   const combined=evidenceBoundResearch(combinedRaw,input,partner+" / "+client,"reconciled partner-client research");
   const callUser=`ORIGINAL MEETING INPUT:\n${original}\n\nFULL PARTNER RESEARCH:\n${JSON.stringify(partnerResearch,null,2)}\n\nFULL CLIENT RESEARCH:\n${JSON.stringify(clientResearch,null,2)}\n\nRECONCILED RESEARCH:\n${JSON.stringify(combined,null,2)}`;
   const call=await ask(key,model,CALL_FRAMEWORK,callUser);
   const q=db.prepare("INSERT INTO call_prep_results(partner_name,account_name,input_json,result_json,research_json,partner_research_json,client_research_json,combined_research_json,model) VALUES(?,?,?,?,?,?,?,?,?)").run(partner,client,JSON.stringify(input),JSON.stringify(call),JSON.stringify(combined),JSON.stringify(partnerResearch),JSON.stringify(clientResearch),JSON.stringify(combined),model);
   const id=Number(q.lastInsertRowid),audit=db.prepare("INSERT INTO prep_query_audit(call_prep_id,stage,system_query,user_query,response_json,model) VALUES(?,?,?,?,?,?)");
   audit.run(id,"1. Full partner-channel research (GDIT-derived 18-step framework)",FULL_PARTNER_FRAMEWORK,partnerUser,JSON.stringify(partnerResearch),model);
   audit.run(id,"2. Full prospective-client research (Boeing-derived 15-step framework)",FULL_CLIENT_FRAMEWORK,clientUser,JSON.stringify(clientResearch),model);
   audit.run(id,"3. Research reconciliation and semantic de-duplication",RECONCILIATION_FRAMEWORK,reconcileUser,JSON.stringify(combined),model);
   audit.run(id,"4. Research-informed call synthesis",CALL_FRAMEWORK,callUser,JSON.stringify(call),model);

   const count = db.prepare(`
    SELECT COUNT(*) AS n
    FROM prep_query_audit
    WHERE call_prep_id=?
   `).get(id).n;

   if(count !== 4){
     throw new Error(
       `Audit integrity failure. Expected 4 rows. Found ${count}.`
     );
   }
   res.json({id,model,result:call,partner_research:partnerResearch,client_research:clientResearch,combined_research:combined,frameworks:{partner:"Full GDIT-derived 18-step framework",client:"Full Boeing-derived 15-step framework",reconciliation:true}});
  }catch(error){res.status(500).json({error:error.message})}
 });
 app.get("/api/prep-query-audit/:id",(req,res)=>res.json(db.prepare("SELECT id,stage,system_query,user_query,response_json,model,created_date FROM prep_query_audit WHERE call_prep_id=? ORDER BY id").all(req.params.id).map(x=>({...x,response:JSON.parse(x.response_json)}))));
 app.delete("/api/prep-query-audit/:id",(req,res)=>{db.prepare("DELETE FROM prep_query_audit WHERE call_prep_id=?").run(req.params.id);res.json({success:true})});
 app.get("/api/research-frameworks",(req,res)=>res.json({partner:{name:"Full GDIT-derived public-sector partner-channel framework",steps:18,prompt:FULL_PARTNER_FRAMEWORK},client:{name:"Full Boeing-derived prospective-client framework",steps:15,prompt:FULL_CLIENT_FRAMEWORK},reconciliation:{name:"Research reconciliation and semantic de-duplication",prompt:RECONCILIATION_FRAMEWORK},call:{name:"Research-informed call synthesis",prompt:CALL_FRAMEWORK}}));
};










