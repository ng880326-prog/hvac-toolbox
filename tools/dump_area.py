"""Print a compact grid view of one region of an extracted Excel sheet.

The dumps in analysis/sheets/*.txt are one line per cell:

    AE3   | t=s          | F:  | V: DB (oC)
    AF7   | t=           | F: IF(...) | V: 0

Source of truth for "which region matters" is the sheet's Print_Area recorded in analysis/00_structure.txt
(e.g. Wheel!$B$2:$AC$45, Coil!$B$2:$BI$47). This tool renders that region so the app layout can be
compared cell by cell with the workbook instead of guessing from the whole 10k-cell sheet.

Usage:
    python tools/dump_area.py "05_Wheel" B2:AC45            values + formulas
    python tools/dump_area.py "05_Wheel" B2:AC45 --values   values only
    python tools/dump_area.py "22_Chiller" B2:AA60 --formulas
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINE = re.compile(r'^([A-Z]+)(\d+)\s+\|\s+t=(\S*)\s+\|\s+F:\s?(.*?)\s+\|\s+V:\s?(.*)$')


def col_to_num(letters):
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch) - 64)
    return n


def num_to_col(n):
    s = ''
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def split_range(spec):
    m = re.match(r'^([A-Z]+)(\d+):([A-Z]+)(\d+)$', spec.upper())
    if not m:
        raise SystemExit('range must look like B2:AC45')
    return int(m.group(2)), col_to_num(m.group(1)), int(m.group(4)), col_to_num(m.group(3))


def load(sheet):
    path = os.path.join(ROOT, 'analysis', 'sheets', sheet + '.txt')
    if not os.path.exists(path):
        cands = [f for f in os.listdir(os.path.join(ROOT, 'analysis', 'sheets')) if sheet.lower() in f.lower()]
        raise SystemExit('no dump for %r; candidates: %s' % (sheet, ', '.join(cands)))
    cells = {}
    for line in io.open(path, encoding='utf-8', errors='ignore'):
        m = LINE.match(line.rstrip('\n'))
        if not m:
            continue
        cells[(int(m.group(2)), col_to_num(m.group(1)))] = (m.group(4) or '', m.group(5) or '', m.group(3) or '')
    return cells, path


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    sheet, spec = sys.argv[1], sys.argv[2]
    flags = set(sys.argv[3:])
    want_values = '--formulas' not in flags
    want_formulas = '--values' not in flags
    r1, c1, r2, c2 = split_range(spec)
    cells, path = load(sheet)
    print('# %s  region %s  (%s)' % (sheet, spec, os.path.relpath(path, ROOT)))
    cells = {k: v for k, v in cells.items() if r1 <= k[0] <= r2 and c1 <= k[1] <= c2}
    if not cells:
        print('(region empty)')
        return

    if want_values:
        print('\n== VALUES ==')
        for r in range(r1, r2 + 1):
            parts = []
            for c in range(c1, c2 + 1):
                if (r, c) in cells:
                    _f, text, _t = cells[(r, c)]
                    if text.strip():
                        parts.append('%s:%s' % (num_to_col(c), text.strip()[:26]))
            if parts:
                print('r%-3d %s' % (r, ' | '.join(parts)))

    if '--labels' in flags:
        print('\n== LABELS (string cells in region, with their position) ==')
        for r in range(r1, r2 + 1):
            parts = []
            for c in range(c1, c2 + 1):
                cell = cells.get((r, c))
                if cell and cell[2] == 's' and cell[1].strip():
                    parts.append('%s:%s' % (num_to_col(c), cell[1].strip()[:34]))
            if parts:
                print('r%-3d %s' % (r, ' | '.join(parts)))

    if want_formulas:
        print('\n== FORMULAS (non-empty F) ==')
        for r in range(r1, r2 + 1):
            parts = []
            for c in range(c1, c2 + 1):
                if (r, c) in cells:
                    formula, _v, _t = cells[(r, c)]
                    if formula.strip():
                        parts.append('%s=%s' % (num_to_col(c), formula.strip()[:150]))
            if parts:
                print('r%-3d %s' % (r, ' | '.join(parts)))


if __name__ == '__main__':
    main()
