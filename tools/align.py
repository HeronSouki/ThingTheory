"""Forced-align the narration script to the audio with pocketsphinx.

Produces assets/words.json: [{"w": display word, "n": normalized word, "s": start sec, "e": end sec}, ...]
The script's (m:ss) markers are used as anchors so each chunk is aligned against a short audio window.
"""
import json, re, sys, os
from pocketsphinx import Decoder, Config
import pocketsphinx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = sys.argv[1]  # 16 kHz mono s16le
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

SPECIAL = {
    "yuliana": "juliana", "kepka": "kepka", "i": "i", "gastrointestinal": "gastrointestinal",
    "trenchfoot": "trench foot", "fairytale": "fairy tale", "snowdrift": "snow drift",
    "tuareg": "twa reg", "inuit": "inuit",
}

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

text = open(os.path.join(ROOT, "assets", "script.txt")).read()
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

audio = open(RAW, "rb").read()
total = len(audio) / 2 / SR

dec = Decoder(samprate=SR, loglevel="FATAL", bestpath=False)

# pronunciations for OOV words
extra = {
    "juliana": "JH UW L IY AA N AH",
    "kepka": "K EH P K AH",
    "inuit": "IH N UW IH T",
    "twa": "T W AA",
    "reg": "R EH G",
    "grubs": "G R AH B Z",
    "cattail": "K AE T T EY L",
    "debris": "D AH B R IY",
    "snowdrift": "S N OW D R IH F T",
}
for w, p in extra.items():
    if dec.lookup_word(w) is None:
        dec.add_word(w, p, True)

OOV_PRON = {
    "anacondas": "AE N AH K AA N D AH Z",
    "shirtless": "SH ER T L AH S",
    "thirstier": "TH ER S T IY ER",
}

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
                print("OOV:", w, file=sys.stderr)
                dec.add_word(w, OOV_PRON.get(w, "AH"), True)
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

json.dump(results, open(os.path.join(ROOT, "assets", "words.json"), "w"), indent=0)
print("words:", len(results), "duration:", total)
