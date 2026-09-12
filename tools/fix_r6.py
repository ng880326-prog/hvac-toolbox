# HVAC Toolbox — build the *intent* workbook for the R6 fixes (docs/verification/psychro_air.md §D).
#
# NOTE: this openpyxl route is NOT the file to ship. Measured by tools/verify_r6_fidelity.py it drops
# the <controls> element of 21 sheets (the form buttons), the drawing of 16 sheets, 33 drawing parts,
# 22 printer settings, 3 chart .rels and one embedded image. It is kept because it is a convenient way
# to compute the fixed formula text: its output is written to tools/R6_openpyxl_intent.xlsm, from which
# tools/patch_workbook_min.py extracts tools/r6_formula_intent.json and rebuilds the real deliverable
# 00_HVAC Toolbox_R6.xlsm without touching any other part of the workbook.
import re
import shutil
import json
import sys
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / '00_HVAC Toolbox_R5.xlsm'
DST = ROOT / 'tools' / 'R6_openpyxl_intent.xlsm'
LOG = ROOT / 'tools' / 'r6_changes.log'

TARGET_SHEETS = ['Supporting 1', 'Supporting 2', 'Supporting 2.1', 'Supporting 3',
                 'Supporting 3.1', 'Supporting 4', 'Supporting 4.1', 'Supproting 5',
                 'Supporting 5.1', 'Supporting 6', 'Supporting 6.1', 'Wheel', 'Wheel Support']

RE_EXP = re.compile(
    r'^EXP\(-5800\.2206/(.+?)\+1\.3914993-0\.048640239\*(.+?)\+0\.000041764768\*POWER\((.+?),2\)'
    r'-0\.000000014452093\*POWER\((.+?),3\)\+6\.5459673\*LN\((.+?)\)\)/1000$')
RE_S1 = re.compile(r'^-5800\.2206/(\$?[A-Z]{1,3}\$?\d+)\+1\.3914993-0\.048640239\*(\$?[A-Z]{1,3}\$?\d+)$')
RE_S2 = re.compile(
    r'^0\.000041764768\*POWER\((\$?[A-Z]{1,3}\$?\d+),2\)-0\.000000014452093\*POWER\((\$?[A-Z]{1,3}\$?\d+),3\)'
    r'\+6\.5459673\*LN\((\$?[A-Z]{1,3}\$?\d+)\)$')
RE_J = re.compile(
    r'^(\$?[A-Z]{1,3}\$?\d+)-\((\$?[A-Z]{1,3}\$?\d+)-(\$?[A-Z]{1,3}\$?\d+)\)'
    r'\*(\$?[A-Z]{1,3}\$?\d+)/\((\$?[A-Z]{1,3}\$?\d+)-(\$?[A-Z]{1,3}\$?\d+)\)$')
RE_TDP = re.compile(r'6\.54\+14\.526\*LN\((\$?[A-Z]{1,3}\$?\d+)\)')


def _normk(s: str) -> str:
    s = s.strip()
    while s.startswith('(') and s.endswith(')') and s.count('(') == 1:
        s = s[1:-1].strip()
    return s


def transform(f: str) -> str:
    m = RE_EXP.match(f)
    if m and len({_normk(g) for g in m.groups()}) == 1:
        K = _normk(m.group(1))
        ice = (f"EXP(-5674.5359/{K}+6.3925247-0.009677843*{K}"
               f"+0.00000062215701*POWER({K},2)+0.0000000020747825*POWER({K},3)"
               f"-0.000000000000948402*POWER({K},4)+4.1635019*LN({K}))/1000")
        return f"IF({K}<273.16,{ice},{f})"
    m = RE_S1.match(f)
    if m and m.group(1) == m.group(2):
        K = m.group(1)
        return f"IF({K}<273.16,-5674.5359/{K}+6.3925247-0.009677843*{K},{f})"
    m = RE_S2.match(f)
    if m and m.group(1) == m.group(2) == m.group(3):
        K = m.group(1)
        return (f"IF({K}<273.16,0.00000062215701*POWER({K},2)+0.0000000020747825*POWER({K},3)"
                f"-0.000000000000948402*POWER({K},4)+4.1635019*LN({K}),{f})")
    m = RE_TDP.search(f)
    if m:
        X = m.group(1)
        tdp = (f"6.54+14.526*LN({X})+0.7389*POWER(LN({X}),2)+0.09486*POWER(LN({X}),3)"
               f"+0.4569*POWER({X},0.1984)")
        if tdp in f:
            return f.replace(tdp, f'IF({X}<0.6112,"n/a (<0C)",{tdp})')
    m = RE_J.match(f)
    if m:
        # groups: 1=Tk, 4=H(before /(), 5=H(after /(), 6=I  ->  guard H=I -> return Tk
        C, H, I = m.group(1), m.group(5), m.group(6)
        return f"IF({H}={I},{C},{f})"
    return f


