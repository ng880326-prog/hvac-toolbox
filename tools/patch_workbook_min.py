"""Lossless workbook patch: apply only the intended R6 fixes to R5, cell by cell.

The openpyxl route (tools/fix_r6.py) produced correct formulas but dropped parts Excel needs — see
tools/verify_r6_fidelity.py: the <drawing> reference of all 21 visible sheets, 33 drawing parts, one
embedded image, 3 chart .rels and 22 printer settings. This script instead copies R5 verbatim and
rewrites only the cells the fix intended to change, taking the intended formula text from the openpyxl
R6 file (openpyxl expands shared formulas, so each cell there already carries its resolved text).

Sources of intent:
  * tools/r6_changes.log — {"changed_cells": ["Sheet!A1", ..., "Wheel!BJ10:BT168 (n rows)"]}
  * the same script's special cases (Air-side!BP10 is a text label, so it becomes an inline string)

Everything else in the file — drawings, media, charts, printer settings, VBA, calc chains — is copied
byte-for-byte, so the workbook keeps its button rows and schematics. xl/calcChain.xml is dropped and
calcPr gets fullCalcOnLoad="1" so Excel refreshes every formula when the file is opened.

Usage:
    python tools/patch_workbook_min.py --dry-run
    python tools/patch_workbook_min.py --out "00_HVAC Toolbox_R6_lossless.xlsm"
    python tools/patch_workbook_min.py --check "00_HVAC Toolbox_R6_lossless.xlsm"
"""
import io
import json
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R5 = os.path.join(ROOT, '00_HVAC Toolbox_R5.xlsm')
R6 = os.path.join(ROOT, '00_HVAC Toolbox_R6.xlsm')
LOG = os.path.join(ROOT, 'tools', 'r6_changes.log')

CELL = re.compile(r'<c\s+r="([A-Z]+[0-9]+)"(.*?)(?:/>|>(.*?)</c>)', re.S)
FORMULA = re.compile(r'<f([^>]*?)(?:/>|>(.*?)</f>)', re.S)
LABEL_FIX = {'Air-side!BP10': 'pi x a x b'}          # text label, not a formula


def col_num(letters):
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch) - 64)
    return n


def num_col(n):
    s = ''
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def xml_unescape(s):
    """XML text -> plain text. '&amp;' must be last so '&amp;lt;' does not become '<'."""
    return (s.replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"')
             .replace('&apos;', "'").replace('&amp;', '&'))


def xml_escape(s):
    """Plain text -> XML text. '&' must be first."""
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def rel_pairs(xml):
    """{Id: Target} — attribute order varies (openpyxl writes Type/Target before Id)."""
    out = {}
    for tag in re.findall(r'<Relationship\b[^>]*/>', xml):
        rid = re.search(r'\bId="([^"]+)"', tag)
        tgt = re.search(r'\bTarget="([^"]+)"', tag)
        if rid and tgt:
            out[rid.group(1)] = tgt.group(1)
    return out


def resolve_target(target, base='xl'):
    """OPC targets are package-absolute ('/xl/…') or relative to the part's own folder."""
    if target.startswith('/'):
        return target.lstrip('/')
    return os.path.normpath(os.path.join(base, target)).replace('\\', '/')


def sheet_parts(z):
    wb = z.read('xl/workbook.xml').decode('utf-8', 'ignore')
    rels = rel_pairs(z.read('xl/_rels/workbook.xml.rels').decode('utf-8', 'ignore'))
    names = set(z.namelist())
    out = {}
    for tag in re.findall(r'<sheet\b[^>]*/>', wb):
        nm = re.search(r'\bname="([^"]+)"', tag)
        rid = re.search(r'\br:id="(rId\d+)"', tag)
        if not (nm and rid):
            continue
        part = resolve_target(rels.get(rid.group(1), ''), 'xl')
        if part in names:
            out[nm.group(1)] = part
    return out


def parse_cells(xml):
    return {m.group(1): m for m in CELL.finditer(xml)}


def formula_text(inner):
    m = FORMULA.search(inner)
    if not m:
        return None
    return m.group(2) if m.group(2) is not None else ''


INTENT = os.path.join(ROOT, 'tools', 'r6_formula_intent.json')


