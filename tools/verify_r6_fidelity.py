"""Fidelity check: what did the openpyxl round-trip lose from the workbook?

The R6 rewrite (tools/fix_r6.py + openpyxl keep_vba) fixed formulas, but openpyxl cannot represent every
part a real Excel file carries — shapes it does not model, embedded media, printer settings and chart
relationships are commonly dropped. Because these sheets use drawings for their button rows and
schematics, this compares the two workbooks part by part:

  * the media inventory (names, not just counts)
  * chart parts and their .rels
  * which <drawing> each worksheet points at, and whether that part still exists
  * comments / VML / controls / printer settings

Usage: python tools/verify_r6_fidelity.py [R5.xlsm] [R6.xlsm]
Exit code 1 when lossy parts other than Excel-rebuildable ones went missing.
"""
import os
import re
import sys
import zipfile
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R5 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '00_HVAC Toolbox_R5.xlsm')
R6 = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, '00_HVAC Toolbox_R6.xlsm')

KNOWN_REBUILDABLE = ('xl/calcChain.xml',)   # Excel rebuilds this on open


def cats(names):
    c = Counter()
    for n in names:
        for key, prefix in (('charts', 'xl/charts/'), ('media', 'xl/media/'),
                            ('drawings', 'xl/drawings/'), ('sheets', 'xl/worksheets/'),
                            ('ctrlProps', 'xl/ctrlProps/'), ('printer', 'xl/printerSettings/'),
                            ('comments', 'xl/comments'), ('vml', '.vml')):
            if n.startswith(prefix):
                c[key] += 1
                break
        else:
            if n == 'xl/vbaProject.bin':
                c['vba'] += 1
    return c


def rel_pairs(xml):
    """{Id: Target} from a .rels part — attributes may appear in any order, so parse them properly."""
    out = {}
    for tag in re.findall(r'<Relationship\b[^>]*/>', xml):
        rid = re.search(r'\bId="([^"]+)"', tag)
        tgt = re.search(r'\bTarget="([^"]+)"', tag)
        if rid and tgt:
            out[rid.group(1)] = tgt.group(1)
    return out


def resolve_target(target, base_dir='xl'):
    """OPC targets may be package-absolute ('/xl/worksheets/sheet1.xml') or relative ('worksheets/...')."""
    if target.startswith('/'):
        return target.lstrip('/')
    return os.path.normpath(os.path.join(base_dir, target)).replace('\\', '/')


def sheet_map(z):
    """sheet name -> drawing part it references (through the sheet's .rels), or None."""
    wb = z.read('xl/workbook.xml').decode('utf-8', 'ignore')
    tags = [t for t in re.findall(r'<sheet\b[^>]*/>', wb)
            if re.search(r'\bname="', t) and re.search(r'\br:id="', t)]
    order = [(re.search(r'\bname="([^"]+)"', t).group(1), re.search(r'\br:id="([^"]+)"', t).group(1))
             for t in tags]
    targets = rel_pairs(z.read('xl/_rels/workbook.xml.rels').decode('utf-8', 'ignore'))
    names = set(z.namelist())
    out = {}
    for name, rid in order:
        target = targets.get(rid, '')
        if not target:
            continue
        part = resolve_target(target, 'xl')
        if part not in names:
            out[name] = None
            continue
        xml = z.read(part).decode('utf-8', 'ignore')
        # openpyxl writes <drawing xmlns:r="…" r:id="rId2"/>, so the r:id is not adjacent to the tag name
        drawing = re.search(r'<drawing\b[^>]*r:id="(rId\d+)"', xml)
        legacy = re.search(r'<legacyDrawing\b[^>]*r:id="(rId\d+)"', xml)
        controls = '<controls>' in xml
        if not drawing:
            out[name] = {'drawing': None, 'legacy': bool(legacy), 'controls': controls}
            continue
        relpath = 'xl/worksheets/_rels/%s.rels' % os.path.basename(part)
        if relpath in names:
            drels = rel_pairs(z.read(relpath).decode('utf-8', 'ignore'))
            tgt = drels.get(drawing.group(1), '')
            out[name] = {'drawing': resolve_target(tgt, 'xl/worksheets') if tgt else None,
                         'legacy': bool(legacy), 'controls': controls}
        else:
            out[name] = {'drawing': None, 'legacy': bool(legacy), 'controls': controls}
    return out


