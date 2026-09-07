$ErrorActionPreference = 'Continue'
$start = [DateTime]::UtcNow.ToString('o')
$start | Set-Content ../school-comparison/logs/luna-start.txt
Get-Content ../school-comparison/logs/luna-prompt.txt -Raw | codex exec -m gpt-5.6-luna -c model_reasoning_effort='"xhigh"' -c service_tier='"priority"' --json -o ../school-comparison/logs/luna-final.txt - 2> ../school-comparison/logs/luna-stderr.txt | Out-File ../school-comparison/logs/luna-events.jsonl -Encoding utf8
@{start=$start;end=[DateTime]::UtcNow.ToString('o');exitCode=$LASTEXITCODE;requestedModel='gpt-5.6-luna';requestedReasoning='xhigh';requestedServiceTier='priority'} | ConvertTo-Json | Set-Content ../school-comparison/logs/luna-process.json
