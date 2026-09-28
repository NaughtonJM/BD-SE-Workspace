$ErrorActionPreference = "Stop"
$Root = Join-Path $env:USERPROFILE "BlackDuckSEWorkspace"
$Port = 3000
$Key = [Environment]::GetEnvironmentVariable("BLACKDUCK_LLM_API_KEY", "User")
$Model = [Environment]::GetEnvironmentVariable("BLACKDUCK_LLM_MODEL", "User")
if ([string]::IsNullOrWhiteSpace($Key)) { throw "BLACKDUCK_LLM_API_KEY is not configured." }
if ([string]::IsNullOrWhiteSpace($Model)) { $Model = "gpt-4o" }
$env:BLACKDUCK_LLM_API_KEY=$Key; $env:BLACKDUCK_LLM_MODEL=$Model
try {$L=Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue|Select-Object -First 1;if($L){Stop-Process -Id $L.OwningProcess -Force;Start-Sleep 1}}catch{}
$Out=Join-Path $Root "server-output.log";$Err=Join-Path $Root "server-error.log";Remove-Item $Out,$Err -Force -ErrorAction SilentlyContinue
$P=Start-Process node.exe -ArgumentList "server.js" -WorkingDirectory $Root -RedirectStandardOutput $Out -RedirectStandardError $Err -PassThru
for($i=0;$i -lt 20;$i++){Start-Sleep -Milliseconds 500;if($P.HasExited){throw (Get-Content $Err -Raw)};try{$H=Invoke-RestMethod -UseBasicParsing -Uri "http://127.0.0.1:$Port/api/health";if($H.status -eq "running"){break}}catch{}}
Start-Process ("http://127.0.0.1:$Port/?v="+[DateTimeOffset]::UtcNow.ToUnixTimeSeconds()+"#dashboard")
Write-Host "SE Workspace V2 running. Node PID: $($P.Id)" -ForegroundColor Green
