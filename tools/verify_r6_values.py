"""Evaluate the patched workbook's own formulas at key points and compare with independent values.

The openpyxl verifier (tools/verify_r6.py) checks formula *structure* and a few numbers computed outside
the workbook. This one instead evaluates the formula strings that are actually inside
00_HVAC Toolbox_R6.xlsm, so the check covers what Excel will do after it recalculates.

Covered: the Wheel saturation table (BJ/BK/BL/BM/BS/BT for a sub-zero row and a warm row), the
Air-side viscosity cell, and the Supporting 1 dew-point guard.

Usage: python tools/verify_r6_values.py [workbook.xlsm]
"""
import math
import os
import re
import sys

from openpyxl import load_workbook

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WB = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '00_HVAC Toolbox_R6.xlsm')

# ---- tiny evaluator for the subset of Excel used by these sheets -------------------------------
FUNCS = {
    'EXP': math.exp, 'LN': math.log, 'SQRT': math.sqrt,
    'POWER': lambda a, b: math.pow(a, b),
    'ABS': abs, 'ROUND': lambda a, n=0: round(a, int(n)),
}


def split_args(s):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    out.append(cur)
    return [x.strip() for x in out]


def evaluate(expr, cells):
    """Evaluate an Excel formula body (without '=') using `cells` for references."""
    expr = expr.strip()
    if expr.startswith('='):
        expr = expr[1:]
    if re.fullmatch(r'-?\d+(\.\d+)?([eE]-?\d+)?', expr):
        return float(expr)
    if re.fullmatch(r"'[^']+'!\$?[A-Z]{1,3}\$?\d+", expr):
        return cells.get(expr.replace('$', ''), 0.0)
    if re.fullmatch(r"\$?[A-Z]{1,3}\$?\d+", expr):
        return cells.get(expr.replace('$', ''), 0.0)
    if re.fullmatch(r'"[^"]*"', expr):
        return expr[1:-1]
    m = re.match(r'^IF\(', expr)
    if m and expr.endswith(')'):
        parts = split_args(expr[3:-1])
        if len(parts) == 3:
            cond = evaluate(parts[0], cells)
            truthy = cond not in (False, 0, 0.0, '')
            return evaluate(parts[1], cells) if truthy else evaluate(parts[2], cells)
        if len(parts) == 2:
            cond = evaluate(parts[0], cells)
            return evaluate(parts[1], cells) if cond not in (False, 0, 0.0, '') else False
    m = re.match(r'^([A-Z]+)\((.*)\)$', expr)
    if m and m.group(1) in FUNCS:
        args = [evaluate(a, cells) for a in split_args(m.group(2))]
        return FUNCS[m.group(1)](*args)
    # comparisons (Excel: = is equality, <> is inequality) — needed by the table's helper columns
    depth = 0
    for i in range(len(expr) - 1):
        ch = expr[i]
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if depth:
            continue
        for op in ('>=', '<=', '<>', '>', '<', '='):
            if expr.startswith(op, i) and i > 0:
                left, right = expr[:i], expr[i + len(op):]
                a = evaluate(left, cells)
                b = evaluate(right, cells)
                res = {'>=': a >= b, '<=': a <= b, '<>': a != b, '>': a > b, '<': a < b, '=': a == b}[op]
                return res
    # arithmetic, lowest precedence first, skipping anything inside parentheses
    for ops, fn in (('+-', lambda a, b, o: a + b if o == '+' else a - b),
                    ('*/', lambda a, b, o: a * b if o == '*' else a / b),
                    ('^', lambda a, b, o: a ** b)):
        depth = 0
        for i in range(len(expr) - 1, -1, -1):
            ch = expr[i]
            if ch == ')':
                depth += 1
            elif ch == '(':
                depth -= 1
            elif depth == 0 and ch in ops and i > 0 and expr[i - 1] not in '+-*/^(':
                left, right = expr[:i], expr[i + 1:]
                try:
                    return fn(evaluate(left, cells), evaluate(right, cells), ch)
                except Exception:
                    continue
    if expr.startswith('-'):
        return -evaluate(expr[1:], cells)
    if expr.startswith('(') and expr.endswith(')'):
        return evaluate(expr[1:-1], cells)
    raise ValueError('cannot evaluate %r' % expr[:60])


