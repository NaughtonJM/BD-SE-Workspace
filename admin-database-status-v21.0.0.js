/* ADMIN_DATABASE_STATUS_API_V21_0_0 */
'use strict';
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const {initialize} = require('./database-bootstrap-v21.0.0');

module.exports = function(app) {
  function localOnly(req,res,next) {
    const ip=String(req.ip||req.socket?.remoteAddress||'');
    if(ip==='127.0.0.1'||ip==='::1'||ip==='::ffff:127.0.0.1') return next();
    return res.status(403).json({error:'Database administration is restricted to the local workstation.'});
  }
  function status() {
    const databasePath=path.join(__dirname,'database','workspace.db');
    const schemaPath=path.join(__dirname,'database','schema.sql');
    const exists=fs.existsSync(databasePath);
    let tables=[]; let counts={};
    if(exists) {
      const db=new Database(databasePath,{readonly:true});
      try {
        tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(x=>x.name);
        for(const table of ['se_resources','se_assets','call_preps']) {
          if(tables.includes(table)) counts[table]=db.prepare(`SELECT COUNT(*) count FROM ${table}`).get().count;
        }
      } finally { db.close(); }
    }
    return {databasePath,schemaPath,exists,initialized:exists&&tables.length>0,tables,counts,portableRoot:__dirname};
  }
  app.get('/api/admin/database-status',localOnly,(req,res)=>{try{res.json(status())}catch(e){res.status(500).json({error:e.message})}});
  app.post('/api/admin/database-initialize',localOnly,(req,res)=>{try{initialize(__dirname);res.json({...status(),message:'Portable database initialized successfully.'})}catch(e){res.status(500).json({error:e.message})}});
};