const path=require('path');
const Database=require(path.join(process.cwd(),'node_modules','better-sqlite3'));
const db=new Database(path.join(process.cwd(),'database','workspace.db'));
const required=['id','title','category','product','url','description','created_date'];
const columns=db.prepare('PRAGMA table_info(se_resources)').all().map(x=>x.name);
for(const c of required){if(!columns.includes(c))throw new Error('se_resources missing column: '+c)}

const videos=[
  ['Polaris SE Demo','Polaris','https://app-su2.highspot.com/items/65773be74b68925bf2e00abb','Official Highspot inventory | Video | Polaris Platform | DevSecOps; SAST; SCA | External - No Download'],
  ['Polaris Sales Enablement Training Recording Sept2022','Polaris','https://app-su2.highspot.com/items/64fa1d9fcf0b1d01f45f8422','Official Highspot inventory | Video | Polaris Platform | Internal'],
  ['Black Duck SE Demo - Core Features','Black Duck SCA','https://app-su2.highspot.com/items/657a09b3e62f82e3514ebca6','Official Highspot inventory | Video | Black Duck SCA | SCA | External - No Download'],
  ['Black Duck SE Intro','Black Duck SCA','https://app-su2.highspot.com/items/65b1252d042ca19986f57307','Official Highspot inventory | Video | Black Duck SCA | SCA | External - No Download'],
  ['Black Duck SE Demo - Developer Capabilities','Black Duck SCA','https://app-su2.highspot.com/items/657c92cc939b8e9c1f1f15dc','Official Highspot inventory | Video | Black Duck SCA | SCA | External - No Download'],
  ['Black Duck SE Demo - Security Capabilities','Black Duck SCA','https://app-su2.highspot.com/items/6687f46ed1f50bff9115e933','Official Highspot inventory | Video | Black Duck SCA | SCA | External'],
  ['Black Duck SE Demo - License Compliance Capabilities','Black Duck SCA','https://app-su2.highspot.com/items/6687f579d4d3fa0b6ad061db','Official Highspot inventory | Video | Black Duck SCA | SCA | External'],
  ['BDBA Standalone SE Demo','BDBA','https://app-su2.highspot.com/items/657c9515939b8ea55366ff4a','Official Highspot inventory | Video | Black Duck Binary Analysis and Black Duck SCA | External - No Download'],
  ['Software Risk Manager SE Demo','Software Risk Manager','https://app-su2.highspot.com/items/657a05fd440f9eb14409c4ae','Official Highspot inventory | Video | Software Risk Manager | ASPM/ASOC | External - No Download'],
  ['Software Risk Manager SE Intro','Software Risk Manager','https://app-su2.highspot.com/items/65b653154e078d4dbec66066','Official Highspot inventory | Video | Software Risk Manager | ASPM/ASOC | External - No Download'],
  ['Coverity SE Demo','Coverity','https://app-su2.highspot.com/items/65846f89024e9384b7d0f0d5','Official Highspot inventory | Video | Coverity SAST | External - No Download'],
  ['Coverity SE Intro','Coverity','https://app-su2.highspot.com/items/65b14ed09a8cc462ccc36a40','Official Highspot inventory | Video | Coverity SAST | External - No Download'],
  ['Seeker IAST SE Demo','Seeker','https://app-su2.highspot.com/items/6584769779b09d9a1b7cb072','Official Highspot inventory | Video | Seeker IAST | DevSecOps; IAST | External - No Download'],
  ['Seeker SE Intro','Seeker','https://app-su2.highspot.com/items/65b24a7ffa11a2d39cf00913','Official Highspot inventory | Video | Seeker IAST | DevSecOps; IAST | External - No Download'],
  ['Code Sight IDE Plugin SE Demo','Code Sight','https://app-su2.highspot.com/items/65846a1268a9076b8a9de6e1','Official Highspot inventory | Video | Code Sight IDE Plug-in | SAST; SCA | External - No Download'],
  ['Code Sight IDE Plugin SE Intro','Code Sight','https://app-su2.highspot.com/items/65b656d9dfe8864ff393175d','Official Highspot inventory | Video | Code Sight IDE Plug-in | DevSecOps; SAST; SCA | External - No Download'],
  ['WhiteHat SE Intro','Continuous Dynamic','https://app-su2.highspot.com/items/65aff7b33ca95c3dfe9c2eaa','Official Highspot inventory | Video | WhiteHat Dynamic | DAST | External - No Download'],
  ['Los Angeles County Win Story','Continuous Dynamic','https://app-su2.highspot.com/items/65a6c55d6ae8be1e803ecdf2','Official Highspot inventory | Video | WhiteHat Dynamic | Internal'],
  ['Using the OSSRA as a Selling Tool','Black Duck SCA / Polaris','https://app-su2.highspot.com/items/65dd0e21e468b7315adf6738','Official Highspot inventory | Video | Black Duck SCA; Polaris Platform | Internal'],
  ['Qualys Win Story','Black Duck SCA / Coverity / BDBA','https://app-su2.highspot.com/items/65cfd21b44b34cb3ef61f5d8','Official Highspot inventory | Video | Black Duck Binary Analysis; Black Duck SCA; Coverity SAST | Internal']
];

const find=db.prepare('SELECT id FROM se_resources WHERE lower(url)=lower(?) LIMIT 1');
const insert=db.prepare("INSERT INTO se_resources(title,category,product,url,description,created_date) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)");
const update=db.prepare('UPDATE se_resources SET title=?,category=?,product=?,description=? WHERE id=?');
let inserted=0,updated=0;
const run=db.transaction(()=>{
  for(const [title,product,url,description] of videos){
    const existing=find.get(url);
    if(existing){update.run(title,'Highspot Video',product,description,existing.id);updated++;}
    else{insert.run(title,'Highspot Video',product,url,description);inserted++;}
  }
});
run();
const rows=db.prepare("SELECT title,product,url FROM se_resources WHERE category='Highspot Video' ORDER BY product,title").all();
const invalid=rows.filter(x=>!/^https:\/\/app-su2\.highspot\.com\/items\/[A-Za-z0-9]+/.test(x.url));
const expectedMissing=videos.filter(v=>!rows.some(r=>r.url.toLowerCase()===v[2].toLowerCase()));
if(invalid.length||expectedMissing.length)throw new Error(`Validation failed. invalid=${invalid.length}, missing=${expectedMissing.length}`);
console.log(JSON.stringify({version:'20.5.1',catalogSize:videos.length,inserted,updated,totalHighspotVideos:rows.length,products:[...new Set(rows.map(x=>x.product))]},null,2));