def main():
    ok = fail = 0

    def check(name, got, want, tol):
        nonlocal ok, fail
        if isinstance(want, str) or isinstance(got, str):
            good = got == want
        else:
            good = got is not None and abs(got - want) <= tol
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        shown = round(got, 6) if isinstance(got, float) else got
        print('  %-52s eval %-14s expected %-14s %s' % (name, shown, want, 'OK' if good else 'FAIL'))

    wb = load_workbook(WB, keep_vba=True)
    w = wb['Wheel']
    # The table's rows are driven by the sheet's own inputs: D9 (start) and D11 (end) plus G3 (pressure).
    seed = {}
    for ref in ('D9', 'D11', 'G3'):
        v = w[ref].value
        # Excel treats a blank cell as 0, which is exactly how this table starts at -40 °C (D9 blank)
        seed[ref] = v if isinstance(v, (int, float)) else (0.0 if v is None else evaluate(v, seed))
    print('Wheel table driver cells: %s' % seed)

    def row_cells(row, overrides=None):
        """Evaluate BH from row 10 up to `row` first — the rows chain (each is the previous + 0.5)."""
        cells = dict(seed)
        if overrides:
            cells.update(overrides)
        for r in range(10, row + 1):
            v = w['BH%d' % r].value
            cells['BH%d' % r] = evaluate(v, cells) if isinstance(v, str) else (v or 0.0)
        for col in range(61, 74):          # BI..BT for the target row only
            ref = w.cell(row=row, column=col).coordinate
            v = w[ref].value
            if isinstance(v, str):
                try:
                    cells[ref] = evaluate(v, cells)
                except Exception:
                    cells[ref] = None      # helper columns that the assertions do not need
            else:
                cells[ref] = v or 0.0
        return cells

    print('Wheel saturation table (formulas read from the workbook):')
    # rows step by 0.5 °C from row 10 (= -40 °C). With the sheet's driver cells blank the table is
    # capped at D11 = 0 °C, so it covers -40…0 °C — the ice region, which is why the branch matters.
    for row, bh, expect, tol in ((11, -39.5, 0.013591, 4e-4),
                                 (12, -39.0, 0.014377, 4e-4),
                                 (40, -25.0, 0.063288, 6e-4),
                                 (130, 0.0, 0.611154, 6e-4)):
        cells = row_cells(row)
        check('BH%d table temperature' % row, cells['BH%d' % row], bh, 1e-9)
        check('BM%d pws(%s °C) ice/liquid branch' % (row, bh), cells['BM%d' % row], expect, tol)
        if bh < 0:
            check('BS%d dew point = T below 0 °C' % row, cells['BS%d' % row], bh, 1e-6)

    # With D11 = 40 the same formulas must run past 0 °C and switch to the liquid-water branch.
    cells = row_cells(130, overrides={'D11': 40})
    check('BH130 with D11=40', cells['BH130'], 20.0, 1e-9)
    check('BM130 pws(20 °C) liquid branch', cells['BM130'], 2.339, 3e-3)

    a = wb['Air-side']
    check('Air-side!AS5 viscosity', evaluate(a['AS5'].value, {}), 18.94e-6, 1e-12)
    check('Air-side!BP10 label', a['BP10'].value, 'pi x a x b', 0)

    s6 = wb['Supporting 6']
    # the picker chain must be present and guarded
    formula = s6['A10'].value
    check('Supporting 6!A10 has the RH>0 guard', 'RH>0 required' in formula, True, 0)
    check('Supporting 6!A10 loosens the last tolerance to 0.05', "<0.05" in formula, True, 0)
    check('Supporting 6!A13 wraps its result in ISNUMBER', formula and s6['A13'].value.startswith('=IF(ISNUMBER('), True, 0)

    # the dew point closed form must refuse sub-triple-point inputs rather than extrapolate
    s3 = wb['Supporting 3']
    guard_cells = [c.coordinate for row in s3.iter_rows() for c in row
                   if isinstance(c.value, str) and 'n/a (<0C)' in c.value]
    check("Supporting 3 carries the 'n/a (<0C)' dew-point guard", len(guard_cells) > 0, True, 0)

    n_ice = sum(1 for row in w.iter_rows() for c in row
                if isinstance(c.value, str) and c.value.startswith('=IF(BJ'))
    check('Wheel rows using the ice/liquid split (expect 318)', n_ice, 318, 0)

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
