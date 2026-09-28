# Thing Theory — How Long Would Greg Last?

A fully code-driven animated explainer (≈10 min, 1920×1080, 30 fps) for the
"drop Greg in five biomes" script. Every frame is drawn procedurally with the
Canvas 2D API — no image assets — and is synced to the narration word by word.

Style: friendly flat shapes with low-poly facet shading, a hand-drawn "line boil"
(outlines re-jitter 8× per second like traditional animation), a warm paper grain,
and the palette from the Thing Theory art-direction sheet (sage, dusty blue, coral,
mustard, beige, plum). Greg, the Thing Theory scientist and every side character
share one cartoon rig with poses and expressions.

## Render the video

Requirements: Node 18+, Python 3 with `numpy` and `imageio-ffmpeg` (ships an ffmpeg binary;
any ffmpeg with libx264 works via `FFMPEG=/path/to/ffmpeg`).

```bash
npm install
pip install numpy imageio-ffmpeg

# full video -> out/greg-biomes.mp4 (narration + synthesized sound effects)
node render/render.js

# quick half-resolution preview of one section
node render/render.js --scale 0.5 --start 150 --end 265 --out out/jungle-preview.mp4

# YouTube thumbnails -> out/thumbnails/*.jpg (1280x720) + *.png (1920x1080) + review_sheet.png
node render/thumbnails.js

# channel branding -> out/channel/pfp*.png (800x800), banner.jpg (2560x1440), banner_guides.png, preview.png
node render/channel_art.js

# stills / contact sheets for review
node render/still.js 95.5 230          # -> out/stills/still_95.50.png ...
node render/still.js --sheet 60 150 20 # -> 20 thumbnails between 1:00 and 2:30
```

Options: `--workers N` (defaults to CPU count), `--scale 0.5`, `--crf 18`,
`--preset medium`, `--no-sfx` (narration only).

## How it works

```
assets/
  narration.mp3        voice-over
  script.txt           transcript with rough (m:ss) markers
  words.json           word-level timings (forced alignment, see tools/align.py)
  envelope.json        per-frame loudness (drives the scientist's mouth)
  fonts/               Permanent Marker, Luckiest Guy, Patrick Hand, Fredoka (OFL/Apache)
src/
  engine/              easing, noise, wobbly shape primitives, text, paper texture, SFX registry
  chars/person.js      the character rig (Greg, scientist, Juliane, Inuit, Tuareg, ...)
  bg.js                forest / jungle / desert / ocean / arctic / lab backgrounds
  ui.js                level cards, survival clock, meters, bubbles, transitions
  props.js, worldmap.js
  scenes/*.js          intro, rules, forest, jungle, desert, ocean, arctic, outro
  timeline.js, main.js renderFrame(ctx, t) for any time t
render/                Node renderer (parallel workers piped into one ffmpeg)
tools/
  align.py             pocketsphinx forced alignment of script -> words.json
  sfx.py               procedural sound effects (pops, whooshes, stamps, dings...)
  check_gaps.mjs       sanity check: no blank frames in the timeline
  grid.mjs             tile rendered stills into one review image
  srt.py               captions (.srt) from the word timings
```

Scenes never hard-code timestamps. They look up phrases in the narration, e.g.
`c('so greg builds')` returns the moment those words are spoken, so every gag lands
on its line. To retime after re-recording the voice: replace `assets/narration.mp3`
and `assets/script.txt`, re-run `python3 tools/align.py <16kHz raw pcm>` and render.

Sound effects are not placed by hand either: drawing helpers (stamps, tags, wipes,
portal drops, the survival clock, …) register a cue the first time they appear on
screen, and `tools/sfx.py` synthesizes the matching sound.
