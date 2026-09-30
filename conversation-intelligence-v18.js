"use strict";

module.exports = function conversationIntelligenceV18(app, db) {
  const MARKER = "CONVERSATION_INTELLIGENCE_V18";

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversation_intelligence_v18 (
      call_prep_id INTEGER PRIMARY KEY,
      source_text TEXT NOT NULL DEFAULT '',
      engagement_type TEXT NOT NULL DEFAULT 'Partner',
      analysis_json TEXT NOT NULL DEFAULT '{}',
      notes TEXT NOT NULL DEFAULT '',
      updated_by TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const getStmt = db.prepare(`
    SELECT call_prep_id, source_text, engagement_type, analysis_json,
           notes, updated_by, updated_at
    FROM conversation_intelligence_v18
    WHERE call_prep_id = ?
  `);

  const saveStmt = db.prepare(`
    INSERT INTO conversation_intelligence_v18
      (call_prep_id, source_text, engagement_type, analysis_json, notes, updated_by, updated_at)
    VALUES
      (@call_prep_id, @source_text, @engagement_type, @analysis_json, @notes, @updated_by, CURRENT_TIMESTAMP)
    ON CONFLICT(call_prep_id) DO UPDATE SET
      source_text = excluded.source_text,
      engagement_type = excluded.engagement_type,
      analysis_json = excluded.analysis_json,
      notes = excluded.notes,
      updated_by = excluded.updated_by,
      updated_at = CURRENT_TIMESTAMP
  `);

  const RULES = [
    {
      id: "supply_chain",
      match: /\b(sbom|open source|software supply chain|dependency|dependencies|container|license|component|supplier software)\b/i,
      theme: "Software Supply Chain Transparency",
      capability: "Open-source discovery, SBOM, policy, and continuous monitoring",
      technology: "SCA and binary composition analysis",
      products: ["Black Duck SCA", "Polaris", "BDBA"],
      competitors: ["Snyk", "Mend", "GitHub Advanced Security", "Sonatype"],
      questions: [
        "How are components discovered beyond declared package-manager dependencies?",
        "How are SBOMs generated, validated, monitored, and delivered?",
        "How is supplier software assessed when source or build access is unavailable?",
        "How quickly can every affected application be identified after a newly disclosed vulnerability?"
      ],
      demo: ["Black Duck SCA component discovery", "SBOM generation and policy", "BDBA artifact validation", "Polaris portfolio reporting"]
    },
    {
      id: "sast",
      match: /\b(sast|static analysis|code quality|false positive|source code|code defect|coverity|checkmarx|fortify|veracode|sonarqube|codeql)\b/i,
      theme: "Secure Proprietary Software Development",
      capability: "Deep and rapid static analysis with developer feedback",
      technology: "SAST and IDE security",
      products: ["Coverity", "Polaris", "Code Sight", "Signal"],
      competitors: ["Checkmarx", "OpenText Fortify", "Veracode", "SonarQube", "GitHub CodeQL"],
      questions: [
        "Which languages and frameworks must the analysis understand?",
        "Where do developers first receive security feedback?",
        "How much time is lost validating noisy or low-confidence findings?",
        "Which applications require rapid analysis, full analysis, or both?"
      ],
      demo: ["IDE feedback", "Rapid pull-request analysis", "Full interprocedural analysis", "Developer remediation workflow"]
    },
    {
      id: "runtime",
      match: /\b(dast|dynamic|web app|web application|api testing|runtime|iast|seeker|invicti|acunetix|burp|qualys|tenable)\b/i,
      theme: "Running Application and API Assurance",
      capability: "External, runtime-informed, and API testing",
      technology: "DAST and IAST",
      products: ["Polaris", "Continuous Dynamic", "Seeker"],
      competitors: ["Invicti", "Acunetix", "Burp Suite Enterprise", "Contrast Assess", "Qualys", "Tenable"],
      questions: [
        "Is the required perspective external, instrumented runtime, or both?",
        "Can the application be instrumented safely in QA or staging?",
        "Are authenticated APIs and production-scale targets in scope?",
        "What scale, concurrency, tuning, and evidence handoff must be demonstrated?"
      ],
      demo: ["Authorized target setup", "Dynamic or runtime test", "Finding validation", "Evidence export and prioritization"]
    },
    {
      id: "appsec_posture",
      match: /\b(aspm|posture|fragmented findings|multiple tools|portfolio risk|executive reporting|risk management|armorcode|vulcan|wiz)\b/i,
      theme: "Enterprise AppSec Risk Governance",
      capability: "Cross-tool aggregation, prioritization, policy, and reporting",
      technology: "ASPM and application-risk management",
      products: ["Software Risk Manager", "Polaris", "Polaris Assist"],
      competitors: ["ArmorCode", "Vulcan Cyber", "Wiz Code", "Phoenix Security"],
      questions: [
        "Which scanners must remain in the environment?",
        "How is application context attached to findings today?",
        "How does leadership decide which risks matter most?",
        "What reporting, ticketing, API, and governance workflows must be preserved?"
      ],
      demo: ["Third-party finding ingestion", "Application context", "Risk prioritization", "Executive reporting"]
    },
    {
      id: "ai",
      match: /\b(ai-assisted|ai generated|ai-generated|copilot|cursor|claude code|windsurf|codeium|agentic|genai|llm)\b/i,
      theme: "AI-Assisted Development Governance",
      capability: "Incremental, agentic, and security-context-grounded analysis",
      technology: "AI development security",
      products: ["Signal", "ContextAI", "Code Sight", "Polaris Assist"],
      competitors: ["GitHub Copilot", "Cursor", "Windsurf", "Codeium"],
      questions: [
        "Which coding assistants, agents, models, and repositories are approved?",
        "How is AI-generated code reviewed for security, provenance, and open-source risk?",
        "Where should security feedback appear in the AI-assisted workflow?",
        "How are AI-generated recommendations validated before action?"
      ],
      demo: ["AI-assisted change", "Incremental analysis", "Security-context explanation", "Governed remediation"]
    },
    {
      id: "restricted",
      match: /\b(air[- ]?gap|classified|enclave|offline|disconnected|sovereign|on-prem|on premises|high side|low side|hybrid)\b/i,
      theme: "Restricted, Sovereign, and Hybrid Delivery",
      capability: "Customer-controlled and mixed deployment models",
      technology: "On-premises, SaaS, and hybrid AppSec delivery",
      products: ["Black Duck SCA", "BDBA", "Coverity", "Seeker", "Defensics", "Software Risk Manager", "Polaris"],
      competitors: [],
      questions: [
        "Which workloads may use SaaS and which must remain inside a controlled boundary?",
        "Is analysis required on the low side, high side, or both?",
        "How will updates, licenses, policies, and results cross the boundary?",
        "Who operates and approves each deployment pattern?"
      ],
      demo: ["Deployment-boundary map", "Low-side analysis", "High-side artifact validation", "Common governance model"]
    },
    {
      id: "partner",
      match: /\b(partner|reseller|integrator|channel|carahsoft|thundercat|gdit|joint go-to-market|joint gtm)\b/i,
      theme: "Partner-Led Opportunity Development",
      capability: "Joint account access, enablement, funding, and customer value",
      technology: "Partner and channel motion",
      products: [],
      competitors: [],
      questions: [
        "Which customer relationship can the partner strengthen or unlock?",
        "What is the give-and-get for Black Duck and the partner?",
        "Can the partner carry the plain-language customer conversation with or without us?",
        "Which account, vehicle, funding path, and next action make the opportunity concrete?"
      ],
      demo: ["Partner value story", "Customer outcome", "Solution palette", "Joint next step"]
    },
    {
      id: "business_value",
      match: /\b(cost|budget|productivity|faster|speed|remediation|developer|ato|authorization to operate|compliance|roi|funding)\b/i,
      theme: "Developer Productivity and Risk-Cost Reduction",
      capability: "Earlier feedback, lower remediation effort, and repeatable evidence",
      technology: "DevSecOps workflow and governance",
      products: ["Polaris", "Coverity", "Black Duck SCA", "Code Sight", "Signal"],
      competitors: [],
      questions: [
        "Where does security currently delay delivery?",
        "How much rework occurs when findings arrive late?",
        "Which evidence is required for authorization, audit, or release?",
        "What measurable productivity, cost, or risk outcome would justify change?"
      ],
      demo: ["Early feedback", "Policy in the pipeline", "Remediation workflow", "Compliance evidence"]
    }
  ];

  function uniq(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function text(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); } catch { return String(value); }
  }

  function analyze(payload) {
    const sourceText = text(payload.sourceText).trim();
    const reportContext = text(payload.reportContext);
    const corpus = `${sourceText}\n${reportContext}`;
    const matches = RULES.filter(rule => rule.match.test(corpus));
    const selected = matches.length ? matches : [RULES.find(rule => rule.id === "business_value")];

    const themes = selected.map(rule => ({
      id: rule.id,
      theme: rule.theme,
      capability: rule.capability,
      technology: rule.technology,
      evidence: sourceText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && rule.match.test(line))
        .slice(0, 5)
    }));

    const products = uniq(selected.flatMap(rule => rule.products));
    const competitors = uniq(selected.flatMap(rule => rule.competitors));
    const questions = uniq(selected.flatMap(rule => rule.questions));
    const demoPath = uniq(selected.flatMap(rule => rule.demo));
    const engagementType = payload.engagementType || "Partner";
    const topTheme = selected[0];

    const executiveTalkTrack = engagementType === "Partner"
      ? `The opportunity is to help the partner lead with ${topTheme.theme.toLowerCase()}, connect that outcome to the customer's mission or business need, and then use the right Black Duck capabilities to show what good looks like.`
      : `The opportunity is to make ${topTheme.theme.toLowerCase()} practical: clarify the outcome, validate the current gap, and show how the right Black Duck capabilities improve security, delivery, and evidence without adding unnecessary complexity.`;

    const plainLanguage = `Start with the outcome, not the product. The conversation points to ${topTheme.theme.toLowerCase()}. Validate the current process and evidence gaps, then introduce only the capabilities needed to solve them.`;

    return {
      marker: MARKER,
      analyzedAt: new Date().toISOString(),
      engagementType,
      themes,
      capabilityAreas: uniq(selected.map(rule => rule.capability)),
      technologyAreas: uniq(selected.map(rule => rule.technology)),
      likelyCompetitors: competitors,
      recommendedProducts: products,
      discoveryQuestions: questions,
      executiveTalkTrack,
      plainLanguage,
      demoPath,
      nextActions: [
        "Validate the themes against the customer's or partner's exact words.",
        "Use the independent solution-discovery pool to qualify the recommended capability areas.",
        "Use competitive plays only after the incumbent technology is confirmed.",
        "Select a bounded demo path tied to one decision and measurable success criteria."
      ]
    };
  }

  app.get("/api/conversation-intelligence-v18/health", (req, res) => {
    res.json({ status: "running", marker: MARKER, rules: RULES.length });
  });

  app.post("/api/conversation-intelligence-v18/analyze", (req, res) => {
    const sourceText = text(req.body?.sourceText).trim();
    if (!sourceText) return res.status(400).json({ error: "Conversation notes or transcript text is required." });
    res.json({ success: true, analysis: analyze(req.body || {}) });
  });

  app.get("/api/conversation-intelligence-v18/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "A valid call-prep id is required." });
    const row = getStmt.get(id);
    if (!row) return res.json({
      call_prep_id: id,
      source_text: "",
      engagement_type: "Partner",
      analysis: {},
      notes: "",
      updated_by: "",
      updated_at: null
    });
    let analysis = {};
    try { analysis = JSON.parse(row.analysis_json || "{}"); } catch {}
    res.json({
      call_prep_id: row.call_prep_id,
      source_text: row.source_text,
      engagement_type: row.engagement_type,
      analysis,
      notes: row.notes,
      updated_by: row.updated_by,
      updated_at: row.updated_at
    });
  });

  app.put("/api/conversation-intelligence-v18/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "A valid call-prep id is required." });
    const sourceText = text(req.body?.sourceText).trim();
    if (!sourceText) return res.status(400).json({ error: "Conversation notes or transcript text is required." });
    const analysis = req.body?.analysis && typeof req.body.analysis === "object"
      ? req.body.analysis
      : analyze(req.body || {});
    const record = {
      call_prep_id: id,
      source_text: sourceText,
      engagement_type: text(req.body?.engagementType || "Partner"),
      analysis_json: JSON.stringify(analysis),
      notes: text(req.body?.notes),
      updated_by: text(req.body?.updatedBy || "Justin Naughton")
    };
    saveStmt.run(record);
    const saved = getStmt.get(id);
    res.json({ success: true, saved: id, updated_at: saved.updated_at, analysis });
  });
};
