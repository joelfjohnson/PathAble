# PathAble navigation imagery

`scenes/bentonville-square.webp` and `videos/square-reference.mp4` derive from **Downtown Bentonville, AR.jpg**, by **Brandonrush**, photographed May 27, 2013.

Source: https://commons.wikimedia.org/wiki/File:Downtown_Bentonville,_AR.jpg
License: Creative Commons Attribution-ShareAlike 3.0 Unported — https://creativecommons.org/licenses/by-sa/3.0/

Changes: resized to 1600 × 1200, compressed to WebP; an eight-second still-photo MP4 was encoded for the video playback demonstration. The app adds an illustrative animated ribbon, scene annotations, cropping, and subtle shared camera motion. These adapted photographic assets and photographic overlay compositions are distributed under CC BY-SA 3.0. No endorsement is implied. This notice does not relicense independent application code.

The MP4 is an animated-reference-photo presentation, **not walking footage**. The historical photo is not a current accessibility survey and does not depict every segment of the scripted route. Guidance, approximate distances, and markers are illustrative; overlay alignment is hand-authored for this reference view, not live AR tracking.

`scenes/neutral-sidewalk.svg` is an original, location-neutral PathAble illustration used when media is unavailable. It is not a depiction of Bentonville.

No Google Street View imagery has been extracted or republished. Replace these references with team-owned, permission-cleared footage using `src/data/arScenes.ts`, keeping media credits and coordinate keyframes accurate.

## Original illustrative viewpoints

`scenes/transit.svg`, `crossing.svg`, `barrier.svg`, `alternative.svg`, `north-crossing.svg`, and `avenue.svg` are original PathAble vector illustrations. They are location-neutral visual studies, not photographs or geographically faithful depictions of Bentonville. Each represents a different scripted navigation situation. The UI labels them as illustrative viewpoints.

`thumbnails/transit.png` and `videos/transit-study.mp4` derive solely from the original transit illustration. The eight-second clip is a static illustration study with browser-rendered overlays and camera movement, not captured travel footage. Reproduce these assets with `scripts/create-illustrative-scenes.mjs` and `scripts/prepare-transit-video.mjs`.

Scene media, camera settings, and ground-path coordinates are configurable in `src/data/arVisuals.ts`. The historical reference remains separately credited above and appears only in the curb-reference and destination scenes.
