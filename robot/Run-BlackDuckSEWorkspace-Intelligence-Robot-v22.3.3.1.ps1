#requires -Version 5.1
$ErrorActionPreference='Stop'
if($env:BDSE_INTELLIGENCE_2331_ACTIVE -eq '1'){
  Write-Host 'FATAL: Recursive v22.3.3.1 invocation blocked.' -ForegroundColor Red
  exit 99
}
$env:BDSE_INTELLIGENCE_2331_ACTIVE='1'
try {
  $base='http://127.0.0.1:3000'
  function Get-Ids {
    try {
      $h=Invoke-RestMethod -Uri "$base/api/call-prep/history" -TimeoutSec 30
      @($h|ForEach-Object{if($_.id){[int]$_.id}elseif($_.recordId){[int]$_.recordId}})|Where-Object{$_ -gt 0}
    } catch { @() }
  }
  Write-Host 'BLACK DUCK INTELLIGENCE ROBOT v22.3.3.1' -ForegroundColor Cyan
  $before=@(Get-Ids)
  $full=Join-Path $PSScriptRoot 'Run-BlackDuckSEWorkspace-Full-Robot-v22.3.1.4.cmd'
  & $full
  $fullExit=$LASTEXITCODE
  if($fullExit -ne 0){throw "Fresh-record Full Robot failed, exit=$fullExit"}
  $after=@(Get-Ids)
  $created=@($after|Where-Object{$before -notcontains $_}|Sort-Object -Descending)
  if($created.Count -ne 1){throw "Expected exactly one new record; detected $($created.Count): $($created -join ',')"}
  $env:BDSE_ROBOT_RECORD_ID=[string]$created[0]
  Write-Host "PASS: Create exactly one fresh Intelligence QA record - ID=$env:BDSE_ROBOT_RECORD_ID" -ForegroundColor Green
  $core=Join-Path $PSScriptRoot 'BlackDuckSEWorkspace-Intelligence-Core-v22.3.3.1.ps1'
  if((Resolve-Path $core).Path -eq $MyInvocation.MyCommand.Path){throw 'FATAL: Core resolves to wrapper path.'}
  & $core
  $coreExit=$LASTEXITCODE
  if($coreExit -ne 0){exit $coreExit}
  exit 0
}
catch {
  Write-Host "OVERALL: FAIL - $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
finally {
  Remove-Item Env:BDSE_INTELLIGENCE_2331_ACTIVE -ErrorAction SilentlyContinue
  Remove-Item Env:BDSE_ROBOT_RECORD_ID -ErrorAction SilentlyContinue
}