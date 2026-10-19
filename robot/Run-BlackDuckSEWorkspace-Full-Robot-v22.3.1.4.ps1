param(
 [string]$WorkspaceRoot="$env:USERPROFILE\BlackDuckSEWorkspace",
 [string]$BaseUrl="http://127.0.0.1:3000",
 [switch]$KeepTestRecord=$true
)
$ErrorActionPreference='Stop'
$Version='22.3.1.4'; $run=Get-Date -Format 'yyyyMMdd-HHmmss'; $out=Join-Path $WorkspaceRoot "robot-results\full-v$Version-$run"
New-Item -ItemType Directory -Force $out|Out-Null
$results=New-Object System.Collections.Generic.List[object]
function Result($n,$p,$d){$results.Add([pscustomobject]@{name=$n;status=$(if($p){'PASS'}else{'FAIL'});detail=[string]$d});Write-Host "$(if($p){'PASS'}else{'FAIL'}): $n - $d" -ForegroundColor $(if($p){'Green'}else{'Red'})}
function GetApi($p){Invoke-RestMethod -Uri ($BaseUrl+$p) -TimeoutSec 120}
function SendApi($method,$p,$body){Invoke-RestMethod -Method $method -Uri ($BaseUrl+$p) -ContentType 'application/json; charset=utf-8' -Body ($body|ConvertTo-Json -Depth 30) -TimeoutSec 900}
$id=$null
Write-Host "Black Duck SE Workspace FULL Robot v$Version" -ForegroundColor Cyan
Write-Host 'WARNING: creates a synthetic QA record and invokes configured LLM generation.' -ForegroundColor Yellow
try{$h=GetApi '/api/health';Result 'Health' ($h.status -eq 'running') ($h|ConvertTo-Json -Compress)}catch{Result 'Health' $false $_.Exception.Message}
try{
 $fixture=@{partner_name="Robot QA Partner $run";account_name="Robot QA Account $run";presenter='Justin Naughton';meeting_goal='Automated full lifecycle release validation';notes='Synthetic QA record created by full regression robot.'}
 $g=SendApi POST '/api/audited-partner-client-prep/generate' $fixture
 $id=[Convert]::ToInt32($g.id)
 Result 'Create new audited record' ($id -gt 0) "ID=$id"
 Result 'Partner research generated' ($null -ne $g.partner_research) "ID=$id"
 Result 'Client research generated' ($null -ne $g.client_research) "ID=$id"
 Result 'Reconciliation generated' ($null -ne $g.combined_research) "ID=$id"
 Result 'Call synthesis generated' ($null -ne $g.result) "ID=$id"
}catch{Result 'Create new audited record' $false $_.Exception.Message}
if($id){
 try{$a=@(GetApi "/api/prep-query-audit/$id");if($a.Count-eq 1 -and $a[0]-is[Array]){$a=@($a[0])};$ok=$a.Count-eq 4 -and @($a|?{$_.stage-match'^\s*[1-4]\.'}).Count-eq 4;Result 'Four-stage audit' $ok (($a.stage)-join ' | ')}catch{Result 'Four-stage audit' $false $_.Exception.Message}
 try{$ans=@{answers=@(@{question_key='robot_metric';section='Discovery';question='What measurable outcome is required?';answer='Reduce release-risk review time by 25 percent';notes='Synthetic robot persistence check';importance='High';confirmed=$true},@{question_key='robot_decision';section='MEDDPICC';question='Who approves the technical decision?';answer='Robot QA Decision Owner';notes='Synthetic robot persistence check';importance='High';confirmed=$true})};$x=SendApi PUT "/api/call-report-v4/$id/answers" $ans;Result 'Save discovery fields' ($x.saved-eq 2) "saved=$($x.saved)"}catch{Result 'Save discovery fields' $false $_.Exception.Message}
 try{$ctx=@{sections=@(@{section_key='robot_context';section_title='Robot Validation Context';section_text='Synthetic persisted context updated by full regression robot.';sort_order=999})};$x=SendApi PUT "/api/v16/$id/context" $ctx;Result 'Save context field' ($x.saved-eq 1) "saved=$($x.saved)"}catch{Result 'Save context field' $false $_.Exception.Message}
 try{$saved=GetApi "/api/call-report-v4/$id";$keys=@($saved.answers|%{$_.question_key});Result 'Reload saved discovery fields' ($keys-contains'robot_metric' -and $keys-contains'robot_decision') ($keys-join ',')}catch{Result 'Reload saved discovery fields' $false $_.Exception.Message}
 try{$c=@(GetApi "/api/v16/$id/context");if($c.Count-eq 1-and$c[0]-is[Array]){$c=@($c[0])};Result 'Reload saved context field' (@($c|?{$_.section_key-eq'robot_context'}).Count-eq 1) "rows=$($c.Count)"}catch{Result 'Reload saved context field' $false $_.Exception.Message}
 # Stage-gate contract regression v22.3.1.3
$stagePath="/api/stage-management-v12/$id"
$blocked=@{motion='New Business';stageNumber=1;changedBy='Full Regression Robot';reason='Verify stage gate rejects incomplete criteria';evidence='Synthetic negative stage-gate test';criteria=@();overrideUsed=$false}
$blockedOk=$false;$blockedDetail=''
try{
  $unexpected=SendApi PUT $stagePath $blocked
  $blockedDetail="Unexpected success: $($unexpected|ConvertTo-Json -Compress -Depth 10)"
}catch{
  $status=$null;$body=''
  try{$status=[int]$_.Exception.Response.StatusCode}catch{}
  try{$stream=$_.Exception.Response.GetResponseStream();if($stream){$reader=New-Object IO.StreamReader($stream);try{$body=$reader.ReadToEnd()}finally{$reader.Dispose()}}}catch{}
  $blockedOk=($status-eq 409)
  $blockedDetail=$(if($body){"HTTP $status; $body"}elseif($status){"HTTP $status; $($_.Exception.Message)"}else{$_.Exception.Message})
}
Result 'Stage gate rejects incomplete criteria' $blockedOk $blockedDetail

$override=@{motion='New Business';stageNumber=1;changedBy='Full Regression Robot';reason='Synthetic authorized override persistence check';evidence='New QA record created and validated; override exercised by regression harness';criteria=@();overrideUsed=$true}
try{
  $u=SendApi PUT $stagePath $override
  $ok=($u.success-eq$true-and$null-ne$u.state-and[int]$u.state.stage_number-eq 1-and[string]$u.state.motion-eq'New Business'-and$u.overrideUsed-eq$true)
  Result 'Authorized stage override accepted' $ok ($u|ConvertTo-Json -Compress -Depth 10)
}catch{Result 'Authorized stage override accepted' $false $_.Exception.Message}

try{
  $r=GetApi $stagePath;$state=$r.state;$history=@($r.history)
  Result 'Reload sales stage state' ($null-ne$state-and[int]$state.stage_number-eq 1-and[string]$state.motion-eq'New Business') ($state|ConvertTo-Json -Compress -Depth 10)
  Result 'Sales stage history created' ($history.Count-ge 1) "history_count=$($history.Count)"
  $audit=@($history|Where-Object{[int]$_.to_stage_number-eq 1-and[int]$_.override_used-eq 1-and[string]$_.changed_by-eq'Full Regression Robot'})
  Result 'Stage override audited' ($audit.Count-ge 1) $(if($audit.Count){$audit[0]|ConvertTo-Json -Compress -Depth 10}else{'Required override history entry not found.'})
}catch{
  Result 'Reload sales stage state' $false $_.Exception.Message
  Result 'Sales stage history created' $false $_.Exception.Message
  Result 'Stage override audited' $false $_.Exception.Message
}
 try{$report=GetApi "/api/call-report-v4/$id";$payload=@{call_prep_id=$id;partner_name=$report.partner_name;presenter='Justin Naughton';result=$report.prepared_call};$e=SendApi POST '/api/research-exports' $payload;Result 'Generate DOCX and PPTX' ($e.report_name-and$e.deck_name) "$($e.report_name) | $($e.deck_name)"}catch{Result 'Generate DOCX and PPTX' $false $_.Exception.Message}
 try{$er=@(GetApi '/api/research-exports');if($er.Count-eq 1-and$er[0]-is[Array]){$er=@($er[0])};$mine=$er|?{[int]$_.call_prep_id-eq$id}|Select-Object -First 1;if(!$mine){throw 'Export row not found'};Add-Type -AssemblyName System.IO.Compression.FileSystem;foreach($pair in @(@('DOCX',$mine.report_path),@('PPTX',$mine.deck_path))){$f=Join-Path (Join-Path $WorkspaceRoot 'exports') $pair[1];$z=[IO.Compression.ZipFile]::OpenRead($f);$txt='';foreach($entry in $z.Entries){if($entry.FullName-match'\.xml$'){$sr=New-Object IO.StreamReader($entry.Open());$txt+=$sr.ReadToEnd();$sr.Dispose()}};$z.Dispose();$bad=([regex]::Matches($txt,'\[object Object\]|\bundefined\b|\bnull\b','IgnoreCase')).Count;Result "$($pair[0]) content scan" ($bad-eq 0) "$($pair[1]); markers=$bad"}}catch{Result 'Export content scan' $false $_.Exception.Message}
 try{$hist=@(GetApi '/api/history-v3');if($hist.Count-eq 1-and$hist[0]-is[Array]){$hist=@($hist[0])};Result 'History contains new record' (@($hist|?{[string]$_.id-eq[string]$id}).Count-gt 0) "ID=$id"}catch{Result 'History contains new record' $false $_.Exception.Message}
}
# Playwright browser validation uses newly-created ID
$js=Join-Path $PSScriptRoot 'Full-Robot-Browser-v22.3.1.4.js';$br=Join-Path $out 'playwright-report.json'
try{Push-Location $WorkspaceRoot;& node $js $BaseUrl $br $id;$ec=$LASTEXITCODE;Pop-Location;Result 'Playwright UI/browser validation' ($ec-eq 0) "exit=$ec"}catch{try{Pop-Location}catch{};Result 'Playwright UI/browser validation' $false $_.Exception.Message}
$failed=@($results | Where-Object { $_.status -eq 'FAIL' });$summary=[ordered]@{version=$Version;run_at=(Get-Date).ToString('o');synthetic_test_data=$true;test_record_id=$id;overall=$(if($failed.Count){'FAIL'}else{'PASS'});results=$results}
$summary|ConvertTo-Json -Depth 10|Set-Content (Join-Path $out 'full-robot-report.json') -Encoding UTF8
$results|Format-Table -AutoSize;Write-Host "OVERALL: $($summary.overall)" -ForegroundColor $(if($failed.Count){'Red'}else{'Green'});Write-Host "REPORT: $(Join-Path $out 'full-robot-report.json')"
if($failed.Count){exit 1}else{exit 0}
