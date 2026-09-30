"use strict";

module.exports = function installStageManagementV12(app, db) {
  const MARKER = "STAGE_MANAGEMENT_V12";

  const NEW_BUSINESS = [
    {number:0,name:"Prospecting",purpose:"Qualify potential opportunities and secure customer engagement.",exitCriteria:["Initial qualification completed","Discovery meeting scheduled","Opportunity created in Salesforce"],focus:["Initial qualification","Customer engagement","Meeting commitment"],meddpicc:["Identify Pain","Champion hypothesis"]},
    {number:1,name:"Discovery",purpose:"Understand customer business challenges, objectives, stakeholders, budget, and timeline.",exitCriteria:["Business need documented","Stakeholders identified","Budget and timeline validated","Next-step commitment secured"],focus:["Business outcomes","Pain and consequences","Stakeholders","Budget and timeline"],meddpicc:["Metrics","Identify Pain","Champion"]},
    {number:2,name:"Solution Exploration & Demo",purpose:"Align Black Duck solutions to customer needs.",exitCriteria:["Solution mapped to customer requirements","Demo delivered","Customer confirms solution fit and interest in advancement"],focus:["Technical requirements","Use-case mapping","Demo outcomes","Competitive differentiation"],meddpicc:["Decision Criteria","Identify Pain","Competition"]},
    {number:3,name:"POV Planning & EB Meeting",purpose:"Establish mutual success criteria and executive alignment.",exitCriteria:["POV scope defined","Success criteria documented","Executive sponsor identified","Mutual action plan approved"],focus:["POV boundaries","Success measures","Executive alignment","Mutual action plan"],meddpicc:["Metrics","Economic Buyer","Decision Criteria","Champion"]},
    {number:4,name:"POV & Readout",purpose:"Validate business and technical value.",exitCriteria:["POV completed with results documented","Results presented to decision makers","Customer agrees to move forward"],focus:["Measured results","Acceptance criteria","Executive readout","Residual risk"],meddpicc:["Metrics","Economic Buyer","Decision Process","Competition"]},
    {number:5,name:"Proposal",purpose:"Present commercial and business value justification.",exitCriteria:["Business Value Proposal delivered","Commercial requirements confirmed","Customer acknowledges proposal review"],focus:["Business value","Pricing and scope","Commercial requirements","Proposal review"],meddpicc:["Economic Buyer","Decision Process","Paper Process","Metrics"]},
    {number:6,name:"Contract Redlines",purpose:"Drive agreement through legal and procurement processes.",exitCriteria:["Commercial and legal review underway","Major redlines addressed","Clear path to execution identified"],focus:["Procurement","Legal review","Approvals","Execution timeline"],meddpicc:["Paper Process","Decision Process","Economic Buyer"]},
    {number:7,name:"Sales Won",purpose:"Finalize agreement and ensure order readiness.",exitCriteria:["Agreement fully executed","Order validated by Order Management","Internal handoff requirements completed"],focus:["Order readiness","Handoff","Implementation ownership"],meddpicc:["Paper Process","Economic Buyer"]},
    {number:8,name:"Close",purpose:"Capture final outcome and reinforce process discipline.",exitCriteria:["Win or loss reason captured","Required fields completed","Opportunity closed"],focus:["Outcome capture","Lessons learned","Customer lifecycle transition"],meddpicc:["Competition","Metrics"]}
  ];

  const RENEWAL = [
    {number:1,name:"Renewal Identified",purpose:"Understand the renewal opportunity and customer profile.",exitCriteria:["Renewal opportunity created","Contract details verified","Renewal owner assigned"],focus:["Contract baseline","Ownership","Customer health"],meddpicc:["Identify Pain","Champion"]},
    {number:2,name:"Renewal Validation",purpose:"Confirm renewal scope and customer readiness.",exitCriteria:["Product usage reviewed","Customer objectives validated","Renewal scope confirmed","Risks documented"],focus:["Usage and adoption","Objectives","Scope","Risk"],meddpicc:["Metrics","Identify Pain","Champion"]},
    {number:3,name:"Proposal / Negotiation",purpose:"Secure commercial agreement.",exitCriteria:["Renewal quote or proposal delivered","Customer actively engaged in negotiations","Commercial path identified"],focus:["Pricing","Negotiation","Co-terming","Growth opportunities"],meddpicc:["Economic Buyer","Decision Criteria","Competition"]},
    {number:4,name:"Procurement",purpose:"Navigate customer procurement and legal processes.",exitCriteria:["Procurement and legal review in progress","Customer confirms purchase process","Remaining issues documented"],focus:["Procurement","Legal","Approvals","Escalations"],meddpicc:["Paper Process","Decision Process","Economic Buyer"]},
    {number:5,name:"Renewal Won",purpose:"Secure renewal commitment and validate booking.",exitCriteria:["Agreement executed","Order validated","Revenue booked"],focus:["Booking","Order validation","Customer Success handoff"],meddpicc:["Paper Process","Economic Buyer"]},
    {number:6,name:"Closed Won / Closed Lost",purpose:"Record the outcome and capture insights.",exitCriteria:["Final outcome recorded","Reason codes completed","Opportunity closed"],focus:["Outcome","Churn or retention insight","Lessons learned"],meddpicc:["Competition","Metrics"]}
  ];

  db.exec(`
    CREATE TABLE IF NOT EXISTS opportunity_stage_state_v12 (
      call_prep_id INTEGER PRIMARY KEY,
      motion TEXT NOT NULL DEFAULT 'New Business',
      stage_number INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      stage_entered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_by TEXT NOT NULL DEFAULT 'Workspace User'
    );
    CREATE TABLE IF NOT EXISTS opportunity_stage_history_v12 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_prep_id INTEGER NOT NULL,
      motion TEXT NOT NULL,
      from_stage_number INTEGER,
      from_stage_name TEXT,
      to_stage_number INTEGER NOT NULL,
      to_stage_name TEXT NOT NULL,
      reason TEXT NOT NULL,
      evidence TEXT,
      criteria_json TEXT NOT NULL,
      override_used INTEGER NOT NULL DEFAULT 0,
      changed_by TEXT NOT NULL,
      changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_stage_history_v12_call ON opportunity_stage_history_v12(call_prep_id, changed_at DESC);
  `);

  const matrix = motion => String(motion).toLowerCase().startsWith("renew") ? RENEWAL : NEW_BUSINESS;
  const stageFor = (motion, number) => matrix(motion).find(x => x.number === Number(number));

  app.get("/api/stage-management-v12/matrix", (req,res) => res.json({version:12,newBusiness:NEW_BUSINESS,renewal:RENEWAL}));

  app.get("/api/stage-management-v12/:id", (req,res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({error:"Invalid call-prep id."});
    const state = db.prepare("SELECT * FROM opportunity_stage_state_v12 WHERE call_prep_id=?").get(id) || null;
    const history = db.prepare("SELECT * FROM opportunity_stage_history_v12 WHERE call_prep_id=? ORDER BY id DESC").all(id).map(x => ({...x,criteria:JSON.parse(x.criteria_json||"[]")}));
    res.json({state,history});
  });

  app.put("/api/stage-management-v12/:id", (req,res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({error:"Invalid call-prep id."});
    const body = req.body || {};
    const motion = body.motion === "Renewal" ? "Renewal" : "New Business";
    const target = stageFor(motion, body.stageNumber);
    if (!target) return res.status(400).json({error:"The selected stage is not valid for the selected motion."});
    const reason = String(body.reason||"").trim();
    const changedBy = String(body.changedBy||"Justin Naughton").trim();
    const evidence = String(body.evidence||"").trim();
    const criteria = Array.isArray(body.criteria) ? body.criteria.filter(Boolean) : [];
    const overrideUsed = body.overrideUsed === true;
    if (!reason) return res.status(400).json({error:"A reason is required for every stage change."});
    if (!changedBy) return res.status(400).json({error:"Changed by is required."});
    const missing = target.exitCriteria.filter(x => !criteria.includes(x));
    if (missing.length && !overrideUsed) return res.status(409).json({error:"Exit criteria are incomplete.",missing});

    const tx = db.transaction(() => {
      const old = db.prepare("SELECT * FROM opportunity_stage_state_v12 WHERE call_prep_id=?").get(id);
      db.prepare(`INSERT INTO opportunity_stage_history_v12
        (call_prep_id,motion,from_stage_number,from_stage_name,to_stage_number,to_stage_name,reason,evidence,criteria_json,override_used,changed_by)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(id,motion,old?.stage_number??null,old?.stage_name??null,target.number,target.name,reason,evidence,JSON.stringify(criteria),overrideUsed?1:0,changedBy);
      db.prepare(`INSERT INTO opportunity_stage_state_v12
        (call_prep_id,motion,stage_number,stage_name,stage_entered_at,updated_at,updated_by)
        VALUES(?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?)
        ON CONFLICT(call_prep_id) DO UPDATE SET motion=excluded.motion,stage_number=excluded.stage_number,stage_name=excluded.stage_name,stage_entered_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP,updated_by=excluded.updated_by`)
        .run(id,motion,target.number,target.name,changedBy);
    });
    tx();
    const state = db.prepare("SELECT * FROM opportunity_stage_state_v12 WHERE call_prep_id=?").get(id);
    res.json({success:true,state,stage:target,missing,overrideUsed,marker:MARKER});
  });
};
