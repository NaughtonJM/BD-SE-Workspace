/* ADMIN_LLM_CONFIG_API_V20_9_1 */
'use strict';
const {spawnSync}=require('child_process');
module.exports=function(app){
  const names=['BLACKDUCK_LLM_API_KEY','BLACKDUCK_LLM_MODEL'];
  function localOnly(req,res,next){
    const ip=String(req.ip||req.socket?.remoteAddress||'');
    if(ip==='127.0.0.1'||ip==='::1'||ip==='::ffff:127.0.0.1')return next();
    res.status(403).json({error:'LLM configuration is restricted to the local workstation.'});
  }
  function runPs(script,args=[]){
    const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',script,...args],{encoding:'utf8',windowsHide:true});
    if(r.status!==0)throw new Error(String(r.stderr||r.stdout||'PowerShell failed').trim());
    return String(r.stdout||'').trim();
  }
  function getUser(name){return process.platform==='win32'?runPs('[Console]::OutputEncoding=[Text.Encoding]::UTF8;[Environment]::GetEnvironmentVariable($args[0],"User")',[name]):(process.env[name]||'')}
  function setUser(name,value){
    if(process.platform!=='win32')throw new Error('Windows User environment storage is available only on Windows.');
    runPs('[Environment]::SetEnvironmentVariable($args[0],$args[1],"User")',[name,value]);process.env[name]=value;
  }
  function clearUser(name){runPs('[Environment]::SetEnvironmentVariable($args[0],$null,"User")',[name]);delete process.env[name]}
  app.get('/api/admin/llm-config',localOnly,(req,res)=>{
    try{const model=process.env.BLACKDUCK_LLM_MODEL||getUser('BLACKDUCK_LLM_MODEL')||'';const keyPresent=Boolean(process.env.BLACKDUCK_LLM_API_KEY||getUser('BLACKDUCK_LLM_API_KEY'));res.json({configured:keyPresent&&Boolean(model),keyPresent,model,storage:'Windows User environment'});}catch(e){res.status(500).json({error:e.message})}
  });
  app.post('/api/admin/llm-config',localOnly,(req,res)=>{
    try{const model=String(req.body?.model||'').trim(),apiKey=String(req.body?.apiKey||'').trim(),existing=process.env.BLACKDUCK_LLM_API_KEY||getUser('BLACKDUCK_LLM_API_KEY');if(!model)return res.status(400).json({error:'BLACKDUCK_LLM_MODEL is required.'});if(!apiKey&&!existing)return res.status(400).json({error:'BLACKDUCK_LLM_API_KEY is required for initial configuration.'});setUser('BLACKDUCK_LLM_MODEL',model);if(apiKey)setUser('BLACKDUCK_LLM_API_KEY',apiKey);res.json({configured:true,keyPresent:true,model,message:'Configuration saved and loaded into the running server.'});}catch(e){res.status(500).json({error:e.message})}
  });
  app.post('/api/admin/llm-config/validate',localOnly,(req,res)=>{
    try{const model=process.env.BLACKDUCK_LLM_MODEL||getUser('BLACKDUCK_LLM_MODEL'),key=process.env.BLACKDUCK_LLM_API_KEY||getUser('BLACKDUCK_LLM_API_KEY');if(!model||!key)return res.status(400).json({valid:false,error:'Model and API key must both be configured.'});res.json({valid:true,model,keyPresent:true,message:'The server can read both required values. The API key was not returned.'});}catch(e){res.status(500).json({valid:false,error:e.message})}
  });
  app.delete('/api/admin/llm-config',localOnly,(req,res)=>{try{names.forEach(clearUser);res.json({configured:false,keyPresent:false,model:'',message:'User-scoped LLM configuration cleared.'});}catch(e){res.status(500).json({error:e.message})}});
};