def extract_intent():
    """Write the per-cell formula intent out of the openpyxl R6 file into a small JSON record.

    Keeps the lossless patch reproducible without openpyxl: only the intended formula text matters,
    the rest of the workbook comes from R5 byte-for-byte.
    """
    if not os.path.exists(R6):
        raise SystemExit('intent workbook not found: %s (run tools/fix_r6.py first)' % R6)
    log = json.load(io.open(LOG, encoding='utf-8'))
    z6 = zipfile.ZipFile(R6)
    parts6 = sheet_parts(z6)
    wanted = refs_from_log(log)
    intent = {}
    for sheet, refs in wanted.items():
        part = parts6.get(sheet)
        if part is None:
            continue
        cells = parse_cells(z6.read(part).decode('utf-8', 'ignore'))
        entry = {}
        for ref in sorted(refs):
            label = LABEL_FIX.get(sheet + '!' + ref)
            if label is not None:
                entry[ref] = ['label', label, None]
                continue
            m = cells.get(ref)
            if m is None:
                continue
            f = formula_text(m.group(3) or '')
            if f:
                # store plain text; the writer escapes it again
                entry[ref] = ['formula', xml_unescape(f), cells_index_style(cells, ref)]
        if entry:
            intent[sheet] = entry
    io.open(INTENT, 'w', encoding='utf-8').write(json.dumps(intent, indent=1, ensure_ascii=False))
    n = sum(len(v) for v in intent.values())
    print('wrote %s — %d cells across %d sheets' % (os.path.relpath(INTENT, ROOT), n, len(intent)))
    return intent


def cells_index_style(cells, ref):
    """Style index of a cell (kept so a newly inserted cell matches its neighbours)."""
    m = cells.get(ref)
    if m is None:
        return None
    s = re.search(r'\bs="(\d+)"', m.group(2))
    return int(s.group(1)) if s else None


def refs_from_log(log):
    """sheet -> set(cell refs), expanding range entries such as 'Wheel!BJ10:BT168 (159 rows)'."""
    wanted = {}
    for entry in log['changed_cells']:
        m = re.match(r'^(.+?)!([A-Z]+\d+)(?::([A-Z]+\d+))?', entry)
        if not m:
            continue
        sheet, ref, ref2 = m.group(1), m.group(2), m.group(3)
        wanted.setdefault(sheet, set()).add(ref)
        if ref2:
            c1, r1 = re.match(r'([A-Z]+)(\d+)', ref).groups()
            c2, r2 = re.match(r'([A-Z]+)(\d+)', ref2).groups()
            for r in range(int(r1), int(r2) + 1):
                for c in range(col_num(c1), col_num(c2) + 1):
                    wanted[sheet].add('%s%d' % (num_col(c), r))
    return wanted


def wheel_ice_correction(intent):
    """Correct the Wheel saturation table's sub-zero rows to the ice branch.

    tools/fix_r6.py rewrote Wheel!BJ10:BT168 as formulas, but its BK/BL pair uses the *liquid water*
    coefficients for every row (fix_r6.py line ~186), so the sub-zero rows still return water-set
    pressures — at −39.5 °C that is 0.0201 kPa instead of the ice value 0.01359 kPa, i.e. exactly the
    error the fix was meant to remove (its own report claims 0.01359). Keeping the intent verbatim
    would ship that. This rewrites BK and BL of rows 11…168 with the ice/liquid split the app engine
    uses (< 273.16 K → ice coefficients), which yields the reported numbers.
    """
    wheel = intent.get('Wheel')
    if not wheel:
        return 0
    fixed = 0
    for r in range(11, 169):
        bk, bl = 'BK%d' % r, 'BL%d' % r
        if bk in wheel:
            wheel[bk] = ['formula',
                         'IF(BJ{r}<273.16,-5674.5359/BJ{r}+6.3925247-0.009677843*BJ{r},'
                         '-5800.2206/BJ{r}+1.3914993-0.048640239*BJ{r})'.format(r=r),
                         wheel[bk][2]]
            fixed += 1
        if bl in wheel:
            wheel[bl] = ['formula',
                         'IF(BJ{r}<273.16,0.00000062215701*POWER(BJ{r},2)'
                         '+0.0000000020747825*POWER(BJ{r},3)'
                         '-0.000000000000948402*POWER(BJ{r},4)+4.1635019*LN(BJ{r}),'
                         '0.000041764768*POWER(BJ{r},2)-0.000000014452093*POWER(BJ{r},3)'
                         '+6.5459673*LN(BJ{r}))'.format(r=r),
                         wheel[bl][2]]
            fixed += 1
    return fixed


