# Thing Theory

The production repo for the **Thing Theory** YouTube channel: animated explainers made entirely
in code. Each frame is drawn with the Canvas 2D API (there are no image assets) and synced word by word
to the narration. Every episode shares one library of characters, backgrounds, props and UI, so
they all look like the same channel.

| # | Episode | Status |
|---|---|---|
| 001 | [How Long Would You Survive With Nothing?](episodes/001-greg-biomes/PUBLISH.md) | rendered, ready to upload |

## Setup

Node 18+ and Python 3.

```bash
npm install
pip install -r requirements.txt   # numpy, imageio-ffmpeg (bundles ffmpeg), pocketsphinx
```

Any ffmpeg with libx264 also works: set `FFMPEG=/path/to/ffmpeg`.

## Everyday commands

All commands default to the newest episode. Pass `--ep 001` (or any unique prefix) to pick another.
Outputs go to `out/<episode>/`, which git ignores.

```bash
npm run preview                    # half-res, fast render to check timing
npm run render                     # final 1080p mp4 with narration + sound effects
npm run render -- --start 150 --end 265 --scale 0.5    # just one section
npm run still -- 95.5 230          # single frames as PNG
npm run sheet -- 60 150 20         # contact sheet: 20 frames between 1:00 and 2:30
npm run thumbnails                 # YouTube thumbnails (1280x720 jpg) + review sheet
npm run captions                   # .srt captions from the word timings
npm run check                      # lint (undefined names) + blank-frame check
npm run catalog                    # picture sheets of every prop, costume, pose, expression
npm run channel-art                # profile pictures + banner -> out/channel/
```

Render options: `--workers N` (default: CPU count), `--scale 0.5`, `--crf 18`, `--preset medium`,
`--no-sfx`, `--out path.mp4`.

## Making a new episode

```bash
npm run new-episode -- deep-ocean "What If You Fell Into The Mariana Trench?"
```

1. **Script:** paste the final script into `episodes/NNN-slug/script.txt`.
2. **Voice:** save the voice-over as `narration.mp3`, then run `npm run align -- --ep NNN`. This writes
   `words.json` (word timings) and `envelope.json` (loudness, used for mouth flaps). If a name is
   misheard, add a respelling or pronunciation to `episode.json` → `align` and re-run.
3. **Scenes:** write them in `scenes/` and list them in `index.js`. Look up times with
   `c('phrase')` so animation lands on the words. Never type seconds by hand. Until the
   voice exists, the template's `at(phrase, draftTime)` lets you block scenes out early.
4. Set `end` in `episode.json` to the narration length (seconds). Then `npm run check` and `npm run preview`.
5. `npm run render`, `npm run thumbnails`, `npm run captions`, then fill in `PUBLISH.md`.

Anything two episodes could share (a prop, an animal, a background, a UI element) goes in `lib/`, not
in the episode folder. See `npm run catalog` for what already exists.

## Layout

```
lib/                         shared library, used by every episode
  engine/                    core math/easing/noise + narration cues, wobbly drawing primitives,
                             paper texture, sound-effect registry
  characters/person.js       the one character rig: costumes, poses, expressions
  world/                     backgrounds (forest, jungle, desert, ocean, arctic, lab, notebook),
                             world map
  props/                     items, animals, nature, places, science: reusable drawings
  ui.js                      cameras, keyframes, bubbles, panels, level cards, clocks, meters, wipes
  kit.js                     shot helpers: paint-wipe transitions, portal drops, dust, sepia, dim
  thumbkit.js                thumbnail headline text, red circles/arrows, vignette
  renderer.js                createRenderer(build): draws an episode at any time t
episodes/
  001-greg-biomes/
    episode.json             id, title, length, alignment respellings
    script.txt, narration.mp3, words.json, envelope.json
    index.js                 scene order
    scenes/*.js              the animation, one file per section
    levels.js                this episode's format (the five biome "levels")
    thumbnails.js            this episode's thumbnail designs
    PUBLISH.md               titles, description, chapters, tags, launch checklist
  _template/                 starting point for new-episode
channel/
  BRAND.md                   palette, fonts, characters, style rules, YouTube specs
  art.js                     profile picture + banner generator
  reference/                 art-direction sheet
render/                      Node renderers (video, stills, thumbnails) + episode lookup
tools/                       align.py, sfx.py, srt.py, check_gaps, catalog, grid, new-episode
assets/fonts/                Luckiest Guy, Permanent Marker, Patrick Hand, Fredoka (OFL/Apache)
```

## How it works

- **Timing from the voice:** `tools/align.py` force-aligns the script to the audio
  (pocketsphinx). Scenes look up phrases (`c('so greg builds')`), so re-recording a line only
  means re-running `npm run align`.
- **Hand-drawn feel:** outlines wobble and re-jitter 8× per second ("line boil"), shapes use flat
  facet shading, and a paper grain goes over everything. Output is deterministic: the same frame
  always renders the same pixels.
- **Sound effects:** drawing helpers (stamps, tags, wipes, pops, the survival clock, …) register a
  cue the first time they appear on screen. `tools/sfx.py` then synthesizes each sound (no samples)
  and mixes the track under the narration.
- **Rendering:** parallel workers draw frames and pipe them in order into a single ffmpeg process
  (H.264, `-tune animation`).

## Large files

GitHub rejects files over 100 MB, and git LFS is not set up. Rendered videos stay out of the code branches:
a compressed 1080p copy of episode 001 lives on the `video-render` branch. Upload finished videos
straight to YouTube, or attach them to a GitHub Release.
