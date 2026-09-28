"""Synthesize a sound-effects track from the cue list produced by the renderer.

usage: python3 tools/sfx.py events.json out.wav duration_seconds

Every sound is generated procedurally (no samples), kept short and soft so it
sits well under the narration.
"""
import json
import sys
import wave
import zlib

import numpy as np

SR = 44100


def env_exp(n, tau):
    t = np.arange(n) / SR
    return np.exp(-t / tau)


def attack(n, a=0.004):
    k = max(1, int(a * SR))
    e = np.ones(n)
    e[:k] = np.linspace(0, 1, k)
    return e


def sweep(f0, f1, dur, shape='exp'):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if shape == 'exp':
        f = f0 * (f1 / f0) ** (t / dur)
    else:
        f = np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def noise(n, seed=0):
    return np.random.default_rng(seed).uniform(-1, 1, n)


def bandpass(x, f_center, q=2.0):
    """Time-varying (or fixed) state-variable band-pass filter."""
    fc = np.broadcast_to(np.asarray(f_center, dtype=float), x.shape)
    y = np.zeros_like(x)
    low = band = 0.0
    damp = 1.0 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        y[i] = band
    return y


def bell(freq, dur, partials=((1, 1.0), (2.0, 0.35), (2.76, 0.25), (5.4, 0.1)), tau=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, amp in partials:
        out += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / (tau / ratio ** 0.5))
    return out * attack(n, 0.002)


def whoosh(dur=0.45, lo=300, hi=2200, seed=1):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    fc = lo + (hi - lo) * np.sin(np.pi * t) ** 1.5
    x = bandpass(noise(n, seed), fc, q=1.4)
    return x * np.sin(np.pi * t) ** 2 * 2.2


def pop(pitch=1.0, dur=0.07):
    n = int(dur * SR)
    x = sweep(480 * pitch, 900 * pitch, dur) * env_exp(n, 0.025) * attack(n, 0.002)
    return x


def thump(f0=110, f1=45, dur=0.3):
    n = int(dur * SR)
    return sweep(f0, f1, dur) * env_exp(n, 0.09) * attack(n, 0.002)


