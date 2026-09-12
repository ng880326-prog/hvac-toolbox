"""Extract the exact Wheel-sheet formulas worth reproducing, plus the sheet drawing."""
import io
import os
import re
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

DUMP = 'analysis/sheets/05_Wheel.txt'
CELL = re.compile(r'^([A-Z]+\d+)\s+\|\s+t=(\S*)\s+\|\s+F:\s?(.*?)\s+\|\s+V:\s?(.*)$')

WANT = ['O6', 'O7', 'T6', 'T7', 'X8', 'O10', 'T10', 'X10', 'O12', 'Q12', 'O14', 'Q14', 'O16',
        'Q16', 'O20', 'O22', 'Q22', 'O24', 'Q24', 'O26', 'Q26', 'O28', 'Q28', 'O30', 'Q30',
        'O32', 'Q32', 'O34', 'Q34', 'O36', 'Q36', 'O38', 'Q38', 'O40', 'Q40', 'Z22', 'Z24',
        'Z33', 'Z27', 'Z30', 'V25', 'V28', 'H8', 'H36', 'F16', 'D16', 'B23', 'F23', 'B28',
        'F28', 'B37', 'F37', 'V33', 'T8', 'T11', 'AB7', 'AA7', 'X13', 'X14', 'X16', 'X22',
        'X24', 'X30', 'X31', 'X33', 'X34', 'X37', 'X40']

cells = {}
for line in io.open(DUMP, encoding='utf-8', errors='ignore'):
    m = CELL.match(line.rstrip('\n'))
    if m:
        cells[m.group(1)] = (m.group(2), m.group(3), m.group(4))

print('=== requested Wheel cells (type | formula | cached) ===')
for ref in WANT:
    t, f, v = cells.get(ref, ('-', '', ''))
    print('%-5s t=%-4s f=%-96s v=%s' % (ref, t, f.strip()[:96], v.strip()[:40]))

print('\n=== every formula mentioning the efficiency or warning cells ===')
for ref in sorted(cells, key=lambda r: (int(re.search(r'\d+', r).group()), r)):
    t, f, v = cells[ref]
    if re.search(r'D18|D19|F16|D16|1\.5', f):
        print('%-5s %s' % (ref, f.strip()[:150]))

print('\n=== drawing7.xml: shapes and text ===')
z = zipfile.ZipFile('00_HVAC Toolbox_R5.xlsm')
for name in z.namelist():
    if 'drawings/drawing' in name and name.endswith('.xml'):
        x = z.read(name).decode('utf-8', 'ignore')
        texts = re.findall(r'<a:t>(.*?)</a:t>', x, re.S)
        if any(k in ' '.join(texts) for k in ['Wheel', 'to,1', 'tr,2', 'OA', 'RA', 'EA', 'SA']):
            print('--- %s (shapes: %d, texts: %d) ---' % (name, len(re.findall(r'<xdr:sp>', x)), len(texts)))
            print(' | '.join(t.strip() for t in texts if t.strip())[:900])
            prsts = re.findall(r'<a:prstGeom prst="([a-z]+)"', x)
            print('geometry:', sorted(set(prsts)))
