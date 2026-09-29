"""Forced-align an episode's script to its narration with pocketsphinx.

usage: python3 tools/align.py [--ep 001]      (npm run align -- --ep 001)

Reads  episodes/<ep>/script.txt and narration.mp3
Writes episodes/<ep>/words.json     [{"w": display word, "n": normalized word, "s": start sec, "e": end sec}, ...]
       episodes/<ep>/envelope.json  per-frame (30 fps) loudness 0..1, drives mouth flaps

Words the dictionary does not know, or that the narrator says differently from how they are
spelled, go in episode.json -> "align": {"respell": {...}, "pronunciations": {...}} (ARPAbet).
The script's (m:ss) markers are only used to report drift; the whole file is aligned at once.
"""
import array, json, math, re, subprocess, sys, os
from pocketsphinx import Decoder

from episode import resolve, episode_arg, ffmpeg

EP_ID, EP_DIR, META = resolve(episode_arg(sys.argv))
ALIGN = META.get('align', {})
SR = 16000

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()

def num_words(n):
    n = int(n)
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000:
        r = ONES[n // 100] + " hundred"
        return r + ("" if n % 100 == 0 else " " + num_words(n % 100))
    if 1900 <= n < 2100 and n != 2000:
        return num_words(n // 100) + " " + num_words(n % 100)
    raise ValueError(n)

SPECIAL = ALIGN.get("respell", {})

def normalize_token(tok):
    """Return list of normalized words for one display token."""
    t = tok.lower().strip()
    t = re.sub(r"^[^\w]+|[^\w']+$", "", t)
    if not t: return []
    if t == "i" and tok.strip(".,") == "I":
        return ["i"]
    parts = re.split(r"-", t)
    out = []
    for p in parts:
        p = p.strip("'")
        if not p: continue
        if re.fullmatch(r"\d+", p):
            out += num_words(p).split()
        elif p in SPECIAL:
            out += SPECIAL[p].split()
        else:
            out.append(p)
    return out

text = open(os.path.join(EP_DIR, "script.txt")).read()
# Tokenize keeping timestamp markers
tokens = re.findall(r"\(\d+:\d+\)|[^\s]+", text)
chunks = []  # each: {"t": anchor time, "tokens": [...]}
cur = {"t": 0.0, "tokens": []}
for tok in tokens:
    m = re.fullmatch(r"\((\d+):(\d+)\)", tok)
    if m:
        chunks.append(cur)
        cur = {"t": int(m.group(1)) * 60 + int(m.group(2)), "tokens": []}
    else:
        cur["tokens"].append(tok)
chunks.append(cur)
chunks = [c for c in chunks if c["tokens"]]

# decode the narration to 16 kHz mono s16le
audio = subprocess.run([ffmpeg(), "-v", "error", "-threads", "1", "-i", os.path.join(EP_DIR, "narration.mp3"),
                        "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], check=True, stdout=subprocess.PIPE).stdout
total = len(audio) / 2 / SR

dec = Decoder(samprate=SR, loglevel="FATAL", bestpath=False)

# extra pronunciations (ARPAbet) for names and words missing from the dictionary
PRON = ALIGN.get("pronunciations", {})
for w, p in PRON.items():
    if dec.lookup_word(w) is None:
        dec.add_word(w, p, True)

def lookup_ok(w):
    return dec.lookup_word(w) is not None

results = []
disp, norm, anchors = [], [], []
for c in chunks:
    anchors.append((len(norm), c["t"]))
    for tok in c["tokens"]:
        ws = normalize_token(tok)
        for j, w in enumerate(ws):
            if not lookup_ok(w):
                print(f'OOV: "{w}" (add it to episode.json align.pronunciations)', file=sys.stderr)
                dec.add_word(w, "AH", True)
            disp.append(tok if j == 0 else "")
            norm.append(w)
dec.set_align_text(" ".join(norm))
dec.start_utt()
dec.process_raw(audio, full_utt=True)
dec.end_utt()
words = []
for wseg in dec.seg():
    name = wseg.word
    if name in ("<s>", "</s>", "<sil>") or name.startswith("+") or name.startswith("["):
        continue
    words.append((re.sub(r"\(\d+\)$", "", name), wseg.start_frame / 100.0, (wseg.end_frame + 1) / 100.0))
assert len(words) == len(norm), (len(words), len(norm))
for (w, ws, we), d in zip(words, disp):
    results.append({"w": d, "n": w, "s": round(ws, 3), "e": round(we, 3)})
# report drift against the script's anchors
for idx, t in anchors:
    print(f"anchor {t:6.1f}  aligned {words[idx][1]:7.2f}  diff {words[idx][1]-t:+.2f}  {' '.join(norm[idx:idx+5])}", file=sys.stderr)

json.dump(results, open(os.path.join(EP_DIR, "words.json"), "w"), indent=0)
print("words:", len(results), "duration:", total)

# per-frame loudness envelope (30 fps), normalized to the 98th percentile
raw = array.array("h", audio)
fps = 30
hop = SR // fps
vals = []
for i in range(0, len(raw) // hop):
    seg = raw[i * hop:(i + 1) * hop]
    vals.append(math.sqrt(sum(x * x for x in seg) / len(seg)))
mx = sorted(vals)[int(len(vals) * 0.98)]
env = [round(min(1.0, v / mx), 3) for v in vals]
json.dump(env, open(os.path.join(EP_DIR, "envelope.json"), "w"))
print("envelope frames:", len(env))
