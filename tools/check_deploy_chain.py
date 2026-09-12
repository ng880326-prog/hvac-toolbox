"""Report the deployment chain: which tree is actually served/packaged, and where copies drift."""
import io
import os
import re

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def head(path, n=18):
    try:
        return '\n'.join(io.open(path, encoding='utf-8', errors='ignore').read().splitlines()[:n])
    except OSError:
        return '(missing)'


print('=== root files ===')
for n in sorted(os.listdir('.')):
    if os.path.isfile(n):
        print('  %-34s %8d B' % (n, os.path.getsize(n)))

print('\n=== root index.html (first lines) ===')
print(head('index.html', 12))

print('\n=== root sw.js (first lines) ===')
print(head('sw.js', 10))

print('\n=== .github/workflows ===')
for base, _d, names in os.walk('.github'):
    for n in names:
        p = os.path.join(base, n)
        print('--- %s ---' % p)
        print(head(p, 40))

print('\n=== packaging / build scripts ===')
for base, dirs, names in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '.npm-cache')]
    for n in names:
        if re.search(r'(pack|deploy|build|ship|release|zip|sync)', n, re.I) and n.endswith(('.ps1', '.py', '.bat', '.mjs', '.js', '.yml')):
            print('  ' + os.path.join(base, n))

print('\n=== android build script: does it sync web assets first? ===')
p = 'android/build_android.ps1'
if os.path.exists(p):
    for i, line in enumerate(io.open(p, encoding='utf-8', errors='ignore').read().splitlines(), 1):
        if re.search(r'cap\s|capacitor|sync|copy|Copy-Item|gradlew', line, re.I):
            print('  %4d %s' % (i, line.strip()[:110]))

print('\n=== package.json scripts ===')
print(head('package.json', 30))