def plan():
    """sheet -> {ref: ('formula'|'label', payload, style)} — from the JSON intent, else from R6."""
    if os.path.exists(INTENT):
        raw = json.load(io.open(INTENT, encoding='utf-8'))
        for sheet, cells in raw.items():
            for ref, v in cells.items():
                cells[ref] = list(v)
        fixed = wheel_ice_correction(raw)
        if fixed:
            print('applied the ice-branch correction to %d Wheel saturation cells' % fixed)
        return raw, sum(len(v) for v in raw.values())
    intent = extract_intent()
    wheel_ice_correction(intent)
    return intent, sum(len(v) for v in intent.values())


def apply_patch(xml, patch):
    """Rewrite the listed cells in a worksheet XML. Returns (new xml, applied, inserted, missing)."""
    present = {m.group(1) for m in CELL.finditer(xml)}
    applied = inserted = 0

    def repl(m):
        nonlocal applied
        ref, attrs, inner = m.group(1), m.group(2), m.group(3) or ''
        item = patch.get(ref)
        if item is None:
            return m.group(0)
        applied += 1
        kind, payload = item[0], item[1]
        attrs = re.sub(r'\s+t="[^"]*"', '', attrs)
        if kind == 'label':
            return ('<c r="%s"%s t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>'
                    % (ref, attrs, xml_escape(payload)))
        body = FORMULA.sub('', inner, count=1)
        body = re.sub(r'<v>.*?</v>', '', body, flags=re.S)
        return '<c r="%s"%s><f>%s</f>%s</c>' % (ref, attrs, xml_escape(payload), body)

    new_xml = CELL.sub(repl, xml)

    # cells the patch wants that the sheet does not contain yet: insert into sheetData in order
    todo = [ref for ref in patch if ref not in present]
    if todo:
        todo.sort(key=lambda r: (int(re.match(r'[A-Z]+(\d+)', r).group(1)), col_num(re.match(r'([A-Z]+)', r).group(1))))
        for ref in todo:
            kind, payload = patch[ref][0], patch[ref][1]
            if kind == 'label':
                el = ('<c r="%s" t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>'
                      % (ref, xml_escape(payload)))
            else:
                el = '<c r="%s"><f>%s</f></c>' % (ref, xml_escape(payload))
            row = int(re.match(r'[A-Z]+(\d+)', ref).group(1))
            inserted += 1
            m = re.search(r'(<row[^>]*\br="%d"[^>]*>)(.*?)(</row>)' % row, new_xml, re.S)
            if m:
                # place inside the row, ordered by column
                cells = list(CELL.finditer(m.group(2)))
                pos = len(m.group(2))
                for cm in cells:
                    if col_num(re.match(r'([A-Z]+)', cm.group(1)).group(1)) > col_num(re.match(r'([A-Z]+)', ref).group(1)):
                        pos = cm.start()
                        break
                inner = m.group(2)
                new_inner = inner[:pos] + el + inner[pos:]
                new_xml = new_xml[:m.start(2)] + new_inner + new_xml[m.end(2):]
            else:
                row_el = '<row r="%d">%s</row>' % (row, el)
                m2 = re.search(r'<sheetData\s*/>', new_xml)
                if m2:
                    new_xml = new_xml[:m2.start()] + '<sheetData>' + row_el + '</sheetData>' + new_xml[m2.end():]
                else:
                    rows = list(re.finditer(r'<row[^>]*\br="(\d+)"', new_xml))
                    pos = len(new_xml)
                    for rm in rows:
                        if int(rm.group(1)) > row:
                            pos = rm.start()
                            break
                    else:
                        pos = new_xml.rindex('</sheetData>')
                    new_xml = new_xml[:pos] + row_el + new_xml[pos:]
    return new_xml, applied, inserted, len(todo)