def main():
    z5, z6 = zipfile.ZipFile(R5), zipfile.ZipFile(R6)
    n5, n6 = set(z5.namelist()), set(z6.namelist())
    lost = sorted(n5 - n6)

    print('=== inventory ===')
    c5, c6 = cats(n5), cats(n6)
    for k in sorted(set(c5) | set(c6)):
        flag = '' if c5[k] == c6[k] else '   <-- differs'
        print('  %-12s R5=%-5d R6=%-5d%s' % (k, c5[k], c6[k], flag))

    print('\n=== embedded media (names) ===')
    m5 = sorted(n for n in n5 if n.startswith('xl/media/'))
    m6 = sorted(n for n in n6 if n.startswith('xl/media/'))
    print('  R5:', m5)
    print('  R6:', m6)
    print('  missing in R6:', [n for n in m5 if n not in m6] or 'none')

    print('\n=== charts ===')
    ch5 = sorted(n for n in n5 if n.startswith('xl/charts/'))
    ch6 = sorted(n for n in n6 if n.startswith('xl/charts/'))
    print('  R5:', ch5)
    print('  R6:', ch6)
    print('  missing in R6:', [n for n in ch5 if n not in ch6] or 'none')

    print('\n=== per-sheet drawing / controls state (only sheets that changed) ===')
    s5, s6 = sheet_map(z5), sheet_map(z6)
    changed = 0
    lost_draw = lost_ctrl = 0
    for name in s5:
        a, b = s5.get(name) or {}, s6.get(name) or {}
        if a.get('drawing') != b.get('drawing') or a.get('controls') != b.get('controls'):
            changed += 1
            if a.get('drawing') and not b.get('drawing'):
                lost_draw += 1
            if a.get('controls') and not b.get('controls'):
                lost_ctrl += 1
            print('  %-22s drawing %s -> %s | controls %s -> %s'
                  % (name, a.get('drawing'), b.get('drawing'), a.get('controls'), b.get('controls')))
    if not changed:
        print('  (none)')
    print('  sheets that lost their drawing: %d ; sheets that lost form controls: %d'
          % (lost_draw, lost_ctrl))

    print('\n=== drawing parts / rels ===')
    for tag, z, names in (('R5', z5, n5), ('R6', z6, n6)):
        parts = [n for n in names if n.startswith('xl/drawings/drawing') and n.endswith('.xml')]
        rels = [n for n in names if n.startswith('xl/drawings/_rels/')]
        print('  %s: %d drawing parts, %d drawing rels' % (tag, len(parts), len(rels)))
    d6 = [n for n in n6 if n.startswith('xl/drawings/drawing') and n.endswith('.xml')]
    gone_rels = [os.path.basename(n) for n in d6
                 if ('xl/drawings/_rels/%s.rels' % os.path.basename(n)) in n5
                 and ('xl/drawings/_rels/%s.rels' % os.path.basename(n)) not in n6]
    print('  R6 drawings whose .rels existed in R5 but is gone:', gone_rels or 'none')

    print('\n=== lost parts, by kind ===')
    meaningful = [n for n in lost if n not in KNOWN_REBUILDABLE
                  and not n.startswith('xl/comments') and not n.endswith('.vml')]
    print('  %d parts lost (excluding calcChain / comments / VML)' % len(meaningful))
    for prefix, desc in (('xl/printerSettings', 'print setup — cosmetic, Excel re-creates'),
                         ('xl/drawings', 'sheet drawings — buttons / schematics'),
                         ('xl/media', 'embedded images'),
                         ('xl/charts', 'chart parts'),
                         ('xl/comments', 'comments'),
                         ('xl/ctrlProps', 'form control properties')):
        left = [n for n in lost if n.startswith(prefix)]
        if left:
            print('    - %-20s %-3d lost — %s' % (prefix, len(left), desc))

    verdict = []
    if any(n.startswith('xl/media/') for n in lost):
        verdict.append('embedded image lost: ' + ', '.join(n for n in lost if n.startswith('xl/media/')))
    draw_lost = [n for n in lost if n.startswith('xl/drawings/')]
    if draw_lost:
        verdict.append('%d drawing parts lost' % len(draw_lost))
    if any(n.startswith('xl/charts/') and n.endswith('.rels') for n in lost):
        verdict.append('chart relationship parts lost')
    print('\nVERDICT: %s' % ('; '.join(verdict) if verdict else 'nothing beyond rebuildable parts was lost'))
    return 1 if verdict else 0


if __name__ == '__main__':
    sys.exit(main())
