const CAPABILITIES = `
OPEN SOURCE AND SUPPLY CHAIN
- Open Source Discovery | Black Duck SCA, Polaris | How do you determine which open source components are in your applications?
- Package Manager Analysis | Black Duck SCA, Polaris | Which package managers do your teams use?
- Signature Analysis | Black Duck SCA, Polaris | Could open source be copied directly into source trees?
- Binary Analysis | Black Duck SCA, Polaris, BDBA | Do you need to assess software without source code?
- Container Analysis | Black Duck SCA, Polaris | Where in the container lifecycle do you scan images?
- SBOM Generation | Black Duck SCA, Polaris, BDBA | Who is requesting SBOMs, and in which format?
- SBOM Ingestion | Black Duck SCA, Polaris, BDBA | What happens after a supplier sends an SBOM?
- Vulnerability Intelligence | Black Duck SCA, Polaris, BDBA | Which vulnerability intelligence sources do you rely on?
- License Compliance | Black Duck SCA, Polaris, BDBA | How are open source licenses approved before release?
- Policy Management | Black Duck SCA, Polaris | Which conditions should warn, require approval, or fail a build?
- Continuous Open Source Monitoring | Black Duck SCA, Polaris | How do you detect risk in software released months ago?

PROPRIETARY CODE
- Static Security Analysis | Coverity, Polaris | Which security defects most often escape code review?
- Static Quality Analysis | Coverity, Polaris | What quality defects most often escape functional testing?
- Deep Dataflow Analysis | Coverity, Polaris | Can your current tool show the complete path to a defect?
- Rapid Static Analysis | Coverity, Polaris | How quickly must results return to fit a pull request?
- Full Static Analysis | Coverity, Polaris | Which applications require the deepest analysis?

RUNNING APPLICATIONS AND APIS
- Interactive Application Security Testing | Seeker | Do developers struggle to reproduce findings?
- Runtime Dataflow Analysis | Seeker | Can current tools show actual runtime data flow?
- Dynamic Application Security Testing | Continuous Dynamic, Polaris | How frequently are running applications tested?
- API Dynamic Testing | Continuous Dynamic, Polaris | Are APIs included with web application testing?

PROTOCOLS, DEVICES, AND ROBUSTNESS
- Fuzz Testing | Defensics | How do you test malformed input?
- Protocol Fuzzing | Defensics | Which protocols are mission critical?
- API Fuzzing | Defensics | Do you test APIs against malformed requests?

ENTERPRISE GOVERNANCE
- Application Security Posture Management | Software Risk Manager | How many tools produce AppSec findings today?
- Third-Party Finding Aggregation | Software Risk Manager, Polaris | Which scanners must remain?
- Risk Prioritization | Software Risk Manager, Polaris, Signal | How do you decide what should be fixed next?
- Executive Risk Reporting | Software Risk Manager, Polaris | What AppSec metrics does leadership need?

DEVELOPER AND AI WORKFLOWS
- IDE Security Feedback | Code Sight, Signal | When do developers first see security feedback?
- AI-Assisted Triage | Polaris Assist, Polaris | How much time is spent manually triaging findings?
- Agentic Application Security | Signal | Which AI coding assistants are developers using?
- Incremental Code Analysis | Signal | Would developers act before commit if results were immediate?
- Coding Assistant Integration | Signal | Which coding assistants are approved?
- Language-Agnostic Analysis | Signal | Which languages are not adequately covered?
- Exploitability Analysis | Signal | How much of the backlog is considered noise?
- Security Knowledge Model | ContextAI, Signal, Polaris Assist | How do you validate AI-generated recommendations?

INTEGRATION AND DELIVERY
- SCM Integration | Black Duck SCA, Coverity, Polaris, Signal | Which source-control systems and trigger events do you use?
- CI/CD Integration | Black Duck SCA, Coverity, Polaris, Seeker, Signal | At which pipeline stages should each test run?
- Issue Tracking Integration | Black Duck SCA, Coverity, Polaris, Software Risk Manager | How are findings converted into developer work?
- APIs and Automation | Portfolio | Which systems must exchange AppSec data?
- SaaS Delivery | Polaris, Signal | Which applications may use SaaS testing?
- On-Premises Delivery | Black Duck SCA, BDBA, Coverity, Seeker, Defensics, Software Risk Manager | Must code and findings remain inside your environment?
- Hybrid Delivery | Black Duck SCA, Coverity, Polaris, Software Risk Manager | Which workloads can use SaaS and which must stay on premises?
`;

function systemPrompt() {
  return `You are a senior Black Duck public-sector partner sales engineer and channel strategist.
Create a practical discovery call script for a Black Duck meeting with a public-sector partner.
Lead with mission outcomes, partner economics, delivery risk, capture differentiation, and the consequences of failure. Do not begin with a product catalog.
Use only the user-provided context and the Black Duck capability reference below. Do not invent facts about the account, partner, contracts, incumbents, people, requirements, or relationships. Clearly label hypotheses and assumptions. If current research is needed, put it in facts_to_verify instead of presenting it as fact.
Select only the capabilities relevant to the stated meeting. Do not force every product into the script.
Return valid JSON only, with this exact shape:
{
 "title":"",
 "meeting_thesis":"",
 "desired_outcomes":[""],
 "opening_talk_track":"",
 "agenda":[{"minutes":"0-5","topic":"","talk_track":"","questions":["",""]}],
 "discovery_paths":[{"customer_signal":"","capability":"","products":[""],"questions":["","",""],"why_it_matters":"","follow_up_if_yes":"","follow_up_if_no":""}],
 "data_insight_questions":[{"data":"","insight":"","questions":["",""]}],
 "partner_value_hypotheses":[{"hypothesis":"","validation_question":""}],
 "likely_objections":[{"objection":"","response":""}],
 "recommended_next_step":"",
 "facts_to_verify":[""],
 "facilitator_notes":[""]
}
The agenda must fit the requested duration. Questions must be conversational, incisive, non-leading, and tied to customer or partner outcomes. Keep the complete result usable during a live call.

BLACK DUCK CAPABILITY REFERENCE:
${CAPABILITIES}`;
}

function register(app, db) {
  db.exec(`CREATE TABLE IF NOT EXISTS call_prep_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_name TEXT NOT NULL,
    account_name TEXT,
    input_json TEXT NOT NULL,
    result_json TEXT NOT NULL,
    model TEXT,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
  );`);

  app.get("/api/call-prep/history", (req,res) => {
    const rows = db.prepare("SELECT id,partner_name,account_name,model,created_date,result_json FROM call_prep_results ORDER BY id DESC LIMIT 20").all();
    res.json(rows.map(r => ({...r,result:JSON.parse(r.result_json)})));
  });

  app.post("/api/call-prep/generate", async (req,res) => {
    try {
      const apiKey = process.env.BLACKDUCK_LLM_API_KEY;
      const model = process.env.BLACKDUCK_LLM_MODEL || "gpt-4o";
      if (!apiKey) return res.status(503).json({error:"BLACKDUCK_LLM_API_KEY is not configured on the server."});
      const input = req.body || {};
      if (!String(input.partner_name||"").trim()) return res.status(400).json({error:"Partner name is required."});
      const userPrompt = `Prepare the partner discovery call using this input:\n${JSON.stringify(input,null,2)}`;
      const response = await fetch("https://llm.core.blackduck.com/v1/chat/completions", {
        method:"POST",
        headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},
        body:JSON.stringify({model,messages:[{role:"system",content:systemPrompt()},{role:"user",content:userPrompt}],temperature:0.2,response_format:{type:"json_object"}})
      });
      const raw = await response.text();
      if (!response.ok) return res.status(response.status).json({error:`LLM gateway returned ${response.status}`,details:raw.slice(0,2000)});
      const envelope = JSON.parse(raw);
      const content = envelope?.choices?.[0]?.message?.content;
      if (!content) throw new Error("The LLM returned no content.");
      const result = JSON.parse(content.replace(/^```json\s*|\s*```$/g,""));
      const info = db.prepare("INSERT INTO call_prep_results(partner_name,account_name,input_json,result_json,model) VALUES(?,?,?,?,?)").run(input.partner_name,input.account_name||"",JSON.stringify(input),JSON.stringify(result),model);
      res.json({id:Number(info.lastInsertRowid),model,result});
    } catch (e) {
      res.status(500).json({error:e.message});
    }
  });
}
module.exports = register;
