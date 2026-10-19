/* BLACKDUCK_EVIDENCE_HASH_STABILIZATION_V21_1_5_5 */
'use strict';
const crypto=require('crypto');
const MARKER='BLACKDUCK_UNIFIED_EVIDENCE_CORE_V21_1_2';
function parse(v){if(typeof v!=='string')return v;const s=v.trim();if(!s||(!s.startsWith('{')&&!s.startsWith('[')))return v;try{return JSON.parse(s)}catch{return v}}
function norm(v){if(Array.isArray(v))return v.map(norm);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=norm(parse(v[k]));return o}return v}
function digest(v){return crypto.createHash('sha256').update(JSON.stringify(norm(v)),'utf8').digest('hex')}
module.exports=function(app,db){
 db.exec("CREATE TABLE IF NOT EXISTS unified_intelligence_state_v21(call_prep_id INTEGER PRIMARY KEY,state TEXT NOT NULL DEFAULT 'current',evidence_hash TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
 function snapshot(id){
  id=Number(id);
  const datasets={};
  const excludedTables=new Set([
   'content_freshness_v21',
   'unified_intelligence_state_v21'
  ]);
  const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(x=>x.name).filter(name=>!excludedTables.has(name));
  for(const table of tables){
   if(!/^[A-Za-z0-9_]+$/.test(table))continue;
   let columns=[];try{columns=db.prepare(`PRAGMA table_info(${table})`).all().map(x=>x.name)}catch{continue}
   if(!columns.includes('call_prep_id'))continue;
   try{datasets[table]=db.prepare(`SELECT * FROM ${table} WHERE call_prep_id=? ORDER BY rowid`).all(id).map(norm)}catch(error){datasets[table]={error:error.message}}
  }
  const evidence={
   schemaVersion:'21.1.5.5',
   callPrepId:id,
   excludedOperationalDatasets:[
    'content_freshness_v21',
    'unified_intelligence_state_v21'
   ],
   datasets
  };
  return {evidence,evidenceHash:digest(evidence),inputDatasets:Object.keys(datasets)};
 }
 function mark(id,state,evidenceHash){db.prepare("INSERT INTO unified_intelligence_state_v21(call_prep_id,state,evidence_hash,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(call_prep_id) DO UPDATE SET state=excluded.state,evidence_hash=excluded.evidence_hash,updated_at=CURRENT_TIMESTAMP").run(Number(id),state,String(evidenceHash||''))}
 app.locals.bdUnifiedEvidence={snapshot,mark,marker:MARKER};
 app.get('/api/intelligence-v21/meetings/:id/evidence',(req,res)=>{try{res.type('application/json; charset=utf-8').json({success:true,marker:MARKER,...snapshot(req.params.id)})}catch(error){res.status(500).type('application/json; charset=utf-8').json({success:false,marker:MARKER,error:error.message})}});
 app.get('/api/intelligence-v21/meetings/:id/status',(req,res)=>{const status=db.prepare('SELECT * FROM unified_intelligence_state_v21 WHERE call_prep_id=?').get(Number(req.params.id))||null;res.type('application/json; charset=utf-8').json({success:true,marker:MARKER,status})});
 console.log(MARKER+' loaded');
};