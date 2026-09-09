# Deduplicate formulas: exact-unique + signature families (refs normalized), with cached values
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ws    = (Get-Location).Path
$src   = Join-Path $ws '00_HVAC Toolbox_R5.xlsm'
$out   = Join-Path $ws 'analysis'

$zip = [System.IO.Compression.ZipFile]::OpenRead($src)

function Read-Entry($name) {
  $entry = $zip.GetEntry($name)
  if (-not $entry) { return $null }
  $reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
  try { return $reader.ReadToEnd() } finally { $reader.Close() }
}

$wb = [xml](Read-Entry 'xl/workbook.xml')
$ns = New-Object System.Xml.XmlNamespaceManager($wb.NameTable)
$ns.AddNamespace('m', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')

$sheets = $wb.SelectNodes('//m:sheets/m:sheet', $ns)
$rels = [xml](Read-Entry 'xl/_rels/workbook.xml.rels')
$relMap = @{}
foreach ($rel in $rels.Relationships.Relationship) { $relMap[$rel.Id] = $rel.Target }

$strings = [System.Collections.Generic.List[string]]::new()
$ssText = Read-Entry 'xl/sharedStrings.xml'
if ($ssText) {
  $ss = [xml]$ssText
  foreach ($si in $ss.SelectNodes('//*[local-name()="si"]')) {
    $parts = $si.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }
    $strings.Add(($parts -join ''))
  }
}

function Norm([string]$f) {
  # normalize whitespace and cell refs -> generic tokens
  $f = $f.Trim()
  $f = [regex]::Replace($f, '\s+', '')
  $f = [regex]::Replace($f, "'[^']+'!", "'SHEET'!")
  $f = [regex]::Replace($f, '\$?[A-Z]{1,3}\$?\d+(:\$?[A-Z]{1,3}\$?\d+)?', '@')
  $f = [regex]::Replace($f, '\[[^\]]+\]', '')
  return $f
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('# 唯一公式總表 (去重)')
[void]$sb.AppendLine('')

foreach ($s in $sheets) {
  $name = $s.name
  $rid  = $s.GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
  $target = $relMap[$rid]
  if (-not $target) { continue }
  $wsXml = [xml](Read-Entry ("xl/" + $target))
  $cells = $wsXml.SelectNodes('//*[local-name()="c"]')

  $exact = @{}   # formula text -> @{count; cells; values}
  $fams  = @{}   # normalized -> @{count; examples}

  foreach ($c in $cells) {
    $fNode = $c.SelectSingleNode('./*[local-name()="f"]')
    if (-not $fNode) { continue }
    $f = $fNode.InnerText
    $norm = Norm $f

    if (-not $exact.ContainsKey($f)) {
      $exact[$f] = @{ count = 0; cells = New-Object System.Collections.Generic.List[string]; values = New-Object System.Collections.Generic.List[string] }
    }
    $exact[$f].count++
    if ($exact[$f].cells.Count -lt 4) { $exact[$f].cells.Add($c.r) }
    if ($exact[$f].values.Count -lt 2) {
      $vNode = $c.SelectSingleNode('./*[local-name()="v"]')
      $v = if ($vNode) { $vNode.InnerText } else { $null }
      if ($v) {
        if ($c.t -eq 's') {
          $idx = [int]$v
          if ($idx -ge 0 -and $idx -lt $strings.Count) { $v = $strings[$idx] } else { $v = "SST[$idx]??" }
        }
        $exact[$f].values.Add($v)
      }
    }

    if (-not $fams.ContainsKey($norm)) { $fams[$norm] = @{ count = 0; ex = $f } }
    $fams[$norm].count++
  }

  [void]$sb.AppendLine("## Sheet: $name   (formula cells: $($cells.Count - ($cells.Count - $cells.Count)) / total $($cells.Count))")
  $sortedF = $fams.GetEnumerator() | Sort-Object { -$_.Value.count }
  foreach ($kv in $sortedF) {
    [void]$sb.AppendLine("- [x$($kv.Value.count)] family: ``$($kv.Key)``")
    [void]$sb.AppendLine("    e.g. ``$($kv.Value.ex)``")
  }
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("---")
  [void]$sb.AppendLine("")
}

$zip.Dispose()
[System.IO.File]::WriteAllText((Join-Path $out 'unique_formulas.md'), $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Output "DONE unique_formulas.md"
