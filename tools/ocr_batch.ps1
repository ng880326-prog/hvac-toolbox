$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\tools\ocr_out'
$base = 'G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller'

# 1) extract remaining scanned pages (GART p13-20, ETI-Z p2-10)
$py = @'
import pypdf, os, glob
base = r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller"
out = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\tools\ocr_out"
jobs = [(glob.glob(base + r"\**\GART Chiller.pdf", recursive=True)[0], 13, 21, "gart"),
        (glob.glob(base + r"\**\Low GWP Refrigerant VSD ETI-Z.pdf", recursive=True)[0], 2, 13, "etiz")]
for f, a, b, tag in jobs:
    r = pypdf.PdfReader(f)
    for i in range(a, min(b, len(r.pages))):
        try:
            imgs = r.pages[i].images
            big = [im for im in imgs if im.image and im.image.size[0] > 800]
            if big:
                big[0].image.convert('RGB').save(os.path.join(out, f"{tag}_p{i+1}.png"))
                print("saved", f"{tag}_p{i+1}.png", big[0].image.size)
        except Exception as e:
            print(i, "err", str(e)[:50])
'@
$pyFile = Join-Path $root '..\ocr_ex_all.py'
[System.IO.File]::WriteAllText($pyFile, $py, (New-Object System.Text.UTF8Encoding($false)))
python $pyFile 2>&1 | Select-Object -First 30

# 2) OCR loop over all big scans
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Foundation, ContentType = WindowsRuntime]
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, $t) { $task = $asTaskGeneric.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait() | Out-Null; $task.Result }
foreach ($img in (Get-ChildItem "$root\gart_p*.png", "$root\etiz_p*.png" | Sort-Object Name)) {
  $txt = "$($img.FullName -replace '\.png$','.txt')"
  if (Test-Path $txt) { continue }
  try {
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($img.FullName)) ([Windows.Storage.StorageFile])
    $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $dec = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bmp = Await ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $eng = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    $res = Await ($eng.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
    $lines = $res.Lines | ForEach-Object { $_.Text }
    [System.IO.File]::WriteAllLines($txt, $lines, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output ("OCR " + $img.Name + " -> " + $lines.Count + " lines")
  } catch { Write-Output ("ERR " + $img.Name + " " + $_.Exception.Message.Substring(0, [Math]::Min(60, $_.Exception.Message.Length))) }
}
Write-Output "DONE"