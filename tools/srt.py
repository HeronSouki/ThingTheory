"""Build an .srt caption file from an episode's word-level alignment.

usage: python3 tools/srt.py [--ep 001] [out.srt]     (default out/<episode>/<episode>.srt)
"""
import json
import os
import re
import sys

from episode import ROOT, resolve, episode_arg

EP_ID, EP_DIR, _ = resolve(episode_arg(sys.argv))
words = [w for w in json.load(open(os.path.join(EP_DIR, 'words.json'))) if w['w']]
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out', EP_ID, f'{EP_ID}.srt')
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)

MAX_CHARS, MAX_DUR = 42, 3.2


def ts(t):
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f'{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}'


cues, cur = [], []
for w in words:
    text = ' '.join(x['w'] for x in cur + [w])
    if cur and (len(text) > MAX_CHARS or w['e'] - cur[0]['s'] > MAX_DUR):
        cues.append(cur)
        cur = []
    cur.append(w)
    # end a caption at sentence punctuation, or at a comma once the line is long enough
    line = ' '.join(x['w'] for x in cur)
    if (re.search(r'[.?!]$', w['w']) and not re.fullmatch(r'\d\.', w['w'])) or (w['w'].endswith(',') and len(line) > 26):
        cues.append(cur)
        cur = []
if cur:
    cues.append(cur)

# fold one-word orphans back into the previous caption when it still fits
merged = []
for c in cues:
    if merged and len(c) == 1 and len(' '.join(x['w'] for x in merged[-1] + c)) <= 52 and c[0]['s'] - merged[-1][-1]['e'] < 0.4:
        merged[-1] = merged[-1] + c
    else:
        merged.append(c)
cues = merged

with open(out, 'w') as f:
    for i, c in enumerate(cues, 1):
        start = c[0]['s']
        end = c[-1]['e'] + 0.15
        if i < len(cues):
            end = min(end, cues[i][0]['s'] - 0.02)
        f.write(f"{i}\n{ts(start)} --> {ts(end)}\n{' '.join(x['w'] for x in c)}\n\n")
print(f'{len(cues)} captions -> {out}')
