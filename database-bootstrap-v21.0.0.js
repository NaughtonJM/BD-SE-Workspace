/* PORTABLE_DATABASE_BOOTSTRAP_V21_0_0 */
'use strict';
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function initialize(root = __dirname) {
  const databaseDir = path.join(root, 'database');
  const schemaPath = path.join(databaseDir, 'schema.sql');
  const databasePath = path.join(databaseDir, 'workspace.db');
  fs.mkdirSync(databaseDir, {recursive:true});
  fs.mkdirSync(path.join(root, 'assets'), {recursive:true});
  fs.mkdirSync(path.join(root, 'exports'), {recursive:true});
  const existed = fs.existsSync(databasePath);
  if (!fs.existsSync(schemaPath)) throw new Error(`Database schema not found: ${schemaPath}`);
  const db = new Database(databasePath);
  try {
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    if (!existed) db.exec(fs.readFileSync(schemaPath, 'utf8'));
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(x=>x.name);
    if (!tables.length) {
      db.exec(fs.readFileSync(schemaPath, 'utf8'));
      const retry = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
      if (!retry.length) throw new Error('Schema execution created no application tables.');
    }
    return {databasePath, schemaPath, created:!existed, tables};
  } finally { db.close(); }
}

if (require.main === module) {
  const result = initialize(process.cwd());
  console.log(JSON.stringify(result, null, 2));
}
module.exports = {initialize};