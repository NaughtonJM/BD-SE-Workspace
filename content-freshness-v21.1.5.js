/* BLACKDUCK_EVIDENCE_HASH_STABILIZATION_V21_1_5_5 */
'use strict';
const MARKER='BLACKDUCK_CONTENT_FRESHNESS_V21_1_5';
const ARTIFACTS=['plan','execute','research','executive','account','brief','board'];
module.exports=function(app,db){
 if(!app.locals.bdUnifiedEvidence)throw new Error('Unified Evidence Core must load before Content Freshness.');
 db.exec(`CREATE TABLE IF NOT EXISTS content_freshness_v21(
   call_prep_id INTEGER NOT NULL,
   artifact_key TEXT NOT NULL,
   source_evidence_hash TEXT NOT NULL DEFAULT '',
   artifact_hash TEXT NOT NULL DEFAULT '',
   content_length INTEGER NOT NULL DEFAULT 0,
   view_marker TEXT NOT NULL DEFAULT '',
   captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY(call_prep_id,artifact_key)
 )`);
 db.prepare(`DELETE FROM content_freshness_v21
   WHERE artifact_key <> 'plan'
   AND (
    view_marker LIKE 'auto:main%'
    OR view_marker LIKE 'auto:meetingplan%'
    OR view_marker LIKE 'resolved:meetingplan%'
   )`).run();
 const getRows=db.prepare('SELECT * FROM content_freshness_v21 WHERE call_prep_id=? ORDER BY artifact_key');
 const upsert=db.prepare(`INSERT INTO content_freshness_v21
   (call_prep_id,artifact_key,source_evidence_hash,artifact_hash,content_length,view_marker,captured_at)
   VALUES(@call_prep_id,@artifact_key,@source_evidence_hash,@artifact_hash,@content_length,@view_marker,CURRENT_TIMESTAMP)
   ON CONFLICT(call_prep_id,artifact_key) DO UPDATE SET
   source_evidence_hash=excluded.source_evidence_hash,
   artifact_hash=excluded.artifact_hash,
   content_length=excluded.content_length,
   view_marker=excluded.view_marker,
   captured_at=CURRENT_TIMESTAMP`);
 function current(id){return app.locals.bdUnifiedEvidence.snapshot(Number(id))}
 function status(id){
   const snapshot=current(id),rows=getRows.all(Number(id)),byKey=Object.fromEntries(rows.map(x=>[x.artifact_key,x]));
   return {
     evidenceHash:snapshot.evidenceHash,
     datasetCount:snapshot.inputDatasets.length,
     artifacts:ARTIFACTS.map(key=>{
       const row=byKey[key]||null;
       return {
         key,
         status:!row?'NOT CAPTURED':row.source_evidence_hash===snapshot.evidenceHash?'CURRENT':'STALE',
         sourceEvidenceHash:row?.source_evidence_hash||'',
         artifactHash:row?.artifact_hash||'',
         contentLength:row?.content_length||0,
         viewMarker:row?.view_marker||'',
         capturedAt:row?.captured_at||null
       };
     })
   };
 }
 app.get('/api/content-freshness-v21/meetings/:id',(req,res)=>{
   try{res.type('application/json; charset=utf-8').json({success:true,marker:MARKER,callPrepId:Number(req.params.id),...status(req.params.id)})}
   catch(error){res.status(500).type('application/json; charset=utf-8').json({success:false,marker:MARKER,error:error.message})}
 });
 app.post('/api/content-freshness-v21/meetings/:id/capture/:artifact',(req,res)=>{
   try{
     const id=Number(req.params.id),key=String(req.params.artifact||'').toLowerCase();
     if(!ARTIFACTS.includes(key))return res.status(400).json({success:false,error:'Unsupported artifact key.'});
     const snapshot=current(id);
     upsert.run({call_prep_id:id,artifact_key:key,source_evidence_hash:snapshot.evidenceHash,artifact_hash:String(req.body?.artifactHash||''),content_length:Number(req.body?.contentLength||0),view_marker:String(req.body?.viewMarker||'').slice(0,200)});
     res.type('application/json; charset=utf-8').json({success:true,marker:MARKER,callPrepId:id,captured:key,...status(id)});
   }catch(error){res.status(500).type('application/json; charset=utf-8').json({success:false,marker:MARKER,error:error.message})}
 });
 app.get('/api/content-freshness-v21/meetings/:id/artifacts',(req,res)=>{
   try{res.type('application/json; charset=utf-8').json({success:true,marker:MARKER,callPrepId:Number(req.params.id),artifacts:getRows.all(Number(req.params.id))})}
   catch(error){res.status(500).json({success:false,marker:MARKER,error:error.message})}
 });
 console.log(MARKER+' loaded');
};