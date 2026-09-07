[CmdletBinding()]
param(
    [string]$Study
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()

function Add-Failure {
    param([string]$Message)
    $failures.Add($Message)
}

function Assert-File {
    param(
        [string]$Path,
        [string]$Label
    )
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Add-Failure "$Label missing: $Path"
        return $false
    }
    return $true
}

function Assert-Heading {
    param(
        [string]$Path,
        [string]$Heading
    )
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return
    }
    $text = [System.IO.File]::ReadAllText($Path)
    $pattern = '(?m)^##\s+' + [regex]::Escape($Heading) + '\s*$'
    if (-not [regex]::IsMatch($text, $pattern)) {
        Add-Failure "Required heading '## $Heading' missing: $Path"
    }
}

$sharedFiles = @(
    'index.html',
    'catalog.json',
    'viewer.html',
    'DESIGN.md',
    'LEARNINGS.md',
    'handoff/KNOWLEDGE-INDEX.md',
    'knowledge/INDEX.md',
    'knowledge/DESIGN-LANGUAGE.md',
    'knowledge/OBSERVATION-GUIDE.md',
    'knowledge/REFERENCE-INDEX.md',
    'knowledge/PATTERN-INDEX.md',
    'knowledge/ANTI-PATTERN-INDEX.md'
)

foreach ($relative in $sharedFiles) {
    Assert-File -Path (Join-Path $root $relative) -Label 'Shared UI Lab document' | Out-Null
}

$catalog = $null
$catalogPath = Join-Path $root 'catalog.json'
if (Test-Path -LiteralPath $catalogPath -PathType Leaf) {
    try {
        $catalog = Get-Content -LiteralPath $catalogPath -Raw -Encoding utf8 | ConvertFrom-Json
        if ($catalog.sharedDesignPath -ne './DESIGN.md') {
            Add-Failure "Catalog sharedDesignPath must be ./DESIGN.md"
        }
        if ($catalog.sharedLearningsPath -ne './LEARNINGS.md') {
            Add-Failure "Catalog sharedLearningsPath must be ./LEARNINGS.md"
        }
        $ids = @($catalog.mocks | ForEach-Object { $_.id })
        $duplicateIds = @($ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name)
        foreach ($id in $duplicateIds) {
            Add-Failure "Duplicate catalog id: $id"
        }

        foreach ($entry in @($catalog.mocks)) {
            foreach ($property in @('previewPath', 'designPath', 'retrospectivePath')) {
                $relativeTarget = $entry.$property
                if ([string]::IsNullOrWhiteSpace($relativeTarget)) {
                    Add-Failure "Catalog '$($entry.id)' missing $property"
                    continue
                }
                $target = [System.IO.Path]::GetFullPath((Join-Path $root $relativeTarget))
                if (-not (Test-Path -LiteralPath $target)) {
                    Add-Failure "Catalog '$($entry.id)' target missing for ${property}: $relativeTarget"
                }
            }
        }
    }
    catch {
        Add-Failure "catalog.json is not valid JSON: $($_.Exception.Message)"
    }
}

$studyDirs = @()
if ($Study) {
    $candidate = Join-Path $root $Study
    if (-not (Test-Path -LiteralPath $candidate -PathType Container)) {
        Add-Failure "Study directory missing: $candidate"
    }
    else {
        $studyDirs = @((Get-Item -LiteralPath $candidate))
    }
}
else {
    $studyDirs = @(Get-ChildItem -LiteralPath $root -Directory | Where-Object {
        Test-Path -LiteralPath (Join-Path $_.FullName 'index.html') -PathType Leaf
    })
}

$designHeadings = @(
    'Reference',
    'Intent',
    'Visual DNA',
    'Tokens',
    'Layout Anatomy',
    'Interaction / Motion',
    'Constraints',
    'Adaptation from reference'
)

$retroHeadings = @(
    'What worked',
    'What felt wrong',
    'Fixes',
    'Open questions',
    'Candidates for shared learnings'
)

foreach ($dir in $studyDirs) {
    $index = Join-Path $dir.FullName 'index.html'
    $design = Join-Path $dir.FullName 'DESIGN.md'
    $retro = Join-Path $dir.FullName 'RETROSPECTIVE.md'

    Assert-File -Path $index -Label "Study '$($dir.Name)' entry point" | Out-Null
    Assert-File -Path $design -Label "Study '$($dir.Name)' design document" | Out-Null
    Assert-File -Path $retro -Label "Study '$($dir.Name)' retrospective" | Out-Null

    if ($null -ne $catalog) {
        $catalogEntry = @($catalog.mocks | Where-Object { $_.id -eq $dir.Name })
        if ($catalogEntry.Count -ne 1) {
            Add-Failure "Study '$($dir.Name)' must have exactly one catalog entry"
        }
    }

    foreach ($heading in $designHeadings) {
        Assert-Heading -Path $design -Heading $heading
    }
    foreach ($heading in $retroHeadings) {
        Assert-Heading -Path $retro -Heading $heading
    }

    if (Test-Path -LiteralPath $index -PathType Leaf) {
        $html = [System.IO.File]::ReadAllText($index)
        if ($html -notmatch '(?is)<meta\b[^>]*\bname\s*=\s*["'']viewport["''][^>]*>') {
            Add-Failure "Viewport meta missing: $index"
        }
        if ($html -notmatch '(?is)<title\b[^>]*>.*?</title>') {
            Add-Failure "Document title missing: $index"
        }
    }
}

if ($failures.Count -gt 0) {
    Write-Output 'UI_STUDY_CHECK_FAIL'
    foreach ($failure in $failures) {
        Write-Output "- $failure"
    }
    exit 1
}

$scopeLabel = if ($Study) { $Study } else { "all discovered studies ($($studyDirs.Count))" }
Write-Output "UI_STUDY_CHECK_PASS: $scopeLabel"
