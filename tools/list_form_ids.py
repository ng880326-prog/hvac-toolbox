"""List every form([...]) call in a module with its field keys, to find duplicated DOM ids.

field() names inputs 'f-<key>', so two forms in the same rendered page that share a key emit duplicate
ids. This tool reports those collisions per module so they can be namespaced via form(specs, cb, grid, prefix).
"""
import io
import os
import re
import sys

MODULES = os.path.join('app', 'js', 'modules')
KEY = re.compile(r"key:\s*'([A-Za-z0-9_]+)'")


def forms_of(path):
    text = io.open(path, encoding='utf-8').read()
    lines = text.splitlines()
    out = []
    for i, line in enumerate(lines):
        if not re.search(r'(^|[^A-Za-z_.])form\(\[', line):
            continue
        depth = 0
        keys = []
        grid = None
        prefix = None
        for j in range(i, min(i + 80, len(lines))):
            seg = lines[j]
            depth += seg.count('[') - seg.count(']')
            keys += KEY.findall(seg)
            if depth <= 0:
                # the closing line usually carries the callback and grid class
                tail = '\n'.join(lines[j:min(j + 3, len(lines))])
                gm = re.search(r"'(grid[1-4])'", tail)
                grid = gm.group(1) if gm else 'grid2'
                pm = re.search(r"'(grid[1-4])',\s*'([^']+)'", tail)
                prefix = pm.group(2) if pm else None
                break
        out.append({'line': i + 1, 'keys': keys, 'grid': grid, 'prefix': prefix})
    return out


def main():
    targets = sys.argv[1:] or sorted(f for f in os.listdir(MODULES) if f.endswith('.js'))
    total = 0
    for name in targets:
        path = os.path.join(MODULES, name)
        if not os.path.exists(path):
            continue
        forms = forms_of(path)
        seen = {}
        dupes = []
        for f in forms:
            for k in f['keys']:
                if k in seen:
                    dupes.append((k, seen[k], f['line']))
                else:
                    seen[k] = f['line']
        if not dupes:
            continue
        print('%s' % name)
        for f in forms:
            print('  line %-4d %-6s prefix=%-10s keys=%s' % (
                f['line'], f['grid'], f['prefix'] or '-', ', '.join(f['keys'])))
        print('  DUPLICATES: %s' % ', '.join('%s (lines %d/%d)' % d for d in dupes))
        total += len(dupes)
    print('\ntotal duplicated keys: %d' % total)
    return 0


if __name__ == '__main__':
    sys.exit(main())
