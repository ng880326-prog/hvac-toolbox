# Open 00_HVAC Toolbox_R6.xlsm in Excel, force a full recalculation, read the key cells and save.
# Written as a script file because inline PowerShell quoting mangles the COM calls.
$ErrorActionPreference = 'Stop'
$path = Join-Path (Split-Path -Parent $PSScriptRoot) '00_HVAC Toolbox_R6.xlsm'
if (-not (Test-Path $path)) { Write-Output "MISSING: $path"; exit 1 }

try {
    $xl = New-Object -ComObject Excel.Application
} catch {
    Write-Output "COM-UNAVAILABLE: $($_.Exception.Message)"
    exit 2
}

$xl.Visible = $true
$xl.DisplayAlerts = $false
try {
    $wb = $xl.Workbooks.Open($path, 0, $false)      # UpdateLinks=0, ReadOnly=false
} catch {
    Write-Output "OPEN-FAILED: $($_.Exception.Message)"
    $xl.Quit()
    exit 3
}

Write-Output "opened: $($wb.Name) ; sheets: $($wb.Worksheets.Count)"
Write-Output "excel version: $($xl.Version)"

# Force a complete recalculation (the patched file ships no cached values)
$xl.Calculation = -4105            # xlCalculationAutomatic
$xl.CalculateFullRebuild()
$xl.CalculateUntilAsyncQueriesDone()

function Cell($sheet, $ref) {
    $ws = $wb.Worksheets.Item($sheet)
    return $ws.Range($ref).Value2
}

Write-Output '--- recalculated values read back from Excel ---'
$checks = @(
    @('Wheel', 'BM11', 'pws(-39.5 C) ice branch', 0.013591, 0.0004),
    @('Wheel', 'BM12', 'pws(-39.0 C) ice branch', 0.014377, 0.0004),
    @('Wheel', 'BM40', 'pws(-25.0 C) ice branch', 0.063289, 0.0006),
    @('Wheel', 'BM130', 'pws(0.0 C)', 0.611154, 0.0006),
    @('Wheel', 'BS11', 'dew point at saturation', -39.5, 0.000001),
    @('Air-side', 'AS5', 'air viscosity at 37 C', 0.00001894, 0.0000000001),
    @('Supporting 6', 'A13', 'picked value (has ISNUMBER guard)', $null, $null)
)
$ok = 0; $fail = 0
foreach ($c in $checks) {
    $v = Cell $c[0] $c[1]
    if ($null -eq $c[3]) {
        Write-Output ("  {0,-9} {1,-4} {2,-38} = {3}" -f $c[0], $c[1], $c[2], $v)
        $ok++
        continue
    }
    $good = [math]::Abs([double]$v - [double]$c[3]) -le [double]$c[4]
    if ($good) { $ok++ } else { $fail++ }
    Write-Output ("  {0,-9} {1,-4} {2,-38} = {3,-12} expect {4}  {5}" -f $c[0], $c[1], $c[2], $v, $c[3], $(if ($good) { 'OK' } else { 'FAIL' }))
}

$wb.Save()
$wb.Close($true)
Write-Output "saved with recalculated values: $([math]::Round((Get-Item $path).Length / 1MB, 2)) MB"
Write-Output "checks: $ok ok / $fail fail"

# Re-open visibly for the user, leaving Excel open
$xl.Workbooks.Open($path, 0, $true) | Out-Null
$xl.Visible = $true
Write-Output 'R6 is open in Excel (read-only view) for inspection.'
exit $(if ($fail -gt 0) { 1 } else { 0 })
