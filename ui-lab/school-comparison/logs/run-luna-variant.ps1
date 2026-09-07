param([ValidateSet('medium','high')][string]$Effort)
$ErrorActionPreference = 'Continue'
$variant = 'school-luna-' + $Effort
$logDir = $PSScriptRoot
$workspace = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location -LiteralPath (Join-Path $workspace $variant)
$start = [DateTime]::UtcNow.ToString('o')
$start | Set-Content (Join-Path $logDir "$variant-start.txt")
Get-Content (Join-Path $logDir "$variant-prompt.txt") -Raw | codex exec -m gpt-5.6-luna -c "model_reasoning_effort=$Effort" -c 'service_tier="priority"' --json -o (Join-Path $logDir "$variant-final.txt") - 2> (Join-Path $logDir "$variant-stderr.txt") | Out-File (Join-Path $logDir "$variant-events.jsonl") -Encoding utf8
@{start=$start;end=[DateTime]::UtcNow.ToString('o');exitCode=$LASTEXITCODE;requestedModel='gpt-5.6-luna';requestedReasoning=$Effort;requestedServiceTier='priority'} | ConvertTo-Json | Set-Content (Join-Path $logDir "$variant-process.json")
