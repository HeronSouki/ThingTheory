# Thing Theory brand guide

The look every episode shares. The shared code in `lib/` already applies most of these rules,
so new scenes get the look by default.

Reference sheet: [`reference/art-direction.webp`](reference/art-direction.webp)

## Look

- **Flat, friendly shapes** with a thick dark outline (`P.ink`) and one flat shade per shape.
  No gradients on characters. Backgrounds may use soft vertical gradients.
- **Hand-drawn line boil:** outlines re-jitter 8 times per second, like traditional animation.
  `shape()`, `circle()`, `line()` etc. do this automatically; pass `wob: 0` for rigid UI.
- **Warm paper grain** multiplied over every frame (`applyPaper`, run by the renderer).
- **Readable at phone size:** big text, few words on screen, one focal point per shot.
- **Humour comes from the picture, not only the voice-over:** reaction faces, a prop gag, a
  stamp or label landing on the punchline word.

## Palette (`P` in `lib/engine/draw.js`)

| Role | Tokens |
|---|---|
| Paper / background | `paper #F5EDDF`, `paper2 #EBE0CB`, `beige #DDCCB2` |
| Ink (outlines, text) | `ink #2F3B3E`, `inkL #56666A` |
| Sage (nature, "good") | `sage #9CBB90`, `sageD #6F9869`, `green #6DAE69` |
| Dusty blue (cold, water, calm) | `blue #86A8D0`, `blueD #5F83B3`, `blueDD #3F5F8E` |
| Coral (Greg, warmth, alerts) | `coral #E8877A`, `coralD #CC6557`, `red #DB5646` |
| Mustard (highlights, labels) | `mustard #EDC468`, `mustardL #F6DD9E` |
| Plum (accent, rare) | `plum #937094` |

Each colour has `D` (darker) and `L` (lighter) variants for shading and highlights.

## Type (`FONTS`)

| Font | Use |
|---|---|
| Luckiest Guy (`bold`) | titles, level cards, stamps, thumbnails |
| Permanent Marker (`marker`) | handwritten labels, names ("GREG") |
| Patrick Hand (`hand`) | speech bubbles, tags, captions |
| Fredoka (`round`) | UI numbers, small print |

The fonts have no ∞ ✓ → ↓ ★ ≈ glyphs; those show up as boxes. Draw them with `infinity()`, `checkMark()`,
`arrow()` or `star()` instead.

## Characters (`lib/characters/person.js`)

One rig for everyone: `drawPerson(ctx, { x, y, s, costume, pose, expr, t, id, ... })`.

- **Greg:** the everyman. Coral t-shirt, jeans, sneakers. Use him for any "what if *you*…" premise.
- **The scientist:** the narrator on screen. Lab coat, spiky hair, goggles.
  `costume: 'mascot'` pushes the goggles up onto the hair (profile picture look).
- Supporting cast: `juliane`, `inuit`, `tuareg`, `villager`, `villager2`, `soldier`, `sailor`, `caveman`, `kid`, `elder`.
  Add new costumes to `COSTUMES` rather than drawing one-off people.
- Poses: `stand, relaxed, wave, armsUp, panic, shrug, hips, point, pointUp, thumbs, hug, think,
  present, presentBoth, cheer, tread, facepalm, holdOut, holdBoth, drink, scratch`, or a custom
  object like `{ aL: [12, -8], aR: [70, 110], handR: 'thumb' }`.
- Expressions: `neutral, smile, happy, grin, worried, scared, shocked, surprised, disgusted,
  deadpan, sad, determined, angry, cold, hot, sleep, dead, dizzy, thinking, proud, nervous, exhausted`,
  or a custom object like `{ eyes: 'wide', brows: [0.9, 0.9], mouth: 'teeth' }`.

## Sound

Sound effects are synthesized (`tools/sfx.py`): soft pops, swooshes, stamps and dings, kept
quiet under the voice. The drawing helpers add them on their own when things appear on screen, so you rarely place them by hand.
Use `sfx(type, key)` for a one-off.

## Channel assets (`npm run channel-art` writes to `out/channel/`)

| File | Spec |
|---|---|
| `pfp.png` (blue), `pfp_coral.png`, `pfp_mustard.png` | 800×800. YouTube crops to a circle. |
| `banner.jpg` | 2560×1440. Everything important sits in the 1546×423 centre safe area (see `banner_guides.png`). |
| `preview.png` | mockup of the channel page on desktop, TV and phone |

## YouTube specs to remember

- Thumbnail: 1280×720 JPG, under 2 MB (`npm run thumbnails`)
- Video: 1920×1080, 30 fps, H.264 + AAC (`npm run render`)
- Captions: `.srt` from the alignment (`npm run captions`)
