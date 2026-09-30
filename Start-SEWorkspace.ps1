#requires -Version 5.1
[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'

$Root=$PSScriptRoot
Set-Location $Root
Write-Host "SE Workspace root: $Root" -ForegroundColor Cyan

foreach($folder in @('database','assets','exports')){New-Item -ItemType Directory -Force (Join-Path $Root $folder)|Out-Null}
if(-not(Test-Path (Join-Path $Root 'node_modules\better-sqlite3'))){
  Write-Host 'Installing Node dependencies...' -ForegroundColor Yellow
  & npm.cmd install
  if($LASTEXITCODE -ne 0){throw 'npm install failed.'}
}

$bootstrap=Join-Path $Root 'database-bootstrap-v21.0.0.js'
if(-not(Test-Path $bootstrap)){throw "Missing database bootstrap: $bootstrap"}
& node $bootstrap | Write-Host
if($LASTEXITCODE -ne 0){throw 'Portable database initialization failed.'}

Get-Process node -ErrorAction SilentlyContinue|Where-Object{$_.Path -like '*node*'}|Stop-Process -Force -ErrorAction SilentlyContinue
$stdout=Join-Path $Root 'server-output.log';$stderr=Join-Path $Root 'server-error.log'
$process=Start-Process node -ArgumentList 'server.js' -WorkingDirectory $Root -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2
try{$health=Invoke-RestMethod 'http://127.0.0.1:3000/api/health' -TimeoutSec 8;if($health.status -ne 'running'){throw 'Unexpected health response.'}}
catch{if(Test-Path $stderr){Get-Content $stderr -Tail 30};throw "SE Workspace failed health validation: $($_.Exception.Message)"}
Write-Host "SE Workspace V2 running. Node PID: $($process.Id)" -ForegroundColor Green
Write-Host "Database: $(Join-Path $Root 'database\workspace.db')"
Start-Process 'http://127.0.0.1:3000'