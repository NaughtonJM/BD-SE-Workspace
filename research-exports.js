
/* BLACKDUCK_RECONCILED_RESEARCH_EXPORT_V22_1_3 */
function resolveExportResearch(source){

  const parse=value=>{
    if(!value)return null;
    if(typeof value==="object")return value;
    if(typeof value!=="string")return null;
    try{return JSON.parse(value);}catch{return null;}
  };
  const record=parse(source)||{};
  const preferred=parse(record.reconciled_research)
    ||parse(record.partner_research)
    ||parse(record.client_research)
    ||record;

  // Preserve report metadata while making the structured research fields
  // available at the top level expected by the DOCX/PPTX renderer.
  return {
    ...record,
    ...(preferred||{}),
    partner_name: record.partner_name || preferred?.partner_name || preferred?.subject_name || "",
    account_name: record.account_name || preferred?.account_name || "",
    post_meeting_intelligence: collectPostMeetingIntelligence(record),
    reconciled_research: preferred || {}
  };
}


/* BLACKDUCK_ACTIVE_RENDERER_ARTIFACT_PROPAGATION_V22_3_2_9 */
function collectPostMeetingIntelligence(value){
  const out=[]; const seen=new Set(); const visited=new WeakSet();
  const walk=v=>{
    if(v===undefined||v===null)return;
    if(typeof v==="string"||typeof v==="number"||typeof v==="boolean"){
      const s=String(v).trim(); if(s&&!/^(undefined|null)$/i.test(s)&&!seen.has(s)){seen.add(s);out.push(s);} return;
    }
    if(typeof v!=="object"||visited.has(v))return; visited.add(v);
    if(Array.isArray(v)){v.forEach(walk);return;}
    for(const [k,x] of Object.entries(v)){
      if(!/^(partner_research|client_research|reconciled_research|sources|citations)$/i.test(k))walk(x);
    }
  };
  walk(value); return out.join("\n");
}
/* BLACKDUCK_ACCOUNT_BRIEF_RENDERER_V22_1_0 */
function normalizeDeliverableRow(value){
  if(!value || typeof value!=="object" || Array.isArray(value)) return value;
  const x={...value};
  const first=(...vals)=>{
    for(const v of vals){
      if(v!==undefined && v!==null && String(v).trim() && !/^(undefined|null)$/i.test(String(v).trim())) return v;
    }
    return "";
  };

  // Normalize alternate research schemas before DOCX/PPTX rendering.
  x.partner_value=first(x.partner_value,x.partner_or_client_value,x.partner_benefit,x.value_to_partner);
  x.partner_or_client_value=first(x.partner_or_client_value,x.partner_value,x.client_value,x.customer_value);
  x.commercial_impact=first(x.commercial_impact,x.commercial_or_mission_impact,x.mission_impact,x.business_impact);
  x.commercial_or_mission_impact=first(x.commercial_or_mission_impact,x.commercial_impact,x.mission_impact,x.business_impact);
  /* BLACKDUCK_VERIFIED_EXPORT_MODEL_FIX_V22_1_8 */
  x.verified_context=first(x.verified_fact_or_context,x.verified_context,x.context,x.fact,x.summary,x.description,x.assessment,x.evidence);
  x.context=first(x.context,x.verified_fact_or_context,x.verified_context,x.fact,x.summary,x.description,x.assessment,x.evidence);
  x.fact=first(x.fact,x.verified_fact_or_context,x.verified_context,x.context,x.summary,x.description,x.evidence);
  x.analysis=first(x.analysis,x.channel_implication,x.implication,x.relevance,x.recommendation);
  x.implication=first(x.implication,x.analysis,x.channel_implication,x.partner_implication,x.relevance,x.recommendation);
  x.value=first(x.value,x.value_proposition,x.partner_value,x.partner_or_client_value,x.client_value,x.customer_value,x.benefit);
  x.why=first(x.why,x.why_it_matters,x.significance,x.impact,x.assessment);
  x.action=first(x.action,x.joint_action,x.recommendation,x.first_action,x.next_step);
  x.entry=first(x.entry,x.black_duck_entry,x.appsec_need,x.entry_point,x.opening);
  x.environment=first(x.environment,x.affected_environment,x.affected_market,x.mission_environment,x.market,x.scope);
  x.title=first(x.title,x.headline,x.trend,x.name,x.development);
  x.markets=first(x.markets,x.affected_markets,x.affected_environment,x.agencies,x.market);
  x.risk=first(x.risk,x.entity_or_risk,x.examples_risk,x.entity,x.examples);
  x.strategy=first(x.strategy,x.differentiation_or_complementarity,x.differentiation,x.coexistence,x.response,x.recommendation);
  x.output=first(x.output,x.desired_output,x.outcome,x.success_criterion);
  x.channel_implication=first(x.channel_implication,x.implication,x.partner_implication,x.recommendation,x.black_duck_response);
  x.affected_environment=first(x.affected_environment,x.environment,x.agency,x.market,x.scope);
  x.black_duck_opening=first(x.black_duck_opening,x.opening,x.entry_point,x.recommendation,x.joint_offering);
  x.trend=first(x.trend,x.title,x.name,x.development);
  x.affected_markets=first(x.affected_markets,x.markets,x.environment,x.agency);
  x.partnership_implication=first(x.partnership_implication,x.implication,x.channel_implication,x.recommendation);
  x.agency_status=first(x.agency_status,x.agency,x.status);
  x.appsec_need=first(x.appsec_need,x.appsec_need_or_entry,x.entry_point,x.need,x.opening);
  x.response=first(x.response,x.black_duck_response,x.recommendation,x.approach);
  x.benefits=first(x.benefits,x.partner_value,x.partner_or_client_value,x.commercial_impact);
  x.status=first(x.status,x.validation_status,x.relationship_status,"To be validated");
  x.value_proposition=first(x.value_proposition,x.partner_value,x.partner_or_client_value,x.benefits);
  x.outcome=first(x.outcome,x.success_criterion,x.measure,x.desired_output);
  x.desired_output=first(x.desired_output,x.outcome,x.success_criterion);
  x.why_it_matters=first(x.why_it_matters,x.significance,x.assessment,x.value_proposition);
  x.joint_action=first(x.joint_action,x.action,x.recommendation,x.first_action);
  x.examples_risk=first(x.examples_risk,x.examples,x.risk,x.competitors);
  x.differentiation=first(x.differentiation,x.coexistence,x.response,x.recommendation);

  for(const key of Object.keys(x)){
    if(typeof x[key]==="string"){
      const t=x[key].trim();
      if(/^(John Smith|Jane Doe|John Doe)$/i.test(t)) x[key]="Stakeholder to be confirmed";
      else if(/^(undefined|null)$/i.test(t) || /undefined\s+undefined/i.test(t)) x[key]="";
      else x[key]=t;
    }
  }
  return x;
}
function normalizeDeliverableArray(value){
  return Array.isArray(value) ? value.map(normalizeDeliverableRow) : [];
}
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, PageBreak, AlignmentType, Footer } = require("docx");
const pptxgen = require("pptxgenjs");

