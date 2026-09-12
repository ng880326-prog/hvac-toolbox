"""Resolve the Wheel sheet's questionable input values, its drawing, and the Wheel Support lookups."""
import os
import re
import zipfile

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
z = zipfile.ZipFile('00_HVAC Toolbox_R5.xlsm')

# --- 1. number formats of the efficiency / airflow input cells ---
styles = z.read('xl/styles.xml').decode('utf-8', 'ignore')
custom = dict(re.findall(r'<numFmt numFmtId="(\d+)" formatCode="([^"]*)"', styles))
xfs = re.findall(r'<xf [^>]*/?>', styles.split('<cellXfs')[1])
BUILTIN = {'0': 'General', '1': '0', '2': '0.00', '9': '0%', '10': '0.00%', '14': 'm/d/yyyy'}
sheet = z.read('xl/worksheets/sheet5.xml').decode('utf-8', 'ignore')
print('=== input cells: style -> number format ===')
for ref in ['D8', 'D10', 'D14', 'D15', 'D18', 'D19']:
    m = re.search(r'<c r="%s"([^>]*)>(.*?)</c>' % ref, sheet, re.S)
    if not m:
        print('%-5s absent' % ref)
        continue
    s = re.search(r's="(\d+)"', m.group(1))
    v = re.search(r'<v>(.*?)</v>', m.group(2))
    idx = int(s.group(1)) if s else -1
    fmt = None
    if 0 <= idx < len(xfs):
        fm = re.search(r'numFmtId="(\d+)"', xfs[idx])
        fmt = fm.group(1) if fm else None
    code = custom.get(fmt or '', BUILTIN.get(fmt or '', '?'))
    print('%-5s style=%-5s numFmtId=%-5s format=%-12s cached=%s' % (
        ref, idx, fmt, code, (v.group(1) if v else '')[:20]))

# --- 2. the Wheel sheet drawing ---
print('\n=== Wheel sheet drawing (drawing7.xml) ===')
x = z.read('xl/drawings/drawing7.xml').decode('utf-8', 'ignore')
print('bytes:', len(x), 'sp shapes:', len(re.findall(r'<xdr:sp>', x)),
      'pictures:', len(re.findall(r'<xdr:pic>', x)),
      'graphicFrames:', len(re.findall(r'<xdr:graphicFrame', x)),
      'groups:', len(re.findall(r'<xdr:grpSp>', x)))
texts = re.findall(r'<a:t>(.*?)</a:t>', x, re.S)
print('texts:', ' | '.join(t.strip() for t in texts if t.strip())[:600])
print('geometry:', sorted(set(re.findall(r'<a:prstGeom prst="([a-z]+)"', x))))
print('lines/arrows:', len(re.findall(r'<a:ln[ >]', x)), 'headEnd/tailEnd:',
      len(re.findall(r'<a:(?:head|tail)End', x)))
rels_name = 'xl/drawings/_rels/drawing7.xml.rels'
print('drawing rels:', z.read(rels_name).decode('utf-8', 'ignore')[:400]
      if rels_name in z.namelist() else '(no rels — drawing holds only shapes, no pictures)')
media = [n for n in z.namelist() if n.startswith('xl/media/')]
print('workbook media files:', len(media), media[:12])

# --- 3. Wheel Support sheet: what tables does it hold ---
print('\n=== Wheel Support (sheet6) labels ===')
s6 = z.read('xl/worksheets/sheet6.xml').decode('utf-8', 'ignore')
shared = z.read('xl/sharedStrings.xml').decode('utf-8', 'ignore')
strs = re.findall(r'<si>(.*?)</si>', shared, re.S)
strs = [re.sub(r'<[^>]+>', '', s) for s in strs]
refs = re.findall(r'<c r="([A-Z]+\d+)"[^>]*t="s"[^>]*><v>(\d+)</v>', s6)
labels = [(r, strs[int(i)]) for r, i in refs if int(i) < len(strs)]
print('string cells: %d' % len(labels))
for r, s in labels[:22]:
    print('  %-6s %s' % (r, s[:70]))
