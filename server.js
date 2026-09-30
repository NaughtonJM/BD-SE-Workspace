const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, "database", "workspace.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS workspace_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  state_json TEXT NOT NULL,
  updated_date TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account TEXT,
  opportunity_name TEXT,
  stage TEXT,
  partner TEXT,
  timing TEXT,
  context TEXT,
  created_date TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

let row = db.prepare("SELECT state_json FROM workspace_state WHERE id=1").get();
if (!row) {
  let old = [];
  try { old = db.prepare("SELECT * FROM opportunities ORDER BY id DESC").all(); } catch {}
  const initial = {
    opportunities: old.map(x => ({
      id: String(x.id), account: x.account || "", name: x.opportunity_name || "",
      stage: x.stage || "", partner: x.partner || "", timing: x.timing || "",
      context: x.context || "", selectedQuestions: [], selectedProducts: [],
      created: x.created_date || new Date().toISOString()
    })),
    sessions: [], solutions: []
  };
  db.prepare("INSERT INTO workspace_state(id,state_json) VALUES(1,?)").run(JSON.stringify(initial));
}

app.use(express.json({limit:"10mb"}));
app.get("/api/health", (req,res) => res.json({status:"running",database:"connected",frontend:"full-spa"}));
app.get("/api/state", (req,res) => {
  const r = db.prepare("SELECT state_json FROM workspace_state WHERE id=1").get();
  try { res.json(JSON.parse(r.state_json)); }
  catch { res.status(500).json({error:"Invalid stored workspace state"}); }
});
app.put("/api/state", (req,res) => {
  const s = req.body || {};
  if (!Array.isArray(s.opportunities)) s.opportunities = [];
  if (!Array.isArray(s.sessions)) s.sessions = [];
  if (!Array.isArray(s.solutions)) s.solutions = [];
  db.prepare("UPDATE workspace_state SET state_json=?,updated_date=CURRENT_TIMESTAMP WHERE id=1").run(JSON.stringify(s));
  res.json({success:true});
});
app.get("/api/backup", (req,res) => {
  const r = db.prepare("SELECT state_json FROM workspace_state WHERE id=1").get();
  res.setHeader("Content-Disposition","attachment; filename=BlackDuckSEWorkspace-backup.json");
  res.type("application/json").send(r.state_json);
});
require("./call-prep")(app, db);
require("./se-library")(app, db, __dirname);
require("./research-exports")(app, db, __dirname);
require("./partner-prep-pipeline")(app, db, __dirname);
require("./partner-client-research")(app, db, __dirname);
require("./research-audit")(app, db, __dirname);
require("./meeting-records")(app, db, __dirname);
require("./history-v3")(app, db, __dirname);
require("./call-report-v4")(app, db, __dirname);
require("./meeting-plan-v7")(app, db, __dirname);
require("./discovery-framework-v10")(app, db, __dirname);
require("./meddpicc-v16")(app, db, __dirname);
require("./post-meeting-resynthesis")(app, db, __dirname);
require('./stage-management-v12')(app, db); // STAGE_MANAGEMENT_V12
require('./solution-discovery-pool-v15')(app, db); // SOLUTION_DISCOVERY_POOL_V15
require('./vision-capability-v17')(app, db); // VISION_CAPABILITY_PARTNER_DISCOVERY_V17
require('./conversation-intelligence-v18')(app, db); // CONVERSATION_INTELLIGENCE_V18
require('./executive-strategy-v20')(app, db, __dirname); // EXECUTIVE_STRATEGY_ENGINE_V20
app.use(express.static(path.join(__dirname,"frontend")));
app.get("/", (req,res) => res.sendFile(path.join(__dirname,"frontend","index.html")));
require('./v20-content-quality')(app, db); // V20_PROPER


app.use((req,res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({error:"API endpoint not found"});
  res.sendFile(path.join(__dirname,"frontend","index.html"));
});

app.listen(PORT,"127.0.0.1",() => console.log("Black Duck SE Workspace running on port " + PORT));























