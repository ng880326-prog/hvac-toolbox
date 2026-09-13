"""Gap audit for the remaining single-sheet pages.

For each workbook sheet that maps to an app module, this prints the sheet's labels and then checks how
many distinctive keywords from those labels appear in the module's source. A low score means the page
is missing content the workbook carries; a high score means the app already covers it.

Usage: python tools/gap_audit.py [sheetFile module] ...
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

LINE = re.compile(r'^([A-Z]+)(\d+)\s+\|\s+t=(\S*)\s+\|\s+F:\s?(.*?)\s+\|\s+V:\s?(.*)$')

PAIRS = [
    ('20_Motor', 'app/js/modules/motor.js'),
    ('21_Acoustics', 'app/js/modules/acoustics.js'),
    ('24_Hx', 'app/js/modules/hx.js'),
    ('29_Insulations', 'app/js/modules/insulation.js'),
    ('30_PN', 'app/js/modules/pn.js'),
    ('31_NPSH', 'app/js/modules/npsh.js'),
    ('32_SPF_PRC_', 'app/js/modules/stairwell.js'),
    ('33_Website', 'app/js/modules/webtools.js'),
    ('34_Supplier', 'app/js/modules/webtools.js'),
]

# words that carry meaning in these sheets; the audit counts how many the module already mentions
STOP = {'mm', 'kW', 'm2', 'L/s', 'oC', 'kg', 'the', 'and', 'for', 'per', 'No.', 'Nos.', 'Type', 'mm)'}


def labels(path):
    out = []
    for line in io.open(path, encoding='utf-8', errors='ignore'):
        m = LINE.match(line.rstrip('\n'))
        if not m:
            continue
        v = (m.group(5) or '').strip()
        if v and not v.startswith('=') and m.group(3) in ('s', 'str') and len(v) > 2:
            out.append((m.group(1) + m.group(2), v))
    return out


def keywords(items):
    words = set()
    for _ref, text in items:
        for w in re.findall(r"[A-Za-z][A-Za-z./\-]{2,}", text):
            w = w.strip('.-/')
            if len(w) > 2 and w not in STOP:
                words.add(w)
    return sorted(words)


def main():
    targets = PAIRS
    if len(sys.argv) >= 3:
        targets = [(sys.argv[1], sys.argv[2])]
    print('%-16s %-34s %6s %6s %6s  %s' % ('sheet', 'module', 'labels', 'words', 'found', 'missing keywords'))
    for sheet, module in targets:
        path = os.path.join('analysis', 'sheets', sheet + '.txt')
        if not os.path.exists(path):
            print('%-16s %-34s  (no dump)' % (sheet, module))
            continue
        items = labels(path)
        words = keywords(items)
        src = io.open(module, encoding='utf-8').read()
        low = src.lower()
        found = [w for w in words if w.lower() in low]
        missing = [w for w in words if w.lower() not in low]
        print('%-16s %-34s %6d %6d %6d  %s'
              % (sheet, os.path.basename(module), len(items), len(words), len(found),
                 ', '.join(missing[:12])))


if __name__ == '__main__':
    main()
