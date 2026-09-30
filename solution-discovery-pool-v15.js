"use strict";

module.exports = function installSolutionDiscoveryPoolV15(app, db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS solution_discovery_pool_v15 (
      call_prep_id INTEGER PRIMARY KEY,
      answers_json TEXT NOT NULL DEFAULT '[]',
      recommendations_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      updated_by TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const read = db.prepare(`
    SELECT call_prep_id, answers_json, recommendations_json, notes, updated_by, updated_at
    FROM solution_discovery_pool_v15
    WHERE call_prep_id = ?
  `);

  const write = db.prepare(`
    INSERT INTO solution_discovery_pool_v15
      (call_prep_id, answers_json, recommendations_json, notes, updated_by, updated_at)
    VALUES
      (@call_prep_id, @answers_json, @recommendations_json, @notes, @updated_by, CURRENT_TIMESTAMP)
    ON CONFLICT(call_prep_id) DO UPDATE SET
      answers_json = excluded.answers_json,
      recommendations_json = excluded.recommendations_json,
      notes = excluded.notes,
      updated_by = excluded.updated_by,
      updated_at = CURRENT_TIMESTAMP
  `);

  function parse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  app.get("/api/solution-discovery-v15/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid call-prep id" });
    const row = read.get(id);
    if (!row) return res.json({ call_prep_id: id, answers: [], recommendations: [], notes: "", updated_by: "", updated_at: null });
    res.json({
      call_prep_id: row.call_prep_id,
      answers: parse(row.answers_json, []),
      recommendations: parse(row.recommendations_json, []),
      notes: row.notes || "",
      updated_by: row.updated_by || "",
      updated_at: row.updated_at
    });
  });

  app.put("/api/solution-discovery-v15/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid call-prep id" });
    const body = req.body || {};
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const recommendations = Array.isArray(body.recommendations) ? body.recommendations : [];
    write.run({
      call_prep_id: id,
      answers_json: JSON.stringify(answers),
      recommendations_json: JSON.stringify(recommendations),
      notes: String(body.notes || ""),
      updated_by: String(body.updatedBy || "Justin Naughton")
    });
    const row = read.get(id);
    res.json({ success: true, call_prep_id: id, saved: answers.length, updated_at: row.updated_at });
  });
};