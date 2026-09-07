param([ValidateSet('medium','high')][string]$Effort,[string]$SessionId,[string]$Stage='repair')
$ErrorActionPreference='Continue'
$variant='school-luna-'+$Effort
$logDir=$PSScriptRoot
$workspace=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location -LiteralPath (Join-Path $workspace $variant)
$stem="$variant-$Stage"
$start=[DateTime]::UtcNow.ToString('o')
Get-Content (Join-Path $logDir "$stem-prompt.txt") -Raw | codex exec resume $SessionId -m gpt-5.6-luna -c "model_reasoning_effort=$Effort" -c 'service_tier="priority"' --json -o (Join-Path $logDir "$stem-final.txt") - 2> (Join-Path $logDir "$stem-stderr.txt") | Out-File (Join-Path $logDir "$stem-events.jsonl") -Encoding utf8
@{start=$start;end=[DateTime]::UtcNow.ToString('o');exitCode=$LASTEXITCODE;sessionId=$SessionId;requestedModel='gpt-5.6-luna';requestedReasoning=$Effort;requestedServiceTier='priority'} | ConvertTo-Json | Set-Content (Join-Path $logDir "$stem-process.json")
