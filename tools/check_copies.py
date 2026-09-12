"""Audit stale duplicate asset trees.

After the psychrometric ice-branch fix, three copies of the engine outside app/ still carried the
broken Hyland-Wexler coefficient. This script reports, for each candidate tree, whether it is a
tracked build artifact, what references it, and how far it has drifted from app/.
"""
import hashlib
import io
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

TREES = ['js', 'dist', 'android/app/src/main/assets/public', 'app']


def tracked_count(path):
    try:
        out = subprocess.run(['git', 'ls-files', path], capture_output=True, text=True,
                             encoding='utf-8', errors='ignore')
        return len([l for l in out.stdout.splitlines() if l.strip()])
    except Exception:
        return -1


def scan_tree(path):
    files = 0
    total = 0
    for base, _dirs, names in os.walk(path):
        for n in names:
            f = os.path.join(base, n)
            files += 1
            try:
                total += os.path.getsize(f)
            except OSError:
                pass
    return files, round(total / 1048576.0, 2)


def digest(path):
    try:
        with open(path, 'rb') as fh:
            return hashlib.sha256(fh.read()).hexdigest()[:12]
    except OSError:
        return None


def main():
    print('=== .gitignore ===')
    if os.path.exists('.gitignore'):
        print(io.open('.gitignore', encoding='utf-8').read().strip())
    else:
        print('(no .gitignore)')

    print('\n=== candidate trees ===')
    for t in TREES:
        if os.path.isdir(t):
            files, mb = scan_tree(t)
            print('%-38s files=%-6d tracked=%-6d %s MB' % (t, files, tracked_count(t), mb))
        else:
            print('%-38s (missing)' % t)

    print('\n=== engine copy drift (psychro.js) ===')
    canon = 'app/js/engine/psychro.js'
    print('%-52s %s' % (canon, digest(canon)))
    for t in ['js', 'dist/hvac-toolbox-site', 'android/app/src/main/assets/public']:
        p = os.path.join(t, 'js/engine/psychro.js')
        if os.path.exists(p):
            same = digest(p) == digest(canon)
            print('%-52s %s  %s' % (p, digest(p), 'same' if same else 'DRIFTED'))

    print('\n=== who references a bare js/ path (outside app/) ===')
    pat = re.compile(r'["\'"(]\.?/js/')
    for base, dirs, names in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '.npm-cache')]
        if os.path.join('app', 'js') in base or base.rstrip(os.sep).endswith('app/js'):
            continue
        for n in names:
            if not n.endswith(('.html', '.json', '.js', '.mjs', '.yml', '.bat', '.ps1')):
                continue
            p = os.path.join(base, n)
            if any(seg in p for seg in ('app' + os.sep + 'js', 'dist' + os.sep, 'android' + os.sep)):
                continue
            try:
                c = io.open(p, encoding='utf-8', errors='ignore').read()
            except OSError:
                continue
            for i, line in enumerate(c.splitlines(), 1):
                if pat.search(line):
                    print('%-52s %4d %s' % (p[:52], i, line.strip()[:78]))

    print('\n=== gitignore coverage check ===')
    for t in ['js/engine/psychro.js', 'dist/hvac-toolbox-site/index.html',
              'android/app/src/main/assets/public/index.html']:
        if os.path.exists(t):
            r = subprocess.run(['git', 'check-ignore', '-v', t], capture_output=True, text=True,
                               encoding='utf-8', errors='ignore')
            print('%-56s %s' % (t, (r.stdout.strip() or 'NOT IGNORED -> committed')))


if __name__ == '__main__':
    main()
