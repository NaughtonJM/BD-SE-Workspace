CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account TEXT,
    opportunity_name TEXT,
    stage TEXT,
    partner TEXT,
    timing TEXT,
    context TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discovery_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER,
    title TEXT,
    personas TEXT,
    summary TEXT,
    notes TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS capability_hits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER,
    capability TEXT,
    product TEXT,
    score INTEGER,
    evidence TEXT
);

CREATE TABLE IF NOT EXISTS solution_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER,
    primary_products TEXT,
    adjacent_products TEXT,
    decision_notes TEXT,
    status TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS action_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER,
    owner TEXT,
    description TEXT,
    due_date TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS partner_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER,
    partner_name TEXT,
    strategy TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS competitive_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER,
    competitor TEXT,
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT
);
