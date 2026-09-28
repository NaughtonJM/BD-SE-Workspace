function cleanJson(value) {
  return String(value || "").replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
}
async function askJson(apiKey, model, system, user) {
  const response = await fetch("https://llm.core.blackduck.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }]
    })
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`LLM gateway returned ${response.status}: ${raw.slice(0, 1500)}`);
  const envelope = JSON.parse(raw);
  const content = envelope?.choices?.[0]?.message?.content;
  if (!content) throw new Error("The LLM returned no content.");
  return JSON.parse(cleanJson(content));
}
const RESEARCH_SYSTEM = `You are a senior Black Duck public-sector channel and alliance strategist. Build a strategic partner-account research draft from the user's standard Call Prep input. This research will drive a formal Word account plan, an executive PowerPoint, and a second AI request that prepares the live call.

Do not invent facts, contracts, values, dates, titles, relationships, quotations, incumbents, customer needs, or product capabilities. Use only facts supplied in the input or facts you can actually verify using capabilities available to you. Never imply web research occurred unless it truly did. Separate verified facts from analytical hypotheses. Put unsupported claims and evidence gaps in qa_findings. Add direct URLs to sources only when supplied or genuinely verified.

Return valid JSON only with exactly these top-level fields:
{
"partner_name":"","executive_summary":"","decision":"","why_now":"","opening":"","lighthouse":"","primary_risk":"","partnership_thesis":"",
"corporate_profile":[{"dimension":"","context":"","implication":""}],
"challenges":[{"title":"","environment":"","evidence":"","opening":"","confidence":""}],
"trends":[{"title":"","significance":"","markets":"","implication":""}],
"opportunities":[{"name":"","agency_status":"","scope":"","entry":"","motion":"","confidence":""}],
"swot":[{"factor":"","assessment":"","response":""}],
"value_proposition":[{"capability":"","partner_value":"","commercial_impact":""}],
"partnership_framework":[{"theme":"","problem":"","joint_offering":"","benefits":"","first_action":""}],
"stakeholders":[{"stakeholder":"","status":"","influence":"","value":"","approach":""}],
"channel_plan":[{"period":"","action":"","owner":"","outcome":"","dependency":""}],
"meeting_agenda":[{"time":"","topic":"","output":"","questions":["",""]}],
"executive_themes":[{"headline":"","why":"","questions":["",""] ,"objection":"","response":""}],
"headwinds_tailwinds":[{"type":"Headwind or Tailwind","development":"","effect":"","action":"","measure":""}],
"competitive_landscape":[{"category":"","risk":"","strategy":""}],
"account_strategy":[{"element":"","recommendation":""}],
"immediate_actions":[""],"sources":[{"title":"","url":""}],
"qa_findings":[{"finding":"","status":""}]
}`;
const CALL_SYSTEM = `You are a senior Black Duck public-sector partner sales engineer. Prepare a practical live discovery call using the supplied strategic research as the primary context.

Do not independently invent a generic call. Convert the research's strongest verified findings, clearly labeled hypotheses, risks, opportunity signals, stakeholder priorities, partnership themes, and next actions into the meeting thesis, opening, agenda, discovery paths, data-insight questions, objections, and next step. Do not present research gaps as facts. Select only Black Duck capabilities relevant to the research and original meeting input. Questions must be conversational, non-leading, and tied to partner economics, capture differentiation, delivery risk, mission outcomes, and validation of assumptions.

Return valid JSON only with exactly this shape:
{
"title":"","meeting_thesis":"","desired_outcomes":[""],"opening_talk_track":"",
"agenda":[{"minutes":"0-5","topic":"","talk_track":"","questions":["",""]}],
"discovery_paths":[{"customer_signal":"","capability":"","products":[""],"questions":["","",""],"why_it_matters":"","follow_up_if_yes":"","follow_up_if_no":""}],
"data_insight_questions":[{"data":"","insight":"","questions":["",""]}],
"partner_value_hypotheses":[{"hypothesis":"","validation_question":""}],
"likely_objections":[{"objection":"","response":""}],
"recommended_next_step":"","facts_to_verify":[""],"facilitator_notes":[""]
}`;
module.exports = function register(app, db) {
  const names = db.prepare("PRAGMA table_info(call_prep_results)").all().map(x => x.name);
  if (!names.includes("research_json")) db.exec("ALTER TABLE call_prep_results ADD COLUMN research_json TEXT");

  app.post("/api/partner-prep/generate", async (req, res) => {
    try {
      const input = req.body || {};
      const apiKey = process.env.BLACKDUCK_LLM_API_KEY;
      const model = process.env.BLACKDUCK_LLM_MODEL || "gpt-4o";
      if (!apiKey) return res.status(503).json({ error: "BLACKDUCK_LLM_API_KEY is not configured." });
      if (!String(input.partner_name || "").trim()) return res.status(400).json({ error: "Partner name is required." });

      const research = await askJson(apiKey, model, RESEARCH_SYSTEM,
        `Create the strategic partner research from this standard Call Prep input.\n\n${JSON.stringify(input, null, 2)}`);
      const result = await askJson(apiKey, model, CALL_SYSTEM,
        `Create the prepared call from the original input and completed strategic research.\n\nORIGINAL INPUT:\n${JSON.stringify(input, null, 2)}\n\nSTRATEGIC RESEARCH:\n${JSON.stringify(research, null, 2)}`);

      const info = db.prepare("INSERT INTO call_prep_results(partner_name,account_name,input_json,result_json,research_json,model) VALUES(?,?,?,?,?,?)")
        .run(input.partner_name, input.account_name || "", JSON.stringify(input), JSON.stringify(result), JSON.stringify(research), model);
      res.json({ id: Number(info.lastInsertRowid), model, result, research });
    } catch (error) { res.status(500).json({ error: error.message }); }
  });

  app.get("/api/partner-prep/history", (req, res) => {
    const rows = db.prepare(`
      SELECT c.id,c.partner_name,c.account_name,c.model,c.created_date,c.result_json,c.research_json,
             e.report_path,e.deck_path,e.created_date AS export_created
      FROM call_prep_results c
      LEFT JOIN research_exports e ON e.id=(
        SELECT id FROM research_exports x WHERE x.call_prep_id=c.id ORDER BY x.id DESC LIMIT 1
      )
      ORDER BY c.id DESC LIMIT 50
    `).all();
    res.json(rows.map(row => ({
      id: row.id, partner_name: row.partner_name, account_name: row.account_name,
      model: row.model, created_date: row.created_date,
      result: JSON.parse(row.result_json),
      research: row.research_json ? JSON.parse(row.research_json) : null,
      report_url: row.report_path ? "/exports/" + encodeURIComponent(row.report_path) : null,
      deck_url: row.deck_path ? "/exports/" + encodeURIComponent(row.deck_path) : null,
      report_name: row.report_path || null, deck_name: row.deck_path || null,
      export_created: row.export_created || null
    })));
  });
};