def make(kind, seed):
    rng = np.random.default_rng(seed)
    j = 1 + (rng.random() - 0.5) * 0.18  # small pitch jitter so repeats don't sound robotic
    if kind == 'pop':
        return pop(j) * 0.9
    if kind == 'bubble':
        return pop(0.75 * j, 0.09) * 0.8
    if kind == 'card':
        return whoosh(0.22, 800, 3000, seed) * 0.45
    if kind == 'swoosh':
        return whoosh(0.35, 400, 2600, seed) * 0.6
    if kind == 'whoosh':
        return whoosh(0.55, 250, 2000, seed) * 0.8
    if kind == 'stamp':
        n = int(0.25 * SR)
        click = bandpass(noise(n, seed), 1400, 1.2) * env_exp(n, 0.02) * 1.6
        return thump(150, 55, 0.25) * 1.0 + click
    if kind == 'scribble':
        n = int(0.28 * SR)
        t = np.arange(n) / SR
        am = 0.5 + 0.5 * np.sin(2 * np.pi * 26 * t)
        return bandpass(noise(n, seed), 3200, 3.0) * am * np.sin(np.pi * t / t[-1]) * 1.4
    if kind == 'ding':
        return bell(1318.5 * j, 0.8, tau=0.25) * 0.5
    if kind == 'good':
        a = bell(1046.5, 0.5, tau=0.2)
        b = bell(1568.0, 0.8, tau=0.3)
        out = np.zeros(len(a) // 2 + len(b))
        out[:len(a)] += a
        out[len(a) // 2:] += b
        return out * 0.45
    if kind == 'bad':
        # little "wah-wah" on a soft triangle wave
        segs = []
        for f0, f1, d in ((311, 294, 0.28), (277, 247, 0.55)):
            n = int(d * SR)
            ph = np.cumsum(np.linspace(f0, f1, n)) / SR
            tri = 2 * np.abs(2 * (ph % 1) - 1) - 1
            vib = 1 + 0.02 * np.sin(2 * np.pi * 6 * np.arange(n) / SR)
            segs.append(tri * vib * np.sin(np.pi * np.arange(n) / n) ** 0.5)
        return np.concatenate(segs) * 0.35
    if kind == 'boom':
        n = int(0.7 * SR)
        rumble = bandpass(noise(n, seed), 180, 0.8) * env_exp(n, 0.18) * 2.0
        out = rumble
        out[:int(0.3 * SR)] += thump(90, 35, 0.3) * 1.2
        return out * 0.9
    if kind == 'thud':
        n = int(0.35 * SR)
        return (thump(95, 40, 0.35) * 1.2 + bandpass(noise(n, seed), 700, 1.0) * env_exp(n, 0.03)) * 0.9
    if kind == 'portal':
        w = whoosh(0.9, 300, 1800, seed) * 0.5
        n = len(w)
        t = np.arange(n) / SR
        shimmer = np.zeros(n)
        for i, f in enumerate((659.3, 880.0, 1318.5, 1760.0)):
            st = int(i * 0.09 * SR)
            b = bell(f, 0.6, tau=0.2)[: n - st]
            shimmer[st:st + len(b)] += b * 0.25
        return w + shimmer * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
    if kind == 'level':
        out = np.zeros(int(1.4 * SR))
        for i, f in enumerate((523.3, 659.3, 784.0, 1046.5)):
            b = bell(f, 0.9, tau=0.3)
            st = int(i * 0.11 * SR)
            out[st:st + len(b)] += b * 0.3
        w = whoosh(0.5, 300, 2000, seed) * 0.5
        out[:len(w)] += w
        return out
    if kind == 'clock':
        out = np.zeros(int(2.2 * SR))
        # spinning tick-tick that slows down, then a ding when the verdict lands
        tt = 0.0
        k = 0
        while tt < 1.15:
            n = int(0.012 * SR)
            click = bandpass(noise(n, seed + k), 3000 if k % 2 else 2200, 2.0) * env_exp(n, 0.003) * 1.6
            st = int((0.3 + tt) * SR)
            out[st:st + n] += click
            tt += 0.05 + tt * 0.12
            k += 1
        b = bell(1568.0, 0.9, tau=0.35) * 0.6 + bell(784.0, 0.9, tau=0.4) * 0.3
        st = int(1.22 * SR)
        out[st:st + len(b)] += b[: len(out) - st]
        return out
    return np.zeros(10)


GAIN = {  # relative loudness under the narration
    'pop': 0.085, 'bubble': 0.10, 'card': 0.10, 'swoosh': 0.14, 'whoosh': 0.16, 'stamp': 0.22,
    'scribble': 0.07, 'ding': 0.12, 'good': 0.16, 'bad': 0.14, 'boom': 0.28, 'thud': 0.26,
    'portal': 0.16, 'level': 0.2, 'clock': 0.2,
}
MIN_GAP = {'pop': 0.2, 'bubble': 0.2, 'card': 0.2, 'scribble': 0.25, 'ding': 0.15, 'swoosh': 0.3}


def main():
    events = json.load(open(sys.argv[1]))
    out_path = sys.argv[2]
    dur = float(sys.argv[3])
    buf = np.zeros(int(dur * SR) + SR * 3)
    last = {}
    used = 0
    for e in sorted(events, key=lambda e: e['t']):
        kind = e['type']
        if kind not in GAIN:
            continue
        # busy moments: skip repeats that land too close together
        if e['t'] - last.get(kind, -9) < MIN_GAP.get(kind, 0.05):
            continue
        last[kind] = e['t']
        seed = zlib.crc32(e['key'].encode()) & 0xFFFF
        s = make(kind, seed) * GAIN[kind] * e.get('vol', 1)
        st = int(e['t'] * SR)
        buf[st:st + len(s)] += s[: len(buf) - st]
        used += 1
    buf = buf[: int(dur * SR)] * 0.8
    buf = np.tanh(buf * 1.2) / 1.2  # gentle safety limiter
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'sfx: {used} cues mixed into {out_path}')


if __name__ == '__main__':
    main()
