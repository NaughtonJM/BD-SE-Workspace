const path=require('path');
const Database=require(path.join(process.cwd(),'node_modules','better-sqlite3'));
const db=new Database(path.join(process.cwd(),'database','workspace.db'));
const expected=['id','title','category','product','url','description','created_date'];
const columns=db.prepare('PRAGMA table_info(se_resources)').all().map(x=>x.name);
for(const name of expected){if(!columns.includes(name))throw new Error('se_resources is missing column: '+name)}
const items=[
 {title:'Polaris SE Demo',product:'Polaris',url:'https://app-su2.highspot.com/items/65773be74b68925bf2e00abb',description:'Product-specific Highspot video | Polaris Platform | DevSecOps; SAST; SCA | External - No Download'},
 {title:'Polaris Sales Enablement Training Recording Sept2022',product:'Polaris',url:'https://app-su2.highspot.com/items/64fa1d9fcf0b1d01f45f8422',description:'Product-specific Highspot video | Polaris Platform | Internal'},
 {title:'Black Duck SE Demo - Core Features',product:'Black Duck SCA',url:'https://app-su2.highspot.com/items/657a09b3e62f82e3514ebca6',description:'Product-specific Highspot video | Black Duck SCA | Software Supply Chain; SCA | External - No Download'},
 {title:'Black Duck SE Intro',product:'Black Duck SCA',url:'https://app-su2.highspot.com/items/65b1252d042ca19986f57307',description:'Product-specific Highspot video | Black Duck SCA | Software Supply Chain; SCA | External - No Download'},
 {title:'Black Duck SE Demo - Developer Capabilities',product:'Black Duck SCA',url:'https://app-su2.highspot.com/items/657c92cc939b8e9c1f1f15dc',description:'Product-specific Highspot video | Black Duck SCA | Software Supply Chain; SCA | External - No Download'},
 {title:'Black Duck SE Demo - Security Capabilities',product:'Black Duck SCA',url:'https://app-su2.highspot.com/items/6687f46ed1f50bff9115e933',description:'Product-specific Highspot video | Black Duck SCA | Software Supply Chain; SCA | External'},
 {title:'Black Duck SE Demo - License Compliance Capabilities',product:'Black Duck SCA',url:'https://app-su2.highspot.com/items/6687f579d4d3fa0b6ad061db',description:'Product-specific Highspot video | Black Duck SCA | Software Supply Chain; SCA | External'},
 {title:'BDBA Standalone SE Demo',product:'BDBA',url:'https://app-su2.highspot.com/items/657c9515939b8ea55366ff4a',description:'Product-specific Highspot video | Black Duck Binary Analysis and Black Duck SCA | External - No Download'},
 {title:'Software Risk Manager SE Demo',product:'Software Risk Manager',url:'https://app-su2.highspot.com/items/657a05fd440f9eb14409c4ae',description:'Product-specific Highspot video | Software Risk Manager (ASPM/ASOC) | Enterprise AppSec | External - No Download'},
 {title:'Software Risk Manager SE Intro',product:'Software Risk Manager',url:'https://app-su2.highspot.com/items/65b653154e078d4dbec66066',description:'Product-specific Highspot video | Software Risk Manager (ASPM/ASOC) | Enterprise AppSec | External - No Download'},
 {title:'Coverity SE Demo',product:'Coverity',url:'https://app-su2.highspot.com/items/65846f89024e9384b7d0f0d5',description:'Product-specific Highspot video | Coverity SAST | Static Analysis | External - No Download'},
 {title:'Coverity SE Intro',product:'Coverity',url:'https://app-su2.highspot.com/items/65b14ed09a8cc462ccc36a40',description:'Product-specific Highspot video | Coverity SAST | Static Analysis | External - No Download'},
 {title:'Seeker IAST SE Demo',product:'Seeker',url:'https://app-su2.highspot.com/items/6584769779b09d9a1b7cb072',description:'Product-specific Highspot video | Seeker IAST | DevSecOps; IAST | External - No Download'},
 {title:'Seeker SE Intro',product:'Seeker',url:'https://app-su2.highspot.com/items/65b24a7ffa11a2d39cf00913',description:'Product-specific Highspot video | Seeker IAST | DevSecOps; IAST | External - No Download'},
 {title:'Code Sight IDE Plugin SE Demo',product:'Code Sight',url:'https://app-su2.highspot.com/items/65846a1268a9076b8a9de6e1',description:'Product-specific Highspot video | Code Sight IDE Plug-in | SAST; SCA | External - No Download'},
 {title:'Code Sight IDE Plugin SE Intro',product:'Code Sight',url:'https://app-su2.highspot.com/items/65b656d9dfe8864ff393175d',description:'Product-specific Highspot video | Code Sight IDE Plug-in | DevSecOps; SAST; SCA | External - No Download'},
 {title:'WhiteHat SE Intro',product:'Continuous Dynamic',url:'https://app-su2.highspot.com/items/65aff7b33ca95c3dfe9c2eaa',description:'Product-specific Highspot video | WhiteHat Dynamic | Enterprise AppSec; DAST | External - No Download'},
 {title:'Los Angeles County Win Story',product:'Continuous Dynamic',url:'https://app-su2.highspot.com/items/65a6c55d6ae8be1e803ecdf2',description:'Product-specific Highspot video | WhiteHat Dynamic | Internal'},
 {title:'Using the OSSRA as a Selling Tool',product:'Black Duck SCA',url:'https://app-su2.highspot.com/items/65dd0e21e468b7315adf6738',description:'Product-specific Highspot video | Black Duck SCA and Polaris Platform | Software Supply Chain | Internal'},
 {title:'Qualys Win Story',product:'Black Duck SCA; Coverity; BDBA',url:'https://app-su2.highspot.com/items/65cfd21b44b34cb3ef61f5d8',description:'Product-specific Highspot video | Black Duck Binary Analysis; Black Duck SCA; Coverity SAST; Audit Services | Internal'}
];
function extractUrl(value){
 const text=String(value||'');
 const match=text.match(/https?:\/\/(?:app-su2\.|blackduck\.)?highspot\.com\/(?:items|spots)\/[A-Za-z0-9]+(?:\?[^\s"'<]*)?/i)||text.match(/https?:\/\/[^\s"'<]+/i);
 return match?match[0].replace(/[),;]+$/,''):'';
}
const bad=db.prepare("SELECT id,url FROM se_resources WHERE url LIKE '%<a %' OR url LIKE '%href=%' OR url LIKE '%&quot;%' ").all();
const updateUrl=db.prepare('UPDATE se_resources SET url=? WHERE id=?');
let repaired=0;
for(const row of bad){const fixed=extractUrl(row.url);if(fixed){updateUrl.run(fixed,row.id);repaired++}}
const find=db.prepare('SELECT id FROM se_resources WHERE lower(url)=lower(?) LIMIT 1');
const insert=db.prepare("INSERT INTO se_resources(title,category,product,url,description,created_date) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)");
const update=db.prepare('UPDATE se_resources SET title=?,category=?,product=?,description=? WHERE id=?');
let inserted=0,updated=0;
const tx=db.transaction(()=>{for(const item of items){const existing=find.get(item.url);if(existing){update.run(item.title,'Highspot Video',item.product,item.description,existing.id);updated++}else{insert.run(item.title,'Highspot Video',item.product,item.url,item.description);inserted++}}});
tx();
const verified=db.prepare("SELECT COUNT(*) AS count FROM se_resources WHERE category='Highspot Video' AND url LIKE 'https://app-su2.highspot.com/items/%'").get().count;
const invalid=db.prepare("SELECT COUNT(*) AS count FROM se_resources WHERE category='Highspot Video' AND (url LIKE '%<%' OR url NOT LIKE 'https://%')").get().count;
if(verified<items.length||invalid>0)throw new Error(`Validation failed: verified=${verified}, expected=${items.length}, invalid=${invalid}`);
console.log(JSON.stringify({version:'20.5.0',catalogItems:items.length,inserted,updated,repaired,verified,invalid},null,2));