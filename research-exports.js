const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, PageBreak, AlignmentType, Footer } = require("docx");
const pptxgen = require("pptxgenjs");

const PURPLE="2F1C68", TEAL="00A6A6", DARK="333333", GRAY="666666", LIGHT="F2F0F6", RED="B42828", WHITE="FFFFFF";
function safe(v){return String(v??"").replace(/[\\/:*?"<>|]+/g,"_").slice(0,100)}
function array(v){return Array.isArray(v)?v:[]}
function text(v){return String(v??"")}
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
 c.push(sectionTitle("1. Executive Summary")); c.push(para(result.executive_summary));
 if(result.partnership_thesis){c.push(subTitle("Partnership thesis"),para(result.partnership_thesis,true));}
 c.push(sectionTitle("2. Corporate and Federal-Market Profile"));
 c.push(table(["Dimension","Verified or supplied context","Channel implication"],array(result.corporate_profile).map(x=>[x.dimension,x.context||x.fact,x.implication])));
 c.push(sectionTitle("3. Material Challenges and Market Trends"));
 c.push(table(["Challenge","Affected environment","Evidence","Black Duck opening","Confidence"],array(result.challenges).map(x=>[x.title,x.environment,x.evidence,x.opening,x.confidence])));
 c.push(subTitle("Forward-looking trends")); c.push(table(["Trend","Significance","Affected markets","Partnership implication"],array(result.trends).map(x=>[x.title,x.significance,x.markets,x.implication])));
 c.push(sectionTitle("4. Opportunity and Contract Map"));
 c.push(table(["Opportunity","Agency / status","Public scope","AppSec need / entry","Motion","Confidence"],array(result.opportunities).map(x=>[x.name,x.agency_status,x.scope,x.entry,x.motion,x.confidence])));
 c.push(para("Important: entry points are analytical unless the source evidence explicitly confirms Black Duck involvement.",true));
 c.push(sectionTitle("5. Partnership SWOT Analysis")); c.push(table(["Factor","Assessment","Black Duck response"],array(result.swot).map(x=>[x.factor,x.assessment,x.response])));
 c.push(sectionTitle("6. GDIT-Specific Black Duck Value Proposition")); c.push(table(["Capability","Partner value","Commercial impact"],array(result.value_proposition).map(x=>[x.capability,x.partner_value,x.commercial_impact])));
 c.push(sectionTitle("7. Strategic Partnership Framework")); c.push(table(["Theme / strapline","Problem","Joint offering","Benefits","First action"],array(result.partnership_framework).map(x=>[x.theme,x.problem,x.joint_offering,x.benefits,x.first_action])));
 c.push(sectionTitle("8. Stakeholder Map")); c.push(table(["Stakeholder","Status","Influence / interest","Value proposition","Approach"],array(result.stakeholders).map(x=>[x.stakeholder,x.status,x.influence,x.value,x.approach])));
 c.push(sectionTitle("9. 30-, 60-, 90-, and 180-Day Channel Plan")); c.push(table(["Period","Action","Owner","Outcome / success criterion","Dependency"],array(result.channel_plan).map(x=>[x.period,x.action,x.owner,x.outcome,x.dependency])));
 c.push(sectionTitle("10. Introductory Meeting Agenda and Discovery Questions")); c.push(table(["Time","Agenda item","Desired output","Questions"],array(result.meeting_agenda).map(x=>[x.time,x.topic,x.output,array(x.questions).join(" | ")])));
 c.push(sectionTitle("11. Executive Discussion Themes")); c.push(table(["Headline","Why it matters","Questions","Objection and response"],array(result.executive_themes).map(x=>[x.headline,x.why,array(x.questions).join(" | "),text(x.objection)+" | "+text(x.response)])));
 c.push(sectionTitle("12. Headwinds and Tailwinds")); c.push(table(["Type","Development","Effect","Joint action","Measure"],array(result.headwinds_tailwinds).map(x=>[x.type,x.development,x.effect,x.action,x.measure])));
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
 s=pptx.addSlide();addTitle(s,"Why this partner","Federal mission access plus technology differentiation");addCards(s,array(result.corporate_profile).slice(0,6).map(x=>({title:x.dimension,body:x.context||x.fact||x.implication})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Why now","Federal requirements and delivery realities are converging");addCards(s,array(result.trends).slice(0,5).map(x=>({title:x.title,body:x.implication||x.significance})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Mutual business case","The alliance must create services revenue and customer outcomes");addCards(s,array(result.value_proposition).slice(0,6).map(x=>({title:x.capability,body:x.partner_value+" "+x.commercial_impact})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Five partnership themes","Business motions, not a product list");addCards(s,array(result.partnership_framework).slice(0,5).map(x=>({title:x.theme,body:x.joint_offering||x.problem})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Priority opportunity map","Awards must be verified; entry points may remain analytical");addCards(s,array(result.opportunities).slice(0,6).map(x=>({title:x.name,body:(x.agency_status||"")+" "+(x.scope||"")+" "+(x.entry||"")})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Recommended lighthouse","A bounded portfolio that proves workflow value");addCards(s,[{title:"SCOPE",body:result.lighthouse},{title:"CONTROLS",body:array(result.value_proposition).slice(0,4).map(x=>x.capability).join(" | ")},{title:"MEASURES",body:array(result.account_strategy).find(x=>/metric/i.test(x.element))?.recommendation||"Coverage, onboarding, remediation, evidence effort and adoption"},{title:"DECISION GATE",body:array(result.account_strategy).find(x=>/go/i.test(x.element))?.recommendation||"Expand only after measurable value and fit are proven"}],2,1.35);
 s=pptx.addSlide();addTitle(s,"Joint solution model","Black Duck assurance technology inside a partner-operated service");addCards(s,array(result.partnership_framework).slice(0,5).map(x=>({title:x.theme,body:x.benefits||x.joint_offering})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Stakeholder path","Move from internal alignment to operating sponsor and qualified program");addCards(s,array(result.stakeholders).slice(0,5).map(x=>({title:x.stakeholder,body:x.approach||x.value})),5,1.45);
 s=pptx.addSlide();addTitle(s,"30 / 60 / 90 / 180-day plan","Progress through gated outcomes, not activity volume");addCards(s,array(result.channel_plan).slice(0,8).map(x=>({title:x.period+" | "+x.action,body:x.outcome})),4,1.15);
 s=pptx.addSlide();addTitle(s,"Commercial model and governance","Resolve economics and ownership before joint demand generation");addCards(s,array(result.account_strategy).slice(0,6).map(x=>({title:x.element,body:x.recommendation})),3,1.2);
 s=pptx.addSlide();addTitle(s,"Decision and immediate next actions","Earn one sponsor, qualify one lighthouse, define one operating model");addCards(s,array(result.immediate_actions).slice(0,5).map((x,i)=>({title:String(i+1),body:text(typeof x==="string"?x:x.action)})),5,1.5);
 return pptx;}

module.exports=function register(app,db,rootDir){
 const outDir=path.join(rootDir,"exports");fs.mkdirSync(outDir,{recursive:true});app.use("/exports",require("express").static(outDir));
 db.exec(`CREATE TABLE IF NOT EXISTS research_exports(id INTEGER PRIMARY KEY AUTOINCREMENT,call_prep_id INTEGER,partner_name TEXT,report_path TEXT,deck_path TEXT,created_date TEXT DEFAULT CURRENT_TIMESTAMP);`);
 app.post("/api/research-exports",async(req,res)=>{try{const b=req.body||{},result=b.result||{},partner=safe(b.partner_name||result.partner_name||"Partner"),stamp=Date.now(),reportName=`${partner}_Black_Duck_Strategic_Partner_Account_Plan_${stamp}.docx`,deckName=`${partner}_Black_Duck_Executive_Partner_Strategy_${stamp}.pptx`;const reportPath=path.join(outDir,reportName),deckPath=path.join(outDir,deckName),meta={partner,presenter:b.presenter||"Justin Naughton"};const doc=buildDoc(result,meta);fs.writeFileSync(reportPath,await Packer.toBuffer(doc));const ppt=buildPpt(result,meta);await ppt.writeFile({fileName:deckPath});const r=db.prepare("INSERT INTO research_exports(call_prep_id,partner_name,report_path,deck_path) VALUES(?,?,?,?)").run(b.call_prep_id||null,partner,reportName,deckName);res.json({id:Number(r.lastInsertRowid),report_url:"/exports/"+encodeURIComponent(reportName),deck_url:"/exports/"+encodeURIComponent(deckName),report_name:reportName,deck_name:deckName});}catch(e){res.status(500).json({error:e.message});}});
 app.get("/api/research-exports",(req,res)=>res.json(db.prepare("SELECT * FROM research_exports ORDER BY id DESC").all().map(x=>({...x,report_url:"/exports/"+encodeURIComponent(x.report_path),deck_url:"/exports/"+encodeURIComponent(x.deck_path)}))));
};




