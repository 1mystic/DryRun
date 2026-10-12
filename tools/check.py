#!/usr/bin/env python3
"""Runs BOTH variants of every Python problem against its embedded test and checks track data.
usage: node tools/dump.js > /tmp/dr.json && python3 tools/check.py /tmp/dr.json [only-id ...]"""
import json, re, signal, sys, traceback

PRELUDE = '''
from typing import *
from collections import *
from heapq import *
from bisect import *
import heapq, bisect, collections, math, itertools, functools, random, string, re
class ListNode:
    def __init__(self, val=0, next=None): self.val = val; self.next = next
class TreeNode:
    def __init__(self, val=0, left=None, right=None): self.val = val; self.left = left; self.right = right
class Node:
    def __init__(self, val=0, *a, **k):
        self.val = val; self.next = None; self.random = None; self.neighbors = []
def L(a):
    d = ListNode(0); c = d
    for x in a: c.next = ListNode(x); c = c.next
    return d.next
def LL(h):
    r = []
    while h: r.append(h.val); h = h.next
    return r
def T(a):
    if not a or a[0] is None: return None
    ns = [None if v is None else TreeNode(v) for v in a]; q = [ns[0]]; j = 1
    for n in q:
        if j < len(a): n.left = ns[j]; j += 1
        if j < len(a): n.right = ns[j]; j += 1
        q += [c for c in (n.left, n.right) if c]
    return ns[0]
def TT(root):
    out, q = [], [root]
    for n in q:
        if n is None: out.append(None); continue
        out.append(n.val); q += [n.left, n.right]
    while out and out[-1] is None: out.pop()
    return out
'''

def strip(src):
    return re.sub(r'[ \t]+#[!?].*$', '', src, flags=re.M)

class TO(Exception): pass
def alarm(*_): raise TO()
signal.signal(signal.SIGALRM, alarm)

def run(code, test, exp):
    ns = {}
    exec(PRELUDE, ns)
    signal.alarm(5)
    try:
        exec(code, ns)
        exec(test, ns)
        want = eval(exp, ns)
        got = ns['res']
        return got == want, got, want
    finally:
        signal.alarm(0)

def main():
    data = json.load(open(sys.argv[1]))
    only = set(sys.argv[2:])
    P, T = data['P'], data['T']
    bad = 0; ran = 0; untested = []
    for pid, p in P.items():
        if only and pid not in only: continue
        if p.get('lang') == 'js': continue
        if not p.get('test'):
            untested.append(pid); continue
        for name in ('b', 'o'):
            ran += 1
            try:
                ok, got, want = run(strip(p[name]), p['test'], p['exp'])
                if not ok:
                    bad += 1; print(f'FAIL {pid} [{name}] got={got!r} want={want!r}')
            except TO:
                bad += 1; print(f'TIMEOUT {pid} [{name}]')
            except Exception as e:
                bad += 1; print(f'ERROR {pid} [{name}] {type(e).__name__}: {e}')
    # structure checks
    req = ['id', 't', 'd', 'pat', 'br', 'bt', 'bs', 'ot', 'os', 'b', 'o', 'trick', 'viz']
    for pid, p in P.items():
        miss = [k for k in req if not p.get(k)]
        if miss: bad += 1; print(f'MISSING {pid}: {miss}')
        if '#!' not in p['o'] and '//!' not in p['o']: print(f'NOTE {pid}: no #! annotations in optimal')
    ids = set(P)
    for t in T:
        if len(t['ids']) != 25: bad += 1; print(f'TRACK {t["id"]} has {len(t["ids"])} ids')
        if len(set(t['ids'])) != len(t['ids']): bad += 1; print(f'TRACK {t["id"]} duplicates')
        for i in t['ids']:
            if i not in ids: bad += 1; print(f'TRACK {t["id"]} unknown id {i}')
    used = {i for t in T for i in t['ids']}
    if T:
        for i in ids - used: print(f'NOTE unused problem {i}')
    print(f'ran {ran} variant tests, {len(P)} problems, {len(T)} tracks, {len(untested)} untested py (js excluded), failures={bad}')
    if untested: print('untested:', untested)
    sys.exit(1 if bad else 0)
main()