def _normalise_vml(path: Path) -> None:
    """Rewrite the zip with self-closing <br>/<hr> in xl/drawings/vmlDrawing*.vml."""
    import zipfile
    import io
    VOID = re.compile(r'<(br|hr)\s*>')
    tmp = path.with_suffix('.tmp.zip')
    with zipfile.ZipFile(path, 'r') as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if 'drawings/vmlDrawing' in item.filename and item.filename.endswith('.vml'):
                data = VOID.sub(lambda m: f'<{m.group(1)}/>', data.decode('utf-8', 'replace')).encode('utf-8')
            zout.writestr(item, data)
    tmp.replace(path)


def main():
    if DST.exists():
        DST.unlink()
    shutil.copy2(SRC, DST)

    # The R5 workbook ships VML comment drawings with unclosed <br> tags that lxml rejects when
    # openpyxl re-serialises comments. Normalise void tags in-place inside the zip so comments
    # survive the round-trip.
    _normalise_vml(DST)

    wb = load_workbook(DST, keep_vba=True, data_only=False)
    changes = []

    # 1) generic pws / tdp / secant guards
    per_sheet = {}
    for sn in TARGET_SHEETS:
        ws = wb[sn]
        n = 0
        for row in ws.iter_rows():
            for cell in row:
                v = cell.value
                if isinstance(v, str) and v.startswith('='):
                    body = v[1:]
                    new = transform(body)
                    if new != body:
                        cell.value = '=' + new
                        changes.append(f"{sn}!{cell.coordinate}")
                        n += 1
        per_sheet[sn] = n
        print(f"{sn}: {n} cells rewritten")

    # 2) Air-side: viscosity + label
    wsa = wb['Air-side']
    assert '18.474' in str(wsa['AS5'].value), f"unexpected AS5: {wsa['AS5'].value}"
    wsa['AS5'] = '=18.94*10^-6'
    assert 'pi x a x b x 4' in str(wsa['BP10'].value), f"unexpected BP10: {wsa['BP10'].value}"
    wsa['BP10'] = 'pi x a x b'
    changes += ['Air-side!AS5', 'Air-side!BP10']

    # 3) Supporting 6: pickers + guards
    ws6 = wb['Supporting 6']
    for ref in ('A10', 'C10'):
        assert isinstance(ws6[ref].value, str) and '0.000005' in ws6[ref].value, \
            f"unexpected old picker at {ref}: {ws6[ref].value}"
    for ref in ('A19', 'C19'):
        assert isinstance(ws6[ref].value, str) and '0.00005' in ws6[ref].value, \
            f"unexpected old picker at {ref}: {ws6[ref].value}"
    q = "'Psychrometric Chart'"
    s61 = "'Supporting 6.1'"
    ws6['A10'] = (f"=IF({q}!$C$12<=0,\"n/a (RH>0 required)\","
                  f"IF(ABS({s61}!$I21-{s61}!$H21)<0.00005,{s61}!$J21,"
                  f"IF(ABS({s61}!$I22-{s61}!$H22)<0.00005,{s61}!$J22,"
                  f"IF(ABS({s61}!$I23-{s61}!$H23)<0.00005,{s61}!$J23,"
                  f"IF(ABS({s61}!$I24-{s61}!$H24)<0.00005,{s61}!$J24,"
                  f"IF(ABS({s61}!$I25-{s61}!$H25)<0.00005,{s61}!$J25,"
                  f"IF(ABS({s61}!$I26-{s61}!$H26)<0.005,{s61}!$J26,"
                  f"IF(ABS({s61}!$I27-{s61}!$H27)<0.05,{s61}!$J27,{s61}!$J27))))))))")
    ws6['C10'] = (f"=IF({q}!$D$12<=0,\"n/a (RH>0 required)\","
                  f"IF(ABS({s61}!$I64-{s61}!$H64)<0.00005,{s61}!$J64,"
                  f"IF(ABS({s61}!$I65-{s61}!$H65)<0.00005,{s61}!$J65,"
                  f"IF(ABS({s61}!$I66-{s61}!$H66)<0.00005,{s61}!$J66,"
                  f"IF(ABS({s61}!$I67-{s61}!$H67)<0.00005,{s61}!$J67,"
                  f"IF(ABS({s61}!$I68-{s61}!$H68)<0.00005,{s61}!$J68,"
                  f"IF(ABS({s61}!$I69-{s61}!$H69)<0.005,{s61}!$J69,"
                  f"IF(ABS({s61}!$I70-{s61}!$H70)<0.05,{s61}!$J70,{s61}!$J70))))))))")
    ws6['A19'] = (f"=IF({q}!$C$12<=0,\"n/a\",IF({s61}!$H41=0,{s61}!$J44,"
                  f"IF(ABS({s61}!$I45-{s61}!$H45)<0.00005,{s61}!$J45,"
                  f"IF(ABS({s61}!$I46-{s61}!$H46)<0.00005,{s61}!$J46,"
                  f"IF(ABS({s61}!$I47-{s61}!$H47)<0.00005,{s61}!$J47,"
                  f"IF(ABS({s61}!$I48-{s61}!$H48)<0.00005,{s61}!$J48,"
                  f"IF(ABS({s61}!$I49-{s61}!$H49)<0.05,{s61}!$J49,"
                  f"IF(ABS({s61}!$I50-{s61}!$H50)<0.05,{s61}!$J50,{s61}!$J50))))))))")
    ws6['C19'] = (f"=IF({q}!$D$12<=0,\"n/a\",IF({s61}!$H74=0,{s61}!$J74,"
                  f"IF(ABS({s61}!$I77-{s61}!$H77)<0.00005,{s61}!$J77,"
                  f"IF(ABS({s61}!$I78-{s61}!$H78)<0.00005,{s61}!$J78,"
                  f"IF(ABS({s61}!$I79-{s61}!$H79)<0.00005,{s61}!$J79,"
                  f"IF(ABS({s61}!$I80-{s61}!$H80)<0.00005,{s61}!$J80,"
                  f"IF(ABS({s61}!$I81-{s61}!$H81)<0.05,{s61}!$J81,"
                  f"IF(ABS({s61}!$I82-{s61}!$H82)<0.05,{s61}!$J82,{s61}!$J82))))))))")
    for ref, tdb in (('A13', 'A10'), ('C13', 'C10'), ('A16', 'A10'), ('C16', 'C10')):
        old = ws6[ref].value
        assert isinstance(old, str) and old.startswith('='), f"unexpected {ref}: {old}"
        ws6[ref] = f"=IF(ISNUMBER({tdb}),{old[1:]},\"-\")"
        changes.append(f"Supporting 6!{ref}")
    changes += ['Supporting 6!A10', 'Supporting 6!C10', 'Supporting 6!A19', 'Supporting 6!C19']

    # 4) Wheel saturated table BJ10:BT168: formula-ize static sub-zero rows; BS = T (exact at saturation)
    wsw = wb['Wheel']
    nrow = 0
    for r in range(10, 169):
        bh = wsw.cell(row=r, column=60).value  # BH
        if bh is None:
            continue
        nrow += 1
        if r == 10:
            wsw.cell(row=r, column=71).value = f"=IF(BH{r}+BI{r}>0,BH{r},0)"  # BS
        else:
            wsw.cell(row=r, column=62).value = f"=273.15+BH{r}"               # BJ
            wsw.cell(row=r, column=63).value = f"=-5800.2206/BJ{r}+1.3914993-0.048640239*BJ{r}"  # BK
            wsw.cell(row=r, column=64).value = (f"=0.000041764768*POWER(BJ{r},2)"
                                                f"-0.000000014452093*POWER(BJ{r},3)+6.5459673*LN(BJ{r})")  # BL
            wsw.cell(row=r, column=65).value = f"=EXP(BK{r}+BL{r})/1000"      # BM
            wsw.cell(row=r, column=66).value = f"=BI{r}/100*BM{r}"            # BN
            wsw.cell(row=r, column=67).value = f"=0.62198*(BM{r}/($G$3-BM{r}))"  # BO
            wsw.cell(row=r, column=68).value = f"=BT{r}/BO{r}"                # BP
            wsw.cell(row=r, column=69).value = f"=0.2871*(BH{r}+273.15)*(1+1.6078*BT{r})/$G$3"  # BQ
            wsw.cell(row=r, column=70).value = f"=IF(BH{r}+BI{r}>0,(1.006*BH{r}+BT{r}*(2501+1.805*BH{r})),0)"  # BR
            wsw.cell(row=r, column=71).value = f"=IF(BH{r}+BI{r}>0,BH{r},0)"  # BS
            wsw.cell(row=r, column=72).value = f"=IF(BH{r}+BI{r}>0,0.62198*(BN{r}/($G$3-BN{r})),0)"  # BT
    changes.append(f"Wheel!BJ10:BT168 ({nrow} rows)")

    wb.save(DST)
    wb.close()
    LOG.write_text(json.dumps({'changed_cells': changes, 'per_sheet': per_sheet}, indent=2),
                   encoding='utf-8')
    print(f"total changed cells: {len(changes)}")
    print(f"log: {LOG}")


if __name__ == '__main__':
    sys.exit(main())
