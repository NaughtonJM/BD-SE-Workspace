const path=require('path');
const Database=require(path.join(process.cwd(),'node_modules','better-sqlite3'));
const db=new Database(path.join(process.cwd(),'database','workspace.db'));
const required=['id','title','category','product','url','description','created_date'];
const columns=db.prepare('PRAGMA table_info(se_resources)').all().map(x=>x.name);
for(const c of required){if(!columns.includes(c))throw new Error('se_resources missing column: '+c)}
const R=(title,category,product,url,description)=>({title,category,product,url,description});
const rows=[
R('Product, Service & Solution Info','Highspot Catalog','Portfolio','https://blackduck.highspot.com/spots/64c7e181ae3fb2448bf1dd01','Official Highspot portfolio source supplied from Product, Service & Solution Info.'),
R('Sales & Marketing Materials','Highspot Catalog','Portfolio','https://blackduck.highspot.com/spots/64c937f6a3538d4619854c67','Official Highspot sales and marketing source.'),
R('Sales Presentations','Highspot Catalog','Portfolio','https://blackduck.highspot.com/spots/64c937f6a3538d4619854c67?list=64d139ee96d3bbb5d6d47d17','Official Highspot Sales Presentation filter. Source page showed 32 results.'),
R('Product Videos','Highspot Catalog','Portfolio','https://blackduck.highspot.com/spots/64c937f6a3538d4619854c67?list=64d13b566410d0e763bce23a','Official Highspot Video filter. Source page showed 92 results.'),
R('Datasheets and Product Overviews','Highspot Catalog','Portfolio','https://blackduck.highspot.com/spots/64c937f6a3538d4619854c67?list=64d13a217cbd2dbc1c9ba7f7&overview=false','Official Highspot Datasheet / Product Overview filter.'),
R('Competitor Battle Cards','Highspot Catalog','Competitive Intelligence','https://blackduck.highspot.com/spots/64c936e89257b15b1778af12','Official Highspot competitor battlecard spot.'),

R('Black Duck Binary Analysis','Product Overview','BDBA','https://blackduck.highspot.com/items/650da52616f799f954f84b48','Official product overview.'),
R('Black Duck SCA','Product Overview','Black Duck SCA','https://blackduck.highspot.com/items/650da3ac16f799f2c367b62a','Official product overview.'),
R('Code Sight IDE plugin','Product Overview','Code Sight','https://blackduck.highspot.com/items/650d9e0c410ebce8e960731e','Official product overview.'),
R('Continuous Dynamic DAST','Product Overview','Continuous Dynamic','https://blackduck.highspot.com/items/65162deb48c52eb25159a710','Official product overview.'),
R('Coverity SAST','Product Overview','Coverity','https://blackduck.highspot.com/items/650df0198cfa2efd08c0d822','Official product overview.'),
R('Defensics Fuzz','Product Overview','Defensics','https://blackduck.highspot.com/items/650dc53fd8b64757f0f3dadf','Official product overview.'),
R('Polaris Platform','Product Overview','Polaris','https://blackduck.highspot.com/items/64cc14413f9fd13d5bea89e3','Official product overview.'),
R('NowSecure MAST','Product Overview','NowSecure MAST','https://blackduck.highspot.com/items/65162ffbf78dc0b234b45093','Official product overview.'),

R('Black Duck SCA Datasheet','Datasheet','Black Duck SCA','https://blackduck.highspot.com/items/6504835cecd08f8d1efd4cfe','Official Highspot datasheet.'),
R('Black Duck Binary Analysis Datasheet','Datasheet','BDBA','https://blackduck.highspot.com/items/6504851becd08f9254320fb8','Official Highspot datasheet.'),
R('Coverity Static Analysis Datasheet','Datasheet','Coverity','https://blackduck.highspot.com/items/65048c71d2ccf796581063ec','Official Highspot datasheet.'),
R('Defensics Datasheet','Datasheet','Defensics','https://blackduck.highspot.com/items/65048d394f57d7a9ae4c00f3','Official Highspot datasheet.'),
R('Polaris Datasheet','Datasheet','Polaris','https://blackduck.highspot.com/items/64d11473c771834e54e56465','Official Highspot datasheet.'),
R('Seeker Datasheet','Datasheet','Seeker','https://blackduck.highspot.com/items/65048942d2ccf7965810550a','Official Highspot datasheet.'),
R('Software Risk Manager Datasheet','Datasheet','Software Risk Manager','https://blackduck.highspot.com/items/6504846dd2ccf78d4a59ad0b','Official Highspot datasheet.'),
R('Code Sight Datasheet','Datasheet','Code Sight','https://blackduck.highspot.com/items/650482d804701b81352dc917','Official Highspot datasheet.'),
R('Continuous Dynamic (WhiteHat) Datasheet','Datasheet','Continuous Dynamic','https://blackduck.highspot.com/items/65089bd27b2c20cf08807d84','Official Highspot datasheet.'),
R('Black Duck AI Solutions Datasheet','Datasheet','Signal','https://blackduck.highspot.com/items/69e2a88ce587a00a83c3c90c','Official Highspot AI solutions datasheet.'),
R('Black Duck Portfolio Datasheet','Datasheet','Portfolio','https://blackduck.highspot.com/items/667c76f1a15360934f26e53b','Official portfolio datasheet.'),
R('Black Duck Portfolio Overview - Public Sector','Datasheet','Public Sector','https://blackduck.highspot.com/items/67af71edd8cdeac7ea293e3b','Official public-sector portfolio overview.'),
R('Fuzz Testing Software Development Kit (Defensics SDK)','Datasheet','Defensics','https://blackduck.highspot.com/items/66aa9a30b30ab821d5e286db','Official Defensics SDK resource.'),
R('Black Duck Dynamic Application Security Testing Solutions','Datasheet','Continuous Dynamic','https://blackduck.highspot.com/items/67875400c9d9fcaaf1873e36','Official DAST solutions resource.'),

R('Black Duck Implementation Packages','Implementation Services','Black Duck SCA','https://blackduck.highspot.com/items/6661fdd452a8ce79daf8cd1d','Official implementation packages.'),
R('Coverity Implementation Packages','Implementation Services','Coverity','https://blackduck.highspot.com/items/6662212aa7d4893076d3b19c','Official implementation packages.'),
R('Defensics Implementation Packages','Implementation Services','Defensics','https://blackduck.highspot.com/items/66621f3980c5212937e69415','Official implementation packages.'),
R('Polaris Implementation Packages','Implementation Services','Polaris','https://blackduck.highspot.com/items/666205d7a7d489a04aa878c6','Official implementation packages.'),
R('Seeker Implementation Packages','Implementation Services','Seeker','https://blackduck.highspot.com/items/6662047d80c5219c6ac93041','Official implementation packages.'),
R('Software Risk Manager Integrated Implementation Packages','Implementation Services','Software Risk Manager','https://blackduck.highspot.com/items/6662235242c77d3a98893efd','Official implementation packages.'),
R('Software Risk Manager Stand-Alone Implementation Packages','Implementation Services','Software Risk Manager','https://blackduck.highspot.com/items/666222ab52a8ce492ccc5dd7','Official implementation packages.'),
R('Expert Service Hours','Implementation Services','Portfolio','https://blackduck.highspot.com/items/66622400fab7ee2c91ac528a','Expert services for Black Duck, Coverity, Defensics, Seeker, SRM, and Polaris.'),
R('Customer Delivery Services Overview','Implementation Services','Portfolio','https://blackduck.highspot.com/items/65972152738950c511c52332','Customer Delivery Services PowerPoint.'),

R('Snyk Battlecard','Battlecard','Portfolio','https://blackduck.highspot.com/items/65f497c297ff6f696f6299b1','Official competitor battlecard.'),
R('Checkmarx Battlecard','Battlecard','Portfolio','https://blackduck.highspot.com/items/6601ee9d4b438c3e36dc1609','Official competitor battlecard.'),
R('Veracode Battlecard','Battlecard','Portfolio','https://blackduck.highspot.com/items/6626d3079d722449d479ecc8','Official competitor battlecard.'),
R('GitHub Advanced Security Battlecard','Battlecard','Portfolio','https://blackduck.highspot.com/items/660713a3ed9e9f8b0c7bf46a','Official competitor battlecard.'),
R('JFrog Battlecard','Battlecard','Black Duck SCA','https://blackduck.highspot.com/items/6a3ec1d4b3ffa30aef4db9ab','Official SCA competitor battlecard.'),
R('Chainguard Battlecard','Battlecard','Black Duck SCA','https://blackduck.highspot.com/items/6a456841fd0a7b0909ba5da6','Official SCA competitor battlecard.'),
R('Perforce Klocwork Battlecard','Battlecard','Coverity','https://blackduck.highspot.com/items/669fba0a28f912975922a983','Official SAST competitor battlecard.'),
R('SonarQube Battlecard','Battlecard','Coverity','https://blackduck.highspot.com/items/666c7df91865f25e0c3eb9c7','Official SAST competitor battlecard.'),
R('Contrast Security Battlecard','Battlecard','Seeker','https://blackduck.highspot.com/items/6658b9ff0e27de3015c17356','Official IAST, DAST, and ASPM competitor battlecard.'),
R('ArmorCode Battlecard','Battlecard','Software Risk Manager','https://blackduck.highspot.com/items/66e300989b273a184a78bcd9','Official ASPM competitor battlecard.'),
R('Why Choose Black Duck Polaris Over Veracode','Competitive Intelligence','Polaris','https://blackduck.highspot.com/items/685334ac5f4579830bb039df','Official competitive positioning resource.'),

R('True Scale AI Presentation Training','Highspot Video','Signal','https://blackduck.highspot.com/items/68bb1d58c05b5209dd452218?lfrm=shp.0','Enablement and Training video.'),
R('Los Angeles County Win Story','Highspot Video','Continuous Dynamic','https://blackduck.highspot.com/items/65a6c55d6ae8be1e803ecdf2?lfrm=shp.3','Enablement and Training video.'),
R('IRS Win Story','Highspot Video','Public Sector','https://blackduck.highspot.com/items/6708104fce593c8c699faf7d?lfrm=shp.4','Enablement and Training video.'),
R('Qualys Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/65cfd21b44b34cb3ef61f5d8?lfrm=shp.5','Enablement and Training video.'),
R('Terna Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/65ae88a40fa7889e46e98c63?lfrm=shp.9','Enablement and Training video.'),
R('Amazon Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/6703f4bba2bde0b273eac9cc?lfrm=shp.13','Enablement and Training video.'),
R('Thales Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/65cfd39a44b34cb76c61f40e?lfrm=shp.19','Enablement and Training video.'),
R('Accelerate AI Tier 1 - Messaging and Concept Training','Highspot Video','Signal','https://blackduck.highspot.com/items/68712fb2d0433582be72e74e?lfrm=shp.20','Enablement and Training video.'),
R('Carl Zeiss Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/65ef1fe7e926d1ccf031b2cb?lfrm=shp.23','Enablement and Training video.'),
R('Danske Bank Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/66202c434794772222555cb8?lfrm=shp.26','Enablement and Training video.'),
R('LSEG Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/66202a29631da9412c85748a?lfrm=shp.29','Enablement and Training video.'),
R('Ambarella Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/66202ba2a3b7ac2eeba87745?lfrm=shp.30','Enablement and Training video.'),
R('Keysight Technologies Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/6708109d461c11ac7f520c49?lfrm=shp.31','Enablement and Training video.'),
R('Exam Works Win Story','Highspot Video','Portfolio','https://blackduck.highspot.com/items/67080f5ed1af62ada2c236f2?lfrm=shp.34','Enablement and Training video.')
];
function canonical(url){try{const u=new URL(url);u.searchParams.delete('lfrm');u.searchParams.delete('forward');u.hash='';return u.toString().replace(/\/$/,'')}catch{return String(url)}}
const existing=db.prepare('SELECT id,url FROM se_resources').all();
const byCanonical=new Map(existing.map(x=>[canonical(x.url).toLowerCase(),x.id]));
const insert=db.prepare("INSERT INTO se_resources(title,category,product,url,description,created_date) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)");
const update=db.prepare('UPDATE se_resources SET title=?,category=?,product=?,url=?,description=? WHERE id=?');
let inserted=0,updated=0;
const tx=db.transaction(()=>{for(const x of rows){const key=canonical(x.url).toLowerCase(),id=byCanonical.get(key);if(id){update.run(x.title,x.category,x.product,x.url,x.description,id);updated++}else{const info=insert.run(x.title,x.category,x.product,x.url,x.description);byCanonical.set(key,info.lastInsertRowid);inserted++}}});
tx();
const found=db.prepare("SELECT COUNT(*) count FROM se_resources WHERE category IN ('Highspot Catalog','Product Overview','Datasheet','Implementation Services','Battlecard','Competitive Intelligence','Highspot Video')").get().count;
const invalid=db.prepare("SELECT COUNT(*) count FROM se_resources WHERE url LIKE '%<a %' OR url LIKE '%href=%'").get().count;
if(found<rows.length)throw new Error(`Validation failed: expected at least ${rows.length}, found ${found}`);
console.log(JSON.stringify({version:'20.6.0',catalogRows:rows.length,inserted,updated,managedRows:found,malformedUrlsRemaining:invalid},null,2));