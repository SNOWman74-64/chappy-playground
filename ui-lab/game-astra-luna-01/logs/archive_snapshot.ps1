param([Parameter(Mandatory=$true)][string]$Name)
$ErrorActionPreference = 'Stop'
if ($Name -notmatch '^[a-z0-9-]+$') { throw 'Invalid snapshot name' }
$studyRoot = Split-Path -Parent $PSScriptRoot
$archiveDir = Join-Path $PSScriptRoot 'snapshots'
New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null
$target = Join-Path $archiveDir ($Name + '.zip')
if (Test-Path -LiteralPath $target) { throw 'Snapshot already exists; never overwrite' }
$files = @(Get-ChildItem -LiteralPath $studyRoot -File | Where-Object {$_.Name -ne 'run.json'} | ForEach-Object {$_.FullName})
Compress-Archive -LiteralPath $files -DestinationPath $target
(Get-Item -LiteralPath $target).IsReadOnly = $true
$manifest = [ordered]@{name=$Name; created_utc=[DateTime]::UtcNow.ToString('o'); archive_sha256=(Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash; files=@($files | ForEach-Object { $f=Get-Item -LiteralPath $_; @{name=$f.Name;sha256=(Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash}}); note='Read-only zip plus SHA256 detects modification; not a cryptographic WORM store. Fixture/assets referenced read-only outside archive.'}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $archiveDir ($Name + '.manifest.json'))
Write-Output $target
