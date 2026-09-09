# Extract full structure + formulas + cached values from the HVAC Toolbox .xlsm
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ws    = (Get-Location).Path
$src   = Join-Path $ws '00_HVAC Toolbox_R5.xlsm'
$out   = Join-Path $ws 'analysis'
$sheetOut = Join-Path $out 'sheets'
New-Item -ItemType Directory -Force -Path $out | Out-Null
New-Item -ItemType Directory -Force -Path $sheetOut | Out-Null

$zip = [System.IO.Compression.ZipFile]::OpenRead($src)

function Read-Entry($name) {
  $entry = $zip.GetEntry($name)
  if (-not $entry) { return $null }
  $reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
  try { return $reader.ReadToEnd() } finally { $reader.Close() }
}

# ---------- workbook.xml ----------
$wbText = Read-Entry 'xl/workbook.xml'
$wb = [xml]$wbText
$ns = New-Object System.Xml.XmlNamespaceManager($wb.NameTable)
$ns.AddNamespace('m', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
$ns.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("WORKBOOK STRUCTURE")
[void]$sb.AppendLine("===================")
$sheets = $wb.SelectNodes('//m:sheets/m:sheet', $ns)
[void]$sb.AppendLine("Sheet count: $($sheets.Count)")
foreach ($s in $sheets) {
  [void]$sb.AppendLine("  name=$($s.name)  sheetId=$($s.sheetId)  r:id=$($s.GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships'))  state=$($s.state)")
}

$dn = $wb.SelectNodes('//m:definedNames/m:definedName', $ns)
[void]$sb.AppendLine("")
[void]$sb.AppendLine("DEFINED NAMES: $($dn.Count)")
foreach ($d in $dn) {
  [void]$sb.AppendLine("  [$($d.name)] = $($d.InnerText)")
}

$vba = $zip.GetEntry('xl/vbaProject.bin')
[void]$sb.AppendLine("")
[void]$sb.AppendLine("VBA PROJECT: " + $(if ($vba) { "present ($($vba.Length) bytes)" } else { "absent" }))
$cc = $zip.GetEntry('xl/calcChain.xml')
[void]$sb.AppendLine("CalcChain: " + $(if ($cc) { "present" } else { "absent" }))

# ---------- rels: sheet rId -> target ----------
$rels = [xml](Read-Entry 'xl/_rels/workbook.xml.rels')
$relMap = @{}
foreach ($rel in $rels.Relationships.Relationship) {
  $relMap[$rel.Id] = $rel.Target
}

# ---------- shared strings ----------
$strings = [System.Collections.Generic.List[string]]::new()
$ssText = Read-Entry 'xl/sharedStrings.xml'
if ($ssText) {
  $ss = [xml]$ssText
  foreach ($si in $ss.SelectNodes('//*[local-name()="si"]')) {
    $parts = $si.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }
    $strings.Add(($parts -join ''))
  }
}
[void]$sb.AppendLine("Shared strings: $($strings.Count)")

# ---------- per-sheet dump ----------
$formulaSb = New-Object System.Text.StringBuilder
[void]$formulaSb.AppendLine("# HVAC Toolbox — 公式總表 (per sheet)")
[void]$formulaSb.AppendLine("")

function ColName([int]$c) {
  $name = ''
  while ($c -gt 0) {
    $m = ($c - 1) % 26
    $name = [char](65 + $m) + $name
    $c = [int][math]::Floor(($c - 1) / 26)
  }
  return $name
}

$sheetIdx = 0
foreach ($s in $sheets) {
  $sheetIdx++
  $name = $s.name
  $rid  = $s.GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
  $target = $relMap[$rid]
  if (-not $target) { continue }
  $wsXml = [xml](Read-Entry ("xl/" + $target))

  $cells = $wsXml.SelectNodes('//*[local-name()="c"]')
  [void]$sb.AppendLine("Sheet [$name]  ->  $target   cells: $($cells.Count)")

  $sheetSb = New-Object System.Text.StringBuilder
  [void]$sheetSb.AppendLine("SHEET: $name")
  [void]$sheetSb.AppendLine("")

  $formulaCount = 0
  $rows = @{}   # rowNumber -> list of strings
  foreach ($c in $cells) {
    $ref = $c.r
    if (-not $ref) { continue }
    if ($ref -notmatch '^([A-Z]+)(\d+)$') { continue }
    $col = $Matches[1]; $rowNum = [int]$Matches[2]

    $fNode = $c.SelectSingleNode('./*[local-name()="f"]')
    $formula = if ($fNode) { $fNode.InnerText } else { $null }

    # cached value
    $val = $null
    $t = $c.t
    if ($t -eq 'inlineStr') {
      $val = ($c.SelectNodes('./*[local-name()="is"]/*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join ''
    } else {
      $vNode = $c.SelectSingleNode('./*[local-name()="v"]')
      if ($vNode) {
        $val = $vNode.InnerText
        if ($t -eq 's') {
          $idx = [int]$val
          if ($idx -ge 0 -and $idx -lt $strings.Count) { $val = $strings[$idx] }
          else { $val = "SST[$idx]??" }
        } elseif ($t -eq 'str') {
          # formula string result
        }
      }
    }

    if ($formula -ne $null -or $val -ne $null -or $t) {
      $line = ("{0,-5} | t={1,-10} | F: {2} | V: {3}" -f $ref, $t, ($formula -replace '\s+',' '), $val)
      if (-not $rows.ContainsKey($rowNum)) { $rows[$rowNum] = New-Object System.Collections.Generic.List[string] }
      $rows[$rowNum].Add($line)
      if ($formula -ne $null) {
        $formulaCount++
        [void]$formulaSb.AppendLine("### $name ! $ref")
        [void]$formulaSb.AppendLine("``````")
        [void]$formulaSb.AppendLine($formula)
        [void]$formulaSb.AppendLine("``````")
        if ($val -ne $null) { [void]$formulaSb.AppendLine("快取值: $val") }
        [void]$formulaSb.AppendLine("")
      }
    }
  }

  [void]$sb.AppendLine("   formulas: $formulaCount")
  foreach ($k in ($rows.Keys | Sort-Object)) {
    foreach ($l in $rows[$k]) { [void]$sheetSb.AppendLine($l) }
  }
  $sheetFile = Join-Path $sheetOut ("{0:D2}_{1}.txt" -f $sheetIdx, ($name -replace '[^\w\-\. ]','_'))
  [System.IO.File]::WriteAllText($sheetFile, $sheetSb.ToString(), [System.Text.Encoding]::UTF8)
}

$zip.Dispose()

[System.IO.File]::WriteAllText((Join-Path $out '00_structure.txt'), $sb.ToString(), [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Join-Path $out 'formulas_all.md'), $formulaSb.ToString(), [System.Text.Encoding]::UTF8)
Write-Output "DONE. Files written to analysis/"
