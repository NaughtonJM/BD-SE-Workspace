#requires -Version 5.1
[CmdletBinding()]
param([string]$Workspace=(Join-Path $HOME 'BlackDuckSEWorkspace'),[string]$Version='21.0.0',[string]$OutputDirectory=(Join-Path $HOME 'Downloads'),[switch]$KeepBuildFolder)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$PackageName="BD-SE-Workspace-Portable-v$Version-win-x64"
$BuildRoot=Join-Path $env:TEMP ("BD-SE-Workspace-Build-"+[guid]::NewGuid().ToString('N'))
$PackageRoot=Join-Path $BuildRoot $PackageName
$RuntimeRoot=Join-Path $PackageRoot 'runtime'
$ZipPath=Join-Path $OutputDirectory "$PackageName.zip"
$Utf8=New-Object Text.UTF8Encoding($false)
function Fail([string]$Message){throw "Portable package build failed: $Message"}
Write-Host "Building $PackageName from $Workspace" -ForegroundColor Cyan
foreach($required in @($Workspace,(Join-Path $Workspace 'server.js'),(Join-Path $Workspace 'frontend\index.html'),(Join-Path $Workspace 'database\schema.sql'),(Join-Path $Workspace 'database-bootstrap-v21.0.0.js'),(Join-Path $Workspace 'package.json'),(Join-Path $Workspace 'package-lock.json'))){if(-not(Test-Path $required)){Fail "Missing required source: $required"}}
$Node=Get-Command node.exe -ErrorAction SilentlyContinue;if(-not $Node){$Node=Get-Command node -ErrorAction SilentlyContinue};if(-not $Node){Fail 'Node.js is required on the build workstation.'}
$NodeExe=$Node.Source;$NodeVersion=(& $NodeExe --version).Trim();if([int](($NodeVersion -replace '^v','').Split('.')[0]) -lt 20){Fail "Node.js 20+ required; found $NodeVersion"}
New-Item -ItemType Directory -Force $PackageRoot,$RuntimeRoot,$OutputDirectory|Out-Null
$robo=@($Workspace,$PackageRoot,'/E','/R:1','/W:1','/NFL','/NDL','/NJH','/NJS','/NP','/XD',(Join-Path $Workspace '.git'),(Join-Path $Workspace '.github'),(Join-Path $Workspace 'node_modules'),(Join-Path $Workspace 'backups'),(Join-Path $Workspace 'assets'),(Join-Path $Workspace 'exports'),(Join-Path $Workspace 'archive-pre-github'),'/XF','workspace.db','*.db','*.db-wal','*.db-shm','*.log','.env','.env.*','*.key','*.secret')
& robocopy @robo|Out-Null;if($LASTEXITCODE -ge 8){Fail "Robocopy failed: $LASTEXITCODE"}
Copy-Item $NodeExe (Join-Path $RuntimeRoot 'node.exe') -Force
$NodeHome=Split-Path $NodeExe -Parent;Get-ChildItem $NodeHome -Filter '*.dll' -File -ErrorAction SilentlyContinue|ForEach-Object{Copy-Item $_.FullName $RuntimeRoot -Force};foreach($name in @('LICENSE','LICENSE.txt')){if(Test-Path (Join-Path $NodeHome $name)){Copy-Item (Join-Path $NodeHome $name) $RuntimeRoot -Force}}
Push-Location $PackageRoot
try{$npm=Get-Command npm.cmd -ErrorAction SilentlyContinue;if(-not $npm){Fail 'npm.cmd is required on the build workstation.'};Write-Host 'Installing production dependencies in staging...' -ForegroundColor Yellow;& $npm.Source ci --omit=dev --no-audit --no-fund;if($LASTEXITCODE -ne 0){Fail 'npm ci failed.'};& (Join-Path $RuntimeRoot 'node.exe') '.\database-bootstrap-v21.0.0.js'|Out-Host;if($LASTEXITCODE -ne 0){Fail 'Database bootstrap validation failed.'};& (Join-Path $RuntimeRoot 'node.exe') -e "const D=require('better-sqlite3');const d=new D(':memory:');d.exec('select 1');d.close();console.log('better-sqlite3 validated')";if($LASTEXITCODE -ne 0){Fail 'Native SQLite module validation failed.'}}finally{Pop-Location}
Remove-Item (Join-Path $PackageRoot 'database\workspace.db*') -Force -ErrorAction SilentlyContinue
$AssetsFolder=Join-Path $PackageRoot 'assets'
$ExportsFolder=Join-Path $PackageRoot 'exports'
Remove-Item $AssetsFolder -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $ExportsFolder -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $AssetsFolder,$ExportsFolder|Out-Null
Copy-Item (Join-Path $Workspace 'assets\BlackDuckLogo.png') $AssetsFolder -Force
Copy-Item (Join-Path $Workspace 'assets\BlackDuck-SE-Workspace.ico') $AssetsFolder -Force
[IO.File]::WriteAllText((Join-Path $ExportsFolder '.keep'),'',$Utf8)
$launcher=@'
@echo off
setlocal
cd /d "%~dp0"
title Black Duck SE Workspace
if not exist "runtime\node.exe" (echo ERROR: Bundled Node runtime is missing.&pause&exit /b 1)
if not exist "database\schema.sql" (echo ERROR: database\schema.sql is missing.&pause&exit /b 1)
if not exist "database" mkdir "database"
if not exist "assets" mkdir "assets"
if not exist "exports" mkdir "exports"
if not exist "%USERPROFILE%\Desktop\Black Duck SE Workspace.lnk" powershell.exe -NoProfile -Command "$w=New-Object -ComObject WScript.Shell;$d=$w.SpecialFolders.Item('Desktop');$s=$w.CreateShortcut((Join-Path $d 'Black Duck SE Workspace.lnk'));$s.TargetPath=(Join-Path (Get-Location) 'Start-BD-SE-Workspace.cmd');$s.WorkingDirectory=(Get-Location).Path;$s.IconLocation=((Join-Path (Get-Location) 'assets\BlackDuck-SE-Workspace.ico')+',0');$s.Description='Launch Black Duck SE Workspace';$s.Save()"
"runtime\node.exe" "database-bootstrap-v21.0.0.js"
if errorlevel 1 (echo ERROR: Database initialization failed.&pause&exit /b 1)
start "BD-SE-Workspace" /min cmd /c "runtime\node.exe server.js 1^>server-output.log 2^>server-error.log"
powershell.exe -NoProfile -Command "$ok=$false;1..20|ForEach-Object{try{$r=Invoke-RestMethod 'http://127.0.0.1:3000/api/health' -TimeoutSec 2;if($r.status -eq 'running'){$ok=$true;break}}catch{};Start-Sleep -Milliseconds 500};if(-not $ok){exit 1}"
if errorlevel 1 (echo ERROR: Workspace did not start. Review server-error.log.&pause&exit /b 1)
start "" "http://127.0.0.1:3000"
echo Black Duck SE Workspace is running at http://127.0.0.1:3000
pause
endlocal
'@
[IO.File]::WriteAllText((Join-Path $PackageRoot 'Start-BD-SE-Workspace.cmd'),$launcher,$Utf8)
$stopper=@'
@echo off
powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter 'Name=''node.exe''' | Where-Object { $_.CommandLine -like '*server.js*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
echo Black Duck SE Workspace stopped.
pause
'@
[IO.File]::WriteAllText((Join-Path $PackageRoot 'Stop-BD-SE-Workspace.cmd'),$stopper,$Utf8)
$readme="Black Duck SE Workspace Portable v$Version`r`n`r`nNo administrator rights, Git, Node.js, or npm installation is required.`r`n`r`n1. Extract this ZIP to Documents or another writable folder.`r`n2. Double-click Start-BD-SE-Workspace.cmd.`r`n3. Open Administration to configure BLACKDUCK_LLM_MODEL and BLACKDUCK_LLM_API_KEY.`r`n`r`nLocal data stays in database\workspace.db, assets\, and exports\.`r`nStop with Stop-BD-SE-Workspace.cmd.`r`n`r`nCorporate application-control policy may still block unsigned software. This package does not bypass endpoint controls.`r`n`r`nBundled runtime: Node.js $NodeVersion`r`n"
[IO.File]::WriteAllText((Join-Path $PackageRoot 'PORTABLE-README.txt'),$readme,$Utf8)
$forbidden=Get-ChildItem $PackageRoot -Recurse -File|Where-Object{$_.Name -match '^(workspace\.db|.*\.db-wal|.*\.db-shm|\.env.*|.*\.key|.*\.secret)$' -or $_.Extension -eq '.log'};if($forbidden){Fail ('Forbidden files remain: '+(($forbidden.FullName)-join ', '))}
foreach($required in @('runtime\node.exe','server.js','database\schema.sql','database-bootstrap-v21.0.0.js','frontend\index.html','node_modules\better-sqlite3','assets\BlackDuckLogo.png','assets\BlackDuck-SE-Workspace.ico','Start-BD-SE-Workspace.cmd','Stop-BD-SE-Workspace.cmd')){if(-not(Test-Path (Join-Path $PackageRoot $required))){Fail "Package missing: $required"}}
if(Test-Path $ZipPath){Remove-Item $ZipPath -Force};Compress-Archive -Path $PackageRoot -DestinationPath $ZipPath -CompressionLevel Optimal;if(-not(Test-Path $ZipPath)){Fail 'ZIP was not created.'}
$hash=(Get-FileHash $ZipPath -Algorithm SHA256).Hash;[IO.File]::WriteAllText("$ZipPath.sha256.txt","$hash  $([IO.Path]::GetFileName($ZipPath))`r`n",$Utf8)
Write-Host 'Portable package created successfully.' -ForegroundColor Green;Write-Host "ZIP: $ZipPath";Write-Host "SHA256: $hash";Write-Host 'Recipient: extract ZIP, then double-click Start-BD-SE-Workspace.cmd.';Write-Warning 'Corporate policy may still block unsigned portable executables.'
if(-not $KeepBuildFolder){Remove-Item $BuildRoot -Recurse -Force -ErrorAction SilentlyContinue}else{Write-Host "Build folder: $BuildRoot"}