const PURPLE="2F1C68", TEAL="00A6A6", DARK="333333", GRAY="666666", LIGHT="F2F0F6", RED="B42828", WHITE="FFFFFF";
function safe(v){return String(v??"").replace(/[\\/:*?"<>|]+/g,"_").slice(0,100)}
function array(v){return normalizeDeliverableArray(v)}
function text(v){

 if(v === null || v === undefined)
   return "";

 if(typeof v === "string")
   return v.trim();

 if(typeof v === "number" || typeof v === "boolean")
   return String(v);

 if(Array.isArray(v)){
   return v
     .map(text)
     .filter(Boolean)
     .join(" | ");
 }

 if(typeof v === "object"){

   const preferred = [
     "title",
     "headline",
     "name",
     "label",
     "summary",
     "description",
     "context",
     "implication",
     "evidence",
     "action",
     "outcome",
     "value"
   ];

   const parts = [];

   for(const key of preferred){
     if(v[key]){
       const rendered=text(v[key]);
       if(rendered) parts.push(rendered);
     }
   }

   if(parts.length){
     return [...new Set(parts)].join(" | ");
   }

   try{
     return JSON.stringify(v);
   }catch{
     return "";
   }
 }

 const raw = String(v).trim();

 if(/^undefined$/i.test(raw)) return "";
 if(/^null$/i.test(raw)) return "";

 if(/^John Smith$/i.test(raw))
   return "Stakeholder to be confirmed";

 return raw;
}

/* BLACKDUCK_QUALITYJOIN_DEDUPE_V22_1_2 */
function qualityJoin(...values){
  const cleaned=values
    .flat(Infinity)
    .map(value=>text(value))
    .map(value=>String(value||"").trim())
    .filter(value=>value && !/^(undefined|null)$/i.test(value));
  const unique=[];
  const seen=new Set();
  for(const value of cleaned){
    const key=value.toLocaleLowerCase();
    if(!seen.has(key)){
      seen.add(key);
      unique.push(value);
    }
  }
  return unique.join(" | ") || "Validation required";
}
function bullets(items){return array(items).map(x=>new Paragraph({style:"Body",bullet:{level:0},children:[new TextRun(text(typeof x==="string"?x:x.title||x.action||JSON.stringify(x)))]}))}
function cell(v,bold=false,fill){return new TableCell({shading:fill?{type:ShadingType.CLEAR,fill}:undefined,children:[new Paragraph({children:[new TextRun({text:text(v),bold,color:bold&&fill?WHITE:DARK})]})]})}
function table(headers,rows,widths){return new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:widths,rows:[new TableRow({tableHeader:true,children:headers.map(h=>cell(h,true,PURPLE))}),...rows.map(r=>new TableRow({children:r.map(v=>cell(v))}))]})}
function sectionTitle(t){return new Paragraph({heading:HeadingLevel.HEADING_1,children:[new TextRun({text:t,color:PURPLE,bold:true})]})}
function subTitle(t){return new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun({text:t,color:TEAL,bold:true})]})}
function para(v,bold=false){return new Paragraph({style:"Body",children:[new TextRun({text:text(v),bold,color:DARK})]})}

