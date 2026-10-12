#!/usr/bin/env python3
"""Inline css + js into dist/dryrun.html (single file)."""
import re, os
root = os.path.join(os.path.dirname(__file__), '..')
html = open(os.path.join(root, 'index.html'), encoding='utf8').read()
def css(m): return '<style>\n' + open(os.path.join(root, m.group(1)), encoding='utf8').read() + '\n</style>'
def js(m): return '<script>\n' + open(os.path.join(root, m.group(1)), encoding='utf8').read().replace('</script', '<\\/script') + '\n</script>'
html = re.sub(r'<link rel="stylesheet" href="((?!http)[^"]+)">', css, html)
html = re.sub(r'<script src="((?!http)[^"]+)"></script>', js, html)
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
out = os.path.join(root, 'dist', 'dryrun.html'); open(out, 'w', encoding='utf8').write(html)
print(out, len(html) // 1024, 'KB; leftover local refs:', re.findall(r'(?:src|href)="(?!http|#|data:)[^"]*\.(?:js|css)"', html))
