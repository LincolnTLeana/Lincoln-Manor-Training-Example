<#
.SYNOPSIS
    Checks a course folder and builds a SCORM 2004 ZIP that is ready for review.

.DESCRIPTION
    Plain-language summary for course builders:
      1. You pick your course folder (or drag it onto "Build Course Package.cmd").
      2. The script checks the folder and lists anything that must be fixed.
      3. If nothing must be fixed, it builds the ZIP and a check report in the
         "Ready for review" folder. Your course folder is never changed.

    Uses only what is built into Windows (Windows PowerShell 5.1 and .NET).
    No internet, no AI tool and nothing to install.

.NOTES
    FOR IT
    - Windows may block scripts, depending on how PowerShell's execution policy is
      set on the computer. If it runs, nothing else is needed. If Windows blocks it,
      ask IT to allow or sign it. Do not bypass the execution policy: the AI
      Acceptable Use Policy (Section 4) forbids getting around security controls.
    - The script reads only the chosen course folder, writes only to the output
      folder and the user's temp folder, and makes no network calls.
    - Settings you may change are in the "Settings" block below.
#>
[CmdletBinding()]
param(
    [string]$CourseFolder,
    [string]$OutputFolder
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

# ----------------------------- Settings ------------------------------------
$MaxPackageMB      = 100   # Change this if ADP Learning's upload limit is different
$BlockedExtensions = @('.docx','.doc','.xlsx','.xls','.csv','.pptx','.ppt','.log',
                       '.ps1','.cmd','.bat','.exe','.msi','.zip','.msg','.pst','.one')
$SkipNames         = @('Thumbs.db','desktop.ini','.DS_Store')
$TextExtensions    = @('.js','.html','.htm','.css','.xml','.json','.txt','.vtt','.svg')
$ContentFile       = 'course/content.js'   # learner links are allowed only here
$SettingsFile      = 'course/settings.js'
# Code that would make the course contact an outside service.
$OutsideCallPatterns = @('fetch\s*\(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket',
                         'EventSource', '<iframe', 'importScripts', '\bimport\s*\(')
$NsCp    = 'http://www.imsglobal.org/xsd/imscp_v1p1'
$NsAdlcp = 'http://www.adlnet.org/xsd/adlcp_v1p3'
# ---------------------------------------------------------------------------

$Problems = New-Object System.Collections.Generic.List[string]   # must fix
$Warnings = New-Object System.Collections.Generic.List[string]   # please check
$Links    = New-Object System.Collections.Generic.List[string]   # learner links

function Write-Step([string]$Text) { Write-Host "  - $Text" }

# 1. Choose the course folder --------------------------------------------------
if (-not $CourseFolder) {
    Add-Type -AssemblyName System.Windows.Forms
    $picker = New-Object System.Windows.Forms.FolderBrowserDialog
    $picker.Description = 'Choose your course folder (the one that contains imsmanifest.xml)'
    if ($picker.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
        Write-Host 'No folder chosen. Nothing was built.'; exit 1
    }
    $CourseFolder = $picker.SelectedPath
}
$CourseFolder = (Resolve-Path -LiteralPath $CourseFolder).Path.TrimEnd('\','/')
if (-not $OutputFolder) { $OutputFolder = Join-Path $PSScriptRoot 'Ready for review' }
if (-not (Test-Path -LiteralPath $OutputFolder)) { New-Item -ItemType Directory -Path $OutputFolder | Out-Null }

Write-Host ''
Write-Host "Checking: $CourseFolder"

# 2. Required files -----------------------------------------------------------
foreach ($required in @('imsmanifest.xml', 'index.html', $SettingsFile)) {
    if (-not (Test-Path -LiteralPath (Join-Path $CourseFolder $required))) {
        $Problems.Add("Missing required file: $required. Did you choose the right folder?")
    }
}

# 3. Course ID and version (from course/settings.js) ---------------------------
$courseId = $null; $version = $null
$settingsPath = Join-Path $CourseFolder $SettingsFile
if (Test-Path -LiteralPath $settingsPath) {
    $settingsText = [System.IO.File]::ReadAllText($settingsPath)
    $m = [regex]::Match($settingsText, 'courseId\s*:\s*["'']([^"'']+)["'']')
    if ($m.Success) { $courseId = $m.Groups[1].Value }
    $m = [regex]::Match($settingsText, 'version\s*:\s*["'']([^"'']+)["'']')
    if ($m.Success) { $version = $m.Groups[1].Value }
    if (-not $courseId -or $courseId -notmatch '^[A-Za-z0-9_-]+$') {
        $Problems.Add("courseId in $SettingsFile is missing or uses characters other than letters, numbers, - and _.")
    }
    if (-not $version -or $version -notmatch '^\d+\.\d+\.\d+$') {
        $Problems.Add("version in $SettingsFile must look like 1.0.0 (see the version rule in the packaging guide).")
    }
}

# 4. Gather files ---------------------------------------------------------------
$included = New-Object System.Collections.Generic.List[object]
$totalBytes = 0
foreach ($f in Get-ChildItem -LiteralPath $CourseFolder -Recurse -File -Force) {
    $rel = $f.FullName.Substring($CourseFolder.Length + 1) -replace '\\', '/'
    $segments = $rel.Split('/')
    if ($SkipNames -contains $f.Name) { continue }
    if (@($segments | Where-Object { $_.StartsWith('.') }).Count -gt 0) { continue }   # hidden folders such as .git
    $ext = $f.Extension.ToLowerInvariant()
    if ($BlockedExtensions -contains $ext) {
        $Problems.Add("Remove $rel : $ext files don't belong in a course package (they may hold internal or personal data).")
        continue
    }
    $included.Add([pscustomobject]@{ Rel = $rel; Full = $f.FullName; Ext = $ext; Size = $f.Length })
    $totalBytes += $f.Length
}
$totalMB = [math]::Round($totalBytes / 1MB, 1)
if ($totalMB -gt $MaxPackageMB) {
    $Problems.Add("The course is $totalMB MB; the limit is $MaxPackageMB MB. Shrink images or link to large videos instead of packaging them.")
}

# 5. Scan text files ------------------------------------------------------------
foreach ($item in $included) {
    if ($TextExtensions -notcontains $item.Ext) { continue }
    $text = [System.IO.File]::ReadAllText($item.Full)

    foreach ($pattern in $OutsideCallPatterns) {
        if ($text -match $pattern) {
            $Problems.Add("$($item.Rel) contains code that contacts an outside service ($pattern). Outside calls are not allowed.")
        }
    }
    if ($item.Ext -eq '.svg' -and $text -match '<script') {
        $Problems.Add("$($item.Rel) is an image that contains a script. Use a plain image instead.")
    }

    # Web addresses: allowed only as learner links in course/content.js.
    if ($item.Rel -ne 'imsmanifest.xml') {
        $scan = $text
        if ($item.Ext -eq '.svg') { $scan = [regex]::Replace($scan, 'xmlns(:\w+)?="[^"]*"', '') }
        foreach ($u in [regex]::Matches($scan, 'https?://[^\s"''<>)]+')) {
            if ($item.Rel -eq $ContentFile) { if (-not $Links.Contains($u.Value)) { $Links.Add($u.Value) } }
            else { $Problems.Add("$($item.Rel) contains a web address ($($u.Value)). Web addresses belong only in $ContentFile as learner links.") }
        }
    }

    # Personal information checks.
    if ($text -match '\b\d{3}-\d{2}-\d{4}\b') {
        $Problems.Add("$($item.Rel) contains a number shaped like a Social Security number. Remove it.")
    }
    foreach ($e in [regex]::Matches($text, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')) {
        $Warnings.Add("$($item.Rel) contains the email address $($e.Value). Check that it is a shared support address, not a person's own email.")
    }

    # Placeholders and made-up sample contacts that were never replaced.
    if ($item.Rel -like 'course/*' -or $item.Rel -like 'themes/*') {
        $left = @([regex]::Matches($text, '\[[A-Z][A-Z0-9 _&/-]{2,}\]') | ForEach-Object { $_.Value } | Select-Object -Unique)
        if ($left.Count -gt 0) { $Warnings.Add("$($item.Rel) has text in [BRACKETS]: $($left -join ', '). Check each one is meant to be there.") }
        if ($text -match 'example\.org|555-01\d\d|Course Designer|Subject Expert Team|Your logo here') {
            $Warnings.Add("$($item.Rel) still has made-up sample details (example.org, 555-01xx, sample names or logo). Replace them with real ones.")
        }
    }
}

# 6. Manifest -------------------------------------------------------------------
$manifestPath = Join-Path $CourseFolder 'imsmanifest.xml'
$manifest = $null
if (Test-Path -LiteralPath $manifestPath) {
    try {
        $manifest = New-Object System.Xml.XmlDocument
        $manifest.PreserveWhitespace = $false
        $manifest.Load($manifestPath)
        $ns = New-Object System.Xml.XmlNamespaceManager($manifest.NameTable)
        $ns.AddNamespace('cp', $NsCp); $ns.AddNamespace('adlcp', $NsAdlcp)
        $schemaVersion = $manifest.SelectSingleNode('//cp:metadata/cp:schemaversion', $ns)
        if (-not $schemaVersion -or $schemaVersion.InnerText -notmatch '2004 4th Edition') {
            $Problems.Add('imsmanifest.xml must say <schemaversion>2004 4th Edition</schemaversion>.')
        }
        $sco = $manifest.SelectSingleNode("//cp:resource[@adlcp:scormType='sco']", $ns)
        if (-not $sco) { $Problems.Add('imsmanifest.xml has no SCO resource.') }
        elseif ($sco.GetAttribute('href') -ne 'index.html') { $Problems.Add('The SCO resource in imsmanifest.xml must start at index.html.') }
    } catch {
        $Problems.Add("imsmanifest.xml can't be read: $($_.Exception.Message)")
        $manifest = $null
    }
}

# 7. Output name (version rule) ---------------------------------------------------
$zipName = $null
if ($courseId -and $version) {
    $zipName = '{0}_v{1}_{2}.zip' -f $courseId, $version, (Get-Date -Format 'yyyy-MM-dd')
    $existing = @(Get-ChildItem -LiteralPath $OutputFolder -Filter ('{0}_v{1}_*.zip' -f $courseId, $version) -ErrorAction SilentlyContinue)
    if ($existing.Count -gt 0) {
        $Problems.Add("Version $version was already packaged ($($existing[0].Name)). Raise the version in $SettingsFile.")
    }
}

# 8. Report ---------------------------------------------------------------------
function Write-Report([string]$Path, [string]$Result) {
    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add('COURSE PACKAGE CHECK REPORT')
    $lines.Add("Result:      $Result")
    $lines.Add("Date:        $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
    $lines.Add("Course ID:   $courseId")
    $lines.Add("Version:     $version")
    $lines.Add("Files:       $($included.Count)  ($totalMB MB)")
    $lines.Add('')
    $lines.Add("MUST FIX ($($Problems.Count))"); foreach ($p in $Problems) { $lines.Add("  [ ] $p") }
    $lines.Add('')
    $lines.Add("PLEASE CHECK ($($Warnings.Count))"); foreach ($w in $Warnings) { $lines.Add("  [ ] $w") }
    $lines.Add('')
    $lines.Add("LEARNER LINKS TO TEST IN ADP LEARNING ($($Links.Count))"); foreach ($l in $Links) { $lines.Add("  [ ] $l") }
    $lines.Add('')
    $lines.Add('NEXT STEP: send the ZIP and this report for security review before upload to ADP Learning.')
    [System.IO.File]::WriteAllLines($Path, $lines)
    return $lines
}

if ($Problems.Count -gt 0) {
    $stamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
    $reportPath = Join-Path $OutputFolder ("{0}_NOT-BUILT_{1}_check-report.txt" -f ($(if ($courseId) { $courseId } else { 'course' })), $stamp)
    Write-Report $reportPath 'NOT BUILT - fix the items under MUST FIX, then run again' | ForEach-Object { Write-Host $_ }
    Write-Host ''; Write-Host "Report saved: $reportPath"
    exit 1
}

# 9. Build in a temporary copy (the course folder is never changed) ---------------
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$staging = Join-Path ([System.IO.Path]::GetTempPath()) ('coursepkg_' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $staging | Out-Null
try {
    foreach ($item in $included) {
        $dest = Join-Path $staging ($item.Rel -replace '/', '\')
        $destDir = Split-Path -Parent $dest
        if (-not (Test-Path -LiteralPath $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
        Copy-Item -LiteralPath $item.Full -Destination $dest
    }

    # List every packaged file in the manifest.
    $ns = New-Object System.Xml.XmlNamespaceManager($manifest.NameTable)
    $ns.AddNamespace('cp', $NsCp); $ns.AddNamespace('adlcp', $NsAdlcp)
    $sco = $manifest.SelectSingleNode("//cp:resource[@adlcp:scormType='sco']", $ns)
    foreach ($old in @($sco.SelectNodes('cp:file', $ns))) { [void]$sco.RemoveChild($old) }
    foreach ($item in ($included | Sort-Object Rel)) {
        $el = $manifest.CreateElement('file', $NsCp)
        $el.SetAttribute('href', $item.Rel)
        [void]$sco.AppendChild($el)
    }
    $settingsXml = New-Object System.Xml.XmlWriterSettings
    $settingsXml.Indent = $true
    $settingsXml.Encoding = New-Object System.Text.UTF8Encoding($false)
    $writer = [System.Xml.XmlWriter]::Create((Join-Path $staging 'imsmanifest.xml'), $settingsXml)
    $manifest.Save($writer); $writer.Close()

    # Write the ZIP with forward slashes in every path (some LMS players need this).
    $zipPath = Join-Path $OutputFolder $zipName
    $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($item in ($included | Sort-Object Rel)) {
            $source = Join-Path $staging ($item.Rel -replace '/', '\')
            $entry = $zip.CreateEntry($item.Rel, [System.IO.Compression.CompressionLevel]::Optimal)
            $in = [System.IO.File]::OpenRead($source); $out = $entry.Open()
            try { $in.CopyTo($out) } finally { $out.Dispose(); $in.Dispose() }
        }
    } finally { $zip.Dispose() }

    # Re-open and confirm the ZIP is shaped correctly.
    $check = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $names = @($check.Entries | ForEach-Object { $_.FullName })
        if ($names -notcontains 'imsmanifest.xml') { throw 'imsmanifest.xml is not at the top level of the ZIP.' }
        if (@($names | Where-Object { $_ -match '\\' }).Count -gt 0) { throw 'The ZIP contains backslashes in file paths.' }
        if ($names.Count -ne $included.Count) { throw "The ZIP has $($names.Count) files; expected $($included.Count)." }
    } finally { $check.Dispose() }
}
finally {
    Remove-Item -LiteralPath $staging -Recurse -Force -ErrorAction SilentlyContinue
}

$reportPath = Join-Path $OutputFolder ($zipName -replace '\.zip$', '_check-report.txt')
Write-Report $reportPath 'BUILT - ready for security review' | ForEach-Object { Write-Host $_ }
Write-Host ''
Write-Host "Package: $zipPath"
Write-Host "Report:  $reportPath"
exit 0
