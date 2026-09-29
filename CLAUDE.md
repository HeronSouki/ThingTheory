# Working in this repo

Thing Theory is a YouTube channel. Each video is a code-driven animation, and there is one folder per episode
under `episodes/`. All episodes share `lib/`. Read `README.md` for commands and `channel/BRAND.md`
for the visual rules before you add scenes.

## Workflow for a new episode

1. `npm run new-episode -- <slug> "<title>"`, add `script.txt` + `narration.mp3`, then `npm run align -- --ep NNN`.
2. Write scenes in `episodes/NNN-slug/scenes/`. Each exports `build()` → `[{ a, b, draw(ctx, t) }]`.
3. Get every time from the narration: `const c = cues(0); const tX = c('exact spoken words');`.
   If a cue throws "cue not found", look at the spelling in `words.json` (numbers are spelled out
   as words, e.g. "forty five").
4. Check your work visually, not only by running it: `npm run still -- <t> ...` or `npm run sheet -- a b n`,
   then read the PNGs in `out/<ep>/stills/`. Use `node tools/grid.mjs out.png a.png b.png ...` to tile them.
5. `npm run check` (eslint no-undef + blank-frame check) before any long render.

## Conventions

- World space is 1920×1080 at 30 fps. Characters stand on y ≈ 850–900. `drawPerson` puts the feet at (x, y).
- Before drawing something new, run `npm run catalog` and look at `out/catalog/*.png`. If a prop,
  animal or background could appear in another episode, add it to `lib/` (`lib/props/*.js` is
  re-exported by `lib/props/index.js`) instead of the episode folder.
- Props take `(ctx, x, y, s, ...)` and draw centred at (x, y) with scale s. Animated props also take `t`.
- Import shared code with `#lib/...` (a package.json import map). Inside `lib/`, use relative imports.
- Use palette tokens (`P.coral`, `P.blueD`, ...) and `FONTS` keys (`bold`, `marker`, `hand`, `round`) rather than raw hex values or font names.
- Keep rendering deterministic: use `hash`, `rng`, `noise1` and `wiggle` from core. Never use `Math.random()` or wall-clock time.
- Sound effects come from the drawing helpers automatically. For a one-off, call
  `sfx(type, key)` with a stable key; types are listed in `tools/sfx.py` (`make`).

## Pitfalls

- The fonts have no ∞ ✓ → ↓ ★ ≈ glyphs (they render as boxes). Draw them with `infinity()`,
  `checkMark()`, `arrow()` or `star()`.
- The imageio-ffmpeg static build (7.0.2) segfaults when it decodes H.264 with several threads.
  Pass `-threads 1` before any video input you read back (concat, re-encode).
- Rendered media never goes in git on the working branches (GitHub limit: 100 MB per file, no LFS).
  File attachments in the Claude app are limited to 30 MB. Send a 720p cut or split the file.
  Episode 001's compressed 1080p render lives on the orphan `video-render` branch.
- Changes to `lib/` affect every episode. After editing `lib/`, re-render stills of older episodes
  (e.g. `npm run sheet -- --ep 001 0 590 24`) to confirm nothing moved.