function normText(v){return String(v??"").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\b(the|a|an|and|or|of|to|for|in|on|with|by|from|at|is|are|be|as)\b/g," ").replace(/\s+/g," ").trim()}
function tokens(v){return new Set(normText(v).split(" ").filter(x=>x.length>2))}
function similarity(a,b){const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let both=0;for(const x of A)if(B.has(x))both++;return both/(A.size+B.size-both)}
function itemTitle(x){return typeof x==="string"?x:(x.title||x.name||x.factor||x.theme||x.headline||x.element||x.stakeholder||x.dimension||x.development||x.finding||x.capability||x.category||x.action||"")}
function itemBody(x){return typeof x==="string"?x:Object.entries(x||{}).filter(([k])=>!['confidence','status','period','time'].includes(k)).map(([,v])=>Array.isArray(v)?v.join(" "):v).join(" ")}
function dedupeArray(items){const out=[];for(const item of Array.isArray(items)?items:[]){const ti=itemTitle(item),bi=itemBody(item);const hit=out.findIndex(old=>{const ts=similarity(ti,itemTitle(old)),bs=similarity(bi,itemBody(old));return normText(ti)===normText(itemTitle(old))||ts>=.72||bs>=.80||(ts>=.52&&bs>=.60)});if(hit<0)out.push(item);else if(JSON.stringify(item).length>JSON.stringify(out[hit]).length)out[hit]=item}return out}
function dedupeResearch(input){const r=JSON.parse(JSON.stringify(input||{}));for(const k of ['corporate_profile','challenges','trends','opportunities','swot','value_proposition','partnership_framework','stakeholders','channel_plan','meeting_agenda','executive_themes','headwinds_tailwinds','competitive_landscape','account_strategy','immediate_actions','sources','qa_findings'])r[k]=dedupeArray(r[k]);if(r.executive_summary){const paras=String(r.executive_summary).split(/\n\s*\n/);r.executive_summary=dedupeArray(paras).join("\n\n")}if(r.partnership_thesis){const paras=String(r.partnership_thesis).split(/\n\s*\n/);r.partnership_thesis=dedupeArray(paras).join("\n\n")}return r}
function buildDoc(result,meta){result=dedupeResearch(result);
 const c=[];
 c.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:700},children:[new TextRun({text:(meta.partner||"Partner")+" - Black Duck",bold:true,size:38,color:PURPLE})]}));
 c.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Public-Sector Strategic Partner Account Plan",bold:true,size:28,color:TEAL})]}));
 c.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:700},children:[new TextRun({text:"Win together. Deliver secure software at mission scale.",italics:true,size:24,color:DARK})]}));
 c.push(table(["Prepared for","Prepared by","Research status"],[[meta.partner||"Partner",meta.presenter||"Justin Naughton","AI-generated draft; validate all external facts and citations"]]));
 c.push(new Paragraph({children:[new PageBreak()]}));
 c.push(sectionTitle("1. Executive Summary")); c.push(para(result.executive_summary)); c.push(subTitle("Post-Meeting Intelligence Update")); c.push(para(result.post_meeting_intelligence||"No post-meeting intelligence captured."));
 if(result.partnership_thesis){c.push(subTitle("Partnership thesis"),para(result.partnership_thesis,true));}
 c.push(sectionTitle("2. Corporate and Federal-Market Profile"));
 c.push(table(["Dimension","Verified or supplied context","Channel implication"],array(result.corporate_profile).map(x=>[x.dimension,(x.verified_fact_or_context||x.context||x.fact||x.description||x.summary),(x.analysis||x.channel_implication||x.implication||x.recommendation)])));
 c.push(sectionTitle("3. Material Challenges and Market Trends"));
 c.push(table(["Challenge","Affected environment","Evidence","Black Duck opening","Confidence"],array(result.challenges).map(x=>[x.title,x.environment,x.evidence,x.opening,x.confidence])));
 c.push(subTitle("Forward-looking trends")); c.push(table(["Trend","Significance","Affected markets","Partnership implication"],array(result.trends).map(x=>[x.title,x.significance,x.markets,x.implication])));
 c.push(sectionTitle("4. Opportunity and Contract Map"));
 c.push(table(["Opportunity","Agency / status","Public scope","AppSec need / entry","Motion","Confidence"],array(result.opportunities).map(x=>[x.name,x.agency_status,x.scope,x.entry,x.motion,x.confidence])));
 c.push(para("Important: entry points are analytical unless the source evidence explicitly confirms Black Duck involvement.",true));
 c.push(sectionTitle("5. Partnership SWOT Analysis")); c.push(table(["Factor","Assessment","Black Duck response"],array(result.swot).map(x=>[x.factor,x.assessment,x.response])));
 c.push(sectionTitle("6. GDIT-Specific Black Duck Value Proposition")); c.push(table(["Capability","Partner value","Commercial impact"],array(result.value_proposition).map(x=>[x.capability,x.partner_value,x.commercial_impact])));
 c.push(sectionTitle("7. Strategic Partnership Framework")); c.push(table(["Theme / strapline","Problem","Joint offering","Benefits","First action"],array(result.partnership_framework).map(x=>[x.theme,x.problem,x.joint_offering,x.benefits,x.first_action])));
 c.push(sectionTitle("8. Stakeholder Map")); c.push(table(["Stakeholder","Status","Influence / interest","Value proposition","Approach"],array(result.stakeholders).map(x=>[x.stakeholder,x.status,x.influence,(x.value_proposition||x.value||x.partner_value||x.client_value),(x.approach||x.next_step)])));
 c.push(sectionTitle("9. 30-, 60-, 90-, and 180-Day Channel Plan")); c.push(table(["Period","Action","Owner","Outcome / success criterion","Dependency"],array(result.channel_plan).map(x=>[x.period,x.action,x.owner,x.outcome,x.dependency])));
 c.push(sectionTitle("10. Introductory Meeting Agenda and Discovery Questions")); c.push(table(["Time","Agenda item","Desired output","Questions"],array(result.meeting_agenda).map(x=>[x.time,x.topic,x.output,array(x.questions).join(" | ")])));
 c.push(sectionTitle("11. Executive Discussion Themes")); c.push(table(["Headline","Why it matters","Questions","Objection and response"],array(result.executive_themes).map(x=>[x.headline,(x.why_it_matters||x.why||x.significance||x.impact),array(x.questions).join(" | "),text(x.objection)+" | "+text(x.response)])));
 c.push(sectionTitle("12. Headwinds and Tailwinds")); c.push(table(["Type","Development","Effect","Joint action","Measure"],array(result.headwinds_tailwinds).map(x=>[x.type,x.development,x.effect,(x.joint_action||x.action||x.recommendation),x.measure])));
 c.push(sectionTitle("13. Competitive and Partner Landscape")); c.push(table(["Category","Examples / risk","Differentiation and coexistence"],array(result.competitive_landscape).map(x=>[x.category,x.risk,x.strategy])));
 c.push(sectionTitle("14. Recommended Account Strategy")); c.push(table(["Element","Recommendation"],array(result.account_strategy).map(x=>[x.element,x.recommendation])));
 c.push(sectionTitle("15. Immediate Next Actions"),...bullets(result.immediate_actions));
 c.push(sectionTitle("16. Source List"),...array(result.sources).map(s=>para((s.title||"Source")+": "+(s.url||""))));
 c.push(sectionTitle("17. Quality-Assurance Findings and Unresolved Questions")); c.push(table(["Finding","Status / action"],array(result.qa_findings).map(x=>[x.finding,x.status])));
 return new Document({styles:{default:{document:{run:{font:"Aptos",size:24},paragraph:{spacing:{after:120,line:276}}}},paragraphStyles:[{id:"Body",name:"Body",basedOn:"Normal",quickFormat:true,run:{font:"Aptos",size:24,color:DARK},paragraph:{spacing:{after:120,line:276}}}]},sections:[{properties:{page:{margin:{top:720,right:720,bottom:720,left:720}}},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Black Duck Confidential - AI-generated draft",color:GRAY,size:24})]})]})},children:c}]});
}

function addTitle(slide,title,subtitle){slide.addText(title,{x:.45,y:.25,w:12.3,h:.38,fontFace:"Aptos Display",fontSize:23,bold:true,color:PURPLE,margin:0});if(subtitle)slide.addText(subtitle,{x:.45,y:.66,w:12.3,h:.28,fontSize:14,color:GRAY,margin:0});slide.addShape("rect",{x:0,y:0,w:13.333,h:.08,fill:{color:TEAL},line:{color:TEAL}});slide.addText("BLACK DUCK CONFIDENTIAL",{x:10.8,y:7.15,w:2,h:.18,fontSize:12,color:"888888",margin:0,align:"right"});}
function addCards(slide,items,cols=3,startY=1.25){const gap=.18,w=(12.4-gap*(cols-1))/cols;array(items).slice(0,cols*2).forEach((it,i)=>{const x=.45+(i%cols)*(w+gap),y=startY+Math.floor(i/cols)*2.35;slide.addShape("roundRect",{x,y,w,h:2.05,rectRadius:.08,fill:{color:WHITE},line:{color:"D8D2E2",width:1}});slide.addShape("rect",{x,y,w:.06,h:2.05,fill:{color:i%2?TEAL:PURPLE},line:{color:i%2?TEAL:PURPLE}});slide.addText(text(it.title||it.theme||it.name||it.element||it.headline),{x:x+.18,y:y+.15,w:w-.32,h:.35,fontSize:16,bold:true,color:PURPLE,margin:0,breakLine:false});slide.addText(text(it.body||it.assessment||it.significance||it.scope||it.recommendation||it.problem||it.why||it.entry),{x:x+.18,y:y+.58,w:w-.32,h:1.23,fontSize:14,color:DARK,margin:.03,valign:"top",breakLine:false,fit:"shrink"});});}
function buildPpt(result,meta){result=dedupeResearch(result);const pptx=new pptxgen();pptx.layout="LAYOUT_WIDE";pptx.author=meta.presenter||"Justin Naughton";pptx.subject="Executive Partner Strategy";pptx.title=(meta.partner||"Partner")+" - Black Duck Executive Partner Strategy";pptx.company="Black Duck";pptx.lang="en-US";pptx.theme={headFontFace:"Aptos Display",bodyFontFace:"Aptos",lang:"en-US"};
 let s=pptx.addSlide();s.background={color:"170729"};s.addText((meta.partner||"PARTNER")+" + BLACK DUCK",{x:.65,y:1.35,w:8.7,h:.58,fontSize:30,bold:true,color:WHITE,margin:0});s.addText("Public-Sector Executive Partner Strategy",{x:.65,y:2.08,w:8.7,h:.45,fontSize:21,bold:true,color:"7FE4E4",margin:0});s.addText("Win together. Deliver secure software at mission scale.",{x:.65,y:2.72,w:8.7,h:.35,fontSize:14,color:WHITE,margin:0});s.addText(meta.presenter||"Justin Naughton | Lead Sales Engineer, Public Sector Partners",{x:.65,y:6.65,w:8.7,h:.26,fontSize:14,color:WHITE,margin:0});
 s=pptx.addSlide();addTitle(s,"Executive decision","Pursue conditionally with a narrow, measurable opening");addCards(s,[{title:"PURSUE",body:result.decision||result.executive_summary},{title:"WHY NOW",body:result.why_now},{title:"OPENING",body:result.opening},{title:"LIGHTHOUSE",body:result.lighthouse},{title:"PRIMARY RISK",body:result.primary_risk}],5,1.3);s.addShape("roundRect",{x:.6,y:4.35,w:12.1,h:1.45,fill:{color:LIGHT},line:{color:"D8D2E2"}});s.addText("Partnership thesis",{x:.85,y:4.62,w:2.1,h:.3,fontSize:16,bold:true,color:PURPLE,margin:0});s.addText(text(result.partnership_thesis),{x:2.8,y:4.52,w:9.5,h:.65,fontSize:14,bold:true,color:DARK,margin:.04,fit:"shrink"});
 s=pptx.addSlide();addTitle(s,"Why this partner","Federal mission access plus technology differentiation");addCards(s,array(result.corporate_profile).slice(0,6).map(x=>({
title:x.dimension,
body:qualityJoin(
x.verified_fact_or_context,
x.context,
x.fact,
x.analysis,
x.implication,
x.channel_implication
)
})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Why now","Federal requirements and delivery realities are converging");addCards(s,array(result.trends).slice(0,5).map(x=>({title:x.title,body:x.implication||x.significance})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Mutual business case","The alliance must create services revenue and customer outcomes");addCards(s,array(result.value_proposition).slice(0,6).map(x=>({title:x.capability,body:qualityJoin(x.partner_or_client_value,x.partner_value,x.commercial_or_mission_impact,x.commercial_impact)})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Five partnership themes","Business motions, not a product list");addCards(s,array(result.partnership_framework).slice(0,5).map(x=>({title:x.theme,body:x.joint_offering||x.problem})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Priority opportunity map","Awards must be verified; entry points may remain analytical");addCards(s,array(result.opportunities).slice(0,6).map(x=>({title:x.name,body:(x.agency_status||"")+" "+(x.scope||"")+" "+(x.entry||"")})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Recommended lighthouse","A bounded portfolio that proves workflow value");addCards(s,[{title:"SCOPE",body:result.lighthouse},{title:"CONTROLS",body:array(result.value_proposition).slice(0,4).map(x=>x.capability).join(" | ")},{title:"MEASURES",body:array(result.account_strategy).find(x=>/metric/i.test(x.element))?.recommendation||"Coverage, onboarding, remediation, evidence effort and adoption"},{title:"DECISION GATE",body:array(result.account_strategy).find(x=>/go/i.test(x.element))?.recommendation||"Expand only after measurable value and fit are proven"}],2,1.35);
 s=pptx.addSlide();addTitle(s,"Joint solution model","Black Duck assurance technology inside a partner-operated service");addCards(s,array(result.partnership_framework).slice(0,5).map(x=>({title:x.theme,body:x.benefits||x.joint_offering})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Stakeholder path","Move from internal alignment to operating sponsor and qualified program");addCards(s,array(result.stakeholders).slice(0,5).map(x=>({title:x.stakeholder,body:x.approach||x.value})),5,1.45);
 s=pptx.addSlide();addTitle(s,"30 / 60 / 90 / 180-day plan","Progress through gated outcomes, not activity volume");addCards(s,array(result.channel_plan).slice(0,8).map(x=>({title:x.period+" | "+x.action,body:x.outcome})),4,1.15);
 s=pptx.addSlide();addTitle(s,"Commercial model and governance","Resolve economics and ownership before joint demand generation");addCards(s,array(result.account_strategy).slice(0,6).map(x=>({title:x.element,body:x.recommendation})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Decision and immediate next actions","Earn one sponsor, qualify one lighthouse, define one operating model");addCards(s,array(result.immediate_actions).slice(0,5).map((x,i)=>({title:String(i+1),body:text(typeof x==="string"?x:x.action)})),5,1.5);
 let intelligenceSlide=pptx.addSlide();
 addTitle(intelligenceSlide,"Post-Meeting Intelligence","Latest structured evidence after LLM re-synthesis");
 intelligenceSlide.addText(text(result.post_meeting_intelligence||"No post-meeting intelligence captured."),{x:.72,y:1.35,w:11.85,h:5.45,fontSize:12,color:DARK,margin:.12,valign:"top",fit:"shrink"});
 return pptx;}

module.exports=function register(app,db,rootDir){
 const outDir=path.join(rootDir,"exports");fs.mkdirSync(outDir,{recursive:true});app.use("/exports",require("express").static(outDir));
 db.exec(`CREATE TABLE IF NOT EXISTS research_exports(id INTEGER PRIMARY KEY AUTOINCREMENT,call_prep_id INTEGER,partner_name TEXT,report_path TEXT,deck_path TEXT,created_date TEXT DEFAULT CURRENT_TIMESTAMP);`);
 app.post("/api/research-exports",async(req,res)=>{try{const b=req.body||{},callPrepId=Number(b.call_prep_id||0),row=callPrepId?db.prepare("SELECT result_json FROM call_prep_results WHERE id=?").get(callPrepId):null,stored=row&&row.result_json?JSON.parse(row.result_json):null,authoritative=stored?{...stored,...(b.result||{}),partner_name:b.partner_name||(b.result||{}).partner_name}:b.result||b,result=resolveExportResearch(authoritative),partner=safe(b.partner_name||result.partner_name||"Partner"),stamp=Date.now(),reportName=`${partner}_Black_Duck_Strategic_Partner_Account_Plan_${stamp}.docx`,deckName=`${partner}_Black_Duck_Executive_Partner_Strategy_${stamp}.pptx`;const reportPath=path.join(outDir,reportName),deckPath=path.join(outDir,deckName),meta={partner,presenter:b.presenter||"Justin Naughton"};const doc=buildDoc(result,meta);fs.writeFileSync(reportPath,await Packer.toBuffer(doc));const ppt=buildPpt(result,meta);await ppt.writeFile({fileName:deckPath});const r=db.prepare("INSERT INTO research_exports(call_prep_id,partner_name,report_path,deck_path) VALUES(?,?,?,?)").run(b.call_prep_id||null,partner,reportName,deckName);res.json({id:Number(r.lastInsertRowid),report_url:"/exports/"+encodeURIComponent(reportName),deck_url:"/exports/"+encodeURIComponent(deckName),report_name:reportName,deck_name:deckName});}catch(e){res.status(500).json({error:e.message});}});
 app.get("/api/research-exports",(req,res)=>res.json(db.prepare("SELECT * FROM research_exports ORDER BY id DESC").all().map(x=>({...x,report_url:"/exports/"+encodeURIComponent(x.report_path),deck_url:"/exports/"+encodeURIComponent(x.deck_path)}))));
};
