def main():
    args = sys.argv[1:]
    if '--check' in args:
        return check(args[args.index('--check') + 1])
    out = R6.replace('R6.xlsm', 'R6_lossless.xlsm')
    if '--out' in args:
        out = args[args.index('--out') + 1]
    dry = '--dry-run' in args

    patch, wanted = plan()
    print('changelog requests %d cells' % wanted)
    z5 = zipfile.ZipFile(R5)
    parts5 = sheet_parts(z5)
    total_applied = total_inserted = 0
    new_sheets = {}
    for sheet, cells in sorted(patch.items()):
        part = parts5.get(sheet)
        if part is None:
            print('  ! sheet missing in R5: %s' % sheet)
            continue
        xml = z5.read(part).decode('utf-8', 'ignore')
        new_xml, applied, inserted, missing = apply_patch(xml, cells)
        total_applied += applied
        total_inserted += inserted
        new_sheets[part] = new_xml
        print('  %-24s planned %5d  applied %5d  inserted %4d  not found %4d'
              % (sheet, len(cells), applied, inserted, missing - inserted))
    print('total rewritten: %d applied + %d inserted = %d cells in %d sheets'
          % (total_applied, total_inserted, total_applied + total_inserted, len(new_sheets)))

    if dry:
        print('(dry run — nothing written)')
        return 0

    wb = z5.read('xl/workbook.xml').decode('utf-8', 'ignore')
    wb = (re.sub(r'<calcPr[^>]*/>', '<calcPr calcId="191029" fullCalcOnLoad="1"/>', wb)
          if '<calcPr' in wb else
          wb.replace('</workbook>', '<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>'))

    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zo:
        for item in z5.infolist():
            if item.filename == 'xl/calcChain.xml':
                continue
            data = (wb.encode('utf-8') if item.filename == 'xl/workbook.xml'
                    else new_sheets[item.filename].encode('utf-8') if item.filename in new_sheets
                    else z5.read(item.filename))
            zo.writestr(item, data)

    # Guard: a stored formula must not carry a leading '=' (the XML <f> holds the bare expression),
    # and every sheet must still parse as XML.
    import xml.etree.ElementTree as ET
    bad = []
    zc = zipfile.ZipFile(out)
    for part in new_sheets:
        xml = zc.read(part).decode('utf-8')
        try:
            ET.fromstring(xml)
        except ET.ParseError as e:
            bad.append('%s: XML not well-formed (%s)' % (part, e))
        if re.search(r'<f[^>]*>=', xml):
            bad.append('%s: formula starting with "="' % part)
    if bad:
        print('\n!! generated workbook has problems:')
        for b in bad[:10]:
            print('   -', b)
        return 1
    print('wrote %s (all other parts copied byte-for-byte; XML validated)' % os.path.basename(out))
    return 0


def check(out):
    """Cell-level comparison of a patched file against the openpyxl R6 intent."""
    z5, z6, zo = zipfile.ZipFile(R5), zipfile.ZipFile(R6), zipfile.ZipFile(out)
    p5, p6, po = sheet_parts(z5), sheet_parts(z6), sheet_parts(zo)
    lost = set(z5.namelist()) - set(zo.namelist())
    print('parts lost vs R5 (expect only calcChain.xml): %s' % (sorted(lost) or 'none'))
    same = diff = 0
    mismatched = []
    for sheet, part in po.items():
        if part not in p6:
            continue
        a = parse_cells(zo.read(part).decode('utf-8', 'ignore'))
        b = parse_cells(z6.read(part).decode('utf-8', 'ignore'))
        for ref, mb in b.items():
            fa, fb = formula_text(a[ref].group(3) or '') if ref in a else None, formula_text(mb.group(3) or '')
            if fb is None:
                continue
            if fa == fb:
                same += 1
            else:
                diff += 1
                if len(mismatched) < 10:
                    mismatched.append('%s!%s' % (sheet, ref))
    print('formula cells holding the R6 intent: %d ; still differing: %d %s'
          % (same, diff, mismatched))
    print('drawing parts preserved: %d (R5 has %d)'
          % (len([n for n in zo.namelist() if n.startswith('xl/drawings/drawing')]),
             len([n for n in z5.namelist() if n.startswith('xl/drawings/drawing')])))
    print('media preserved: %s' % sorted(n for n in zo.namelist() if n.startswith('xl/media/')))
    ok = not (set(z5.namelist()) - set(zo.namelist()) - {'xl/calcChain.xml'})
    print('\nVERDICT: %s' % ('lossless (only intended cells differ)' if ok else 'parts missing!'))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
