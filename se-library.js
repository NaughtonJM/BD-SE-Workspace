const path = require("path");
const fs = require("fs");
const multer = require("multer");

function safeName(value) {
  return String(value || "general").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0,80);
}

module.exports = function registerLibrary(app, db, rootDir) {
  const assetsRoot = path.join(rootDir, "assets");
  fs.mkdirSync(assetsRoot, {recursive:true});
  db.exec(`
    CREATE TABLE IF NOT EXISTS se_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      title TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      audience TEXT DEFAULT '',
      description TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      filename TEXT NOT NULL,
      stored_path TEXT NOT NULL,
      created_date TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS se_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      product TEXT DEFAULT '',
      url TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_date TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existing = db.prepare("SELECT COUNT(*) AS n FROM se_resources").get().n;
  if (!existing) {
    const add = db.prepare("INSERT INTO se_resources(title,category,product,url,description) VALUES(?,?,?,?,?)");
    add.run("Black Duck LiteLLM Gateway","AI Tools","","https://llm.core.blackduck.com/ui/","Company LLM gateway and key management.");
  }

  const storage = multer.diskStorage({
    destination(req,file,cb) {
      const folder = path.join(assetsRoot, safeName(req.body.product), safeName(req.body.asset_type));
      fs.mkdirSync(folder,{recursive:true}); cb(null,folder);
    },
    filename(req,file,cb) {
      cb(null, Date.now() + "_" + safeName(file.originalname));
    }
  });
  const allowed = new Set([".mp4",".mov",".webm",".m4v",".pptx",".ppt",".pdf",".docx",".doc",".png",".jpg",".jpeg",".gif",".txt",".md"]);
  const upload = multer({storage,limits:{fileSize:1024*1024*1024},fileFilter(req,file,cb){
    const ext=path.extname(file.originalname).toLowerCase(); cb(allowed.has(ext)?null:new Error("Unsupported file type"),allowed.has(ext));
  }});

  app.use("/assets", require("express").static(assetsRoot));
  app.get("/api/se-assets",(req,res)=>res.json(db.prepare("SELECT * FROM se_assets ORDER BY id DESC").all()));
  app.post("/api/se-assets",upload.single("file"),(req,res)=>{
    if(!req.file) return res.status(400).json({error:"A file is required."});
    const rel=path.relative(assetsRoot,req.file.path).split(path.sep).join("/");
    const r=db.prepare("INSERT INTO se_assets(product,title,asset_type,audience,description,tags,filename,stored_path) VALUES(?,?,?,?,?,?,?,?)").run(req.body.product||"General",req.body.title||req.file.originalname,req.body.asset_type||"other",req.body.audience||"",req.body.description||"",req.body.tags||"",req.file.originalname,rel);
    res.status(201).json({success:true,id:Number(r.lastInsertRowid)});
  });
  app.delete("/api/se-assets/:id",(req,res)=>{
    const row=db.prepare("SELECT * FROM se_assets WHERE id=?").get(req.params.id);
    if(!row) return res.status(404).json({error:"Asset not found"});
    const full=path.join(assetsRoot,row.stored_path); if(fs.existsSync(full)) fs.unlinkSync(full);
    db.prepare("DELETE FROM se_assets WHERE id=?").run(req.params.id); res.json({success:true});
  });

  app.get("/api/se-resources",(req,res)=>res.json(db.prepare("SELECT * FROM se_resources ORDER BY category,title").all()));
  app.post("/api/se-resources",(req,res)=>{
    const b=req.body||{}; if(!b.title||!b.url) return res.status(400).json({error:"Title and URL are required."});
    try { new URL(b.url); } catch { return res.status(400).json({error:"Enter a valid full URL."}); }
    const r=db.prepare("INSERT INTO se_resources(title,category,product,url,description) VALUES(?,?,?,?,?)").run(b.title,b.category||"Other",b.product||"",b.url,b.description||"");
    res.status(201).json({success:true,id:Number(r.lastInsertRowid)});
  });
  app.delete("/api/se-resources/:id",(req,res)=>{db.prepare("DELETE FROM se_resources WHERE id=?").run(req.params.id);res.json({success:true});});
};
