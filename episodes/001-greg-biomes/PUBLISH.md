# 001: How Long Would You Survive With Nothing?

Greg, an average guy with no tools, gets dropped into five biomes: forest, Amazon, Sahara,
Pacific Ocean and Northern Canada in January. 9:56, 1920×1080, 30 fps.

- Full render: `npm run render -- --ep 001` writes `out/001-greg-biomes/001-greg-biomes.mp4` (~270 MB)
- Compressed 1080p copy for download: the `video-render` branch (`greg-biomes-1080p.mp4`, 91 MB)
- Captions: `npm run captions -- --ep 001` writes `out/001-greg-biomes/001-greg-biomes.srt`

## Title options

Keep titles under ~55 characters, put the search keyword early, and don't repeat the thumbnail text.

| Pick | Title | Chars | Pair with thumbnail |
|---|---|---|---|
| 1 (launch) | **How Long Would You Survive With Nothing?** | 40 | #2 10:00 LEFT |
| 2 (swap-in if CTR is low) | **Every Biome Ranked by How Fast It Kills You** | 43 | #1 FOREVER / HOURS |
| 3 | **We Dropped an Average Guy in 5 Places With Nothing** | 51 | #3 NO WAY OUT |

More options:
- How Long Would You Last in Every Biome?
- Zero Tools, 5 Biomes: How Long Would You Last?
- What Would Actually Kill You First in the Wild?
- One Place You'd Live Forever. One You'd Last Hours.
- The Calmest Place on Earth Is the Most Hopeless
- Why the Ocean Is Worse Than the Desert
- Ranking Earth's Biomes by How Long You'd Survive
- Surviving 5 Biomes With Zero Tools
- Dropping a Normal Guy Into 5 Deadly Places

## Thumbnails

`npm run thumbnails -- --ep 001` writes the files to `out/001-greg-biomes/thumbnails/`. Upload the 1280×720 `.jpg` files.

1. `thumb_1_forever-vs-hours`: split screen, happy by the campfire vs frozen in a blizzard (contrast)
2. `thumb_2_ten-minutes`: frozen close-up with a red 10:00 countdown (urgency, strongest emotional grab)
3. `thumb_3_no-way-out`: sunset ocean, panicking Greg, shark fin (curiosity)

Run all three in YouTube Studio's Test & Compare. If you use only one, use #1.

## Launch plan

1. Publish with title 1 and thumbnail #2.
2. Run Test & Compare with all three thumbnails.
3. After 48–72 h, if click-through rate is below the channel average, switch to title 2 with thumbnail #1.

## Description

> This is Greg. He has no knife, no lighter, no phone… and we're dropping him in five of the most famous places on Earth.
>
> In one of them he could live forever. In another, his fingers start dying in under ten minutes. And one of them looks calm, peaceful, even beautiful, but it's the one place where there's absolutely nothing Greg can do.
>
> Using the rule of threes (3 minutes without air, 3 hours without shelter, 3 days without water, 3 weeks without food), we find out how long an average person really lasts in the forest, the Amazon rainforest, the Sahara, the middle of the Pacific and Northern Canada in January.
>
> Chapters
> 0:00 Meet Greg
> 0:33 The rules (rule of threes)
> 1:06 Level 1: The forest
> 2:34 Level 2: The Amazon
> 4:24 Level 3: The Sahara
> 5:48 Level 4: The Pacific
> 7:29 Level 5: Northern Canada
> 9:01 The verdict
>
> Where would you last the longest? Tell us in the comments.

## Tags

survival, how long would you survive, rule of threes, biomes, survive with nothing, amazon rainforest,
sahara desert, pacific ocean, arctic survival, juliane koepcke, debris hut, trench foot, animated explainer,
thing theory

## Checklist

- [x] script final, narration recorded, aligned
- [x] `npm run check` clean, preview watched end to end
- [x] full render, captions, thumbnails
- [ ] uploaded as unlisted, captions file attached, end screen + cards set
- [ ] published, Test & Compare running
