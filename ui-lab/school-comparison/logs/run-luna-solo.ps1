$ErrorActionPreference = 'Continue'
$logDir = $PSScriptRoot
$workspace = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$target = Join-Path $workspace 'school-luna-solo'
New-Item -ItemType Directory -Path $target -Force | Out-Null
Set-Location -LiteralPath $target
$start = [DateTime]::UtcNow.ToString('o')
$start | Set-Content (Join-Path $logDir 'school-luna-solo-start.txt')
Get-Content (Join-Path $logDir 'school-luna-solo-prompt.txt') -Raw | codex exec -m gpt-5.6-luna -c 'model_reasoning_effort="xhigh"' -c 'service_tier="priority"' --json -o (Join-Path $logDir 'school-luna-solo-final.txt') - 2> (Join-Path $logDir 'school-luna-solo-stderr.txt') | Out-File (Join-Path $logDir 'school-luna-solo-events.jsonl') -Encoding utf8
@{start=$start;end=[DateTime]::UtcNow.ToString('o');exitCode=$LASTEXITCODE;requestedModel='gpt-5.6-luna';requestedReasoning='xhigh';requestedServiceTier='priority';ownership='standalone implementation, browser verification, and repairs; no parent corrective prompts'} | ConvertTo-Json | Set-Content (Join-Path $logDir 'school-luna-solo-process.json')
