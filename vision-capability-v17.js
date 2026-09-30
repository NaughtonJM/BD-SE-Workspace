"use strict";
module.exports = function(app, db){
  const MARKER="VISION_CAPABILITY_PARTNER_DISCOVERY_V17";
  db.exec(`
    CREATE TABLE IF NOT EXISTS vision_capability_state_v17 (
      call_prep_id INTEGER PRIMARY KEY,
      engagement_type TEXT NOT NULL DEFAULT 'Partner',
      selected_outcome TEXT NOT NULL DEFAULT '',
      answers_json TEXT NOT NULL DEFAULT '{}',
      generated_json TEXT NOT NULL DEFAULT '{}',
      notes TEXT NOT NULL DEFAULT '',
      updated_by TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const get=db.prepare("SELECT * FROM vision_capability_state_v17 WHERE call_prep_id=?");
  const put=db.prepare(`
    INSERT INTO vision_capability_state_v17
      (call_prep_id,engagement_type,selected_outcome,answers_json,generated_json,notes,updated_by,updated_at)
    VALUES (@call_prep_id,@engagement_type,@selected_outcome,@answers_json,@generated_json,@notes,@updated_by,CURRENT_TIMESTAMP)
    ON CONFLICT(call_prep_id) DO UPDATE SET
      engagement_type=excluded.engagement_type,
      selected_outcome=excluded.selected_outcome,
      answers_json=excluded.answers_json,
      generated_json=excluded.generated_json,
      notes=excluded.notes,
      updated_by=excluded.updated_by,
      updated_at=CURRENT_TIMESTAMP
  `);
  const parse=(value,fallback)=>{try{return JSON.parse(value||"");}catch{return fallback;}};
  app.get("/api/vision-capability-v17/:id",(req,res)=>{
    const id=Number(req.params.id); if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Invalid call-prep id"});
    const row=get.get(id);
    if(!row)return res.json({marker:MARKER,engagementType:"Partner",selectedOutcome:"",answers:{},generated:{},notes:"",updatedBy:"",updatedAt:null});
    res.json({marker:MARKER,engagementType:row.engagement_type,selectedOutcome:row.selected_outcome,answers:parse(row.answers_json,{}),generated:parse(row.generated_json,{}),notes:row.notes,updatedBy:row.updated_by,updatedAt:row.updated_at});
  });
  app.put("/api/vision-capability-v17/:id",(req,res)=>{
    const id=Number(req.params.id); if(!Number.isInteger(id)||id<1)return res.status(400).json({error:"Invalid call-prep id"});
    const body=req.body||{};
    const engagementType=["Partner","End Customer","Internal"].includes(body.engagementType)?body.engagementType:"Partner";
    put.run({call_prep_id:id,engagement_type:engagementType,selected_outcome:String(body.selectedOutcome||""),answers_json:JSON.stringify(body.answers||{}),generated_json:JSON.stringify(body.generated||{}),notes:String(body.notes||""),updated_by:String(body.updatedBy||"Justin Naughton")});
    const saved=get.get(id);
    res.json({success:true,marker:MARKER,updatedAt:saved.updated_at});
  });
  app.get("/api/vision-capability-v17/health",(req,res)=>res.json({status:"running",marker:MARKER}));
};
