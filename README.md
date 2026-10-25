# PathAble · Navigation Without Barriers

Accessibility-first frontend built for the 2026 Congressional App Challenge, Arkansas District 3.

## Run locally

Requires Node 22.12+ (or a current compatible Node release).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```sh
npm run build
npm run preview
npm run lint
npm test
```

`npm test` uses Playwright, discovers Edge or Chrome on Windows and Chrome on macOS, and otherwise uses a Playwright-managed browser. Start the development server on `127.0.0.1:5173` first. Set `PATHABLE_BROWSER_PATH` to override the executable. See `FIRST-DRAFT-RUNBOOK.md` for the supported recording sequence. Production output is `dist/`; deploy it to Vercel with Vite's default settings. No API keys or backend are required.

## Featured journey

Homepage → mobility profile → personal preferences → downtown transit pickup → Bentonville City Square → route comparison → preparation → scripted visual AR walkthrough → arrival.

Five mobility profiles supply different preference defaults. All twelve preferences can be changed and remain in state across screens. Route B is recommended when stairs, slopes, or curb ramps are prioritized; otherwise Route A is recommended for distance. Preferences beyond the scenario's data coverage remain visible without inventing assessed conditions.

Route A (320 m / 5 min) and Route B (410 m / 7 min) contain **illustrative**, unverified distance, timing, and accessibility data. Origin is a simulated pickup. Search accepts and preserves arbitrary destination text. Explicit keyboard-accessible suggestions enter the featured journey; unsupported text never relabels the Bentonville route. Any obstacle report creates a session-only report, updates the map marker, and selects predefined Route C (490 m / 9 min). It is not submitted to a community service. Restart clears route, obstacle, step, and completion state while retaining personal preferences. Session storage preserves the walkthrough across refreshes; closing the tab ends the session. Uploaded image previews stay in memory.

The AR walkthrough supports automatic playback, pause/resume, previous/next, seeking, optional voice guidance, and an expandable route map. Its opening scene uses the included historical Bentonville reference clip; the remaining scenes are explicitly labeled illustrative viewpoints until permission-cleared team footage is supplied. It uses scripted positions and does not use GPS, cameras, or live location-anchored AR. It must not be used as verified real-world navigation or accessibility advice.

## Organization

- `src/pages/Home.tsx`: marketing page and GSAP scroll reveals.
- `src/App.tsx`: integrated journey screens and application shell.
- `src/components/MapView.tsx`: lazy-loaded MapLibre map, markers, and local route geometry.
- `src/components/ReportDialog.tsx`: native accessible modal, report form, image preview (5 MB limit).
- `src/types/journey.ts`: shared typed state, routes, profiles, preferences, obstacles, and actions.
- `src/data/journey.ts`: featured route geometry, profile defaults, preference metadata.
- `src/hooks/useJourney.ts`: centralized reducer and initial state.
- `src/styles.css`: base responsive design system, focus states, reduced-motion styling.
- `src/styles/premium.css`: cinematic homepage, glass surfaces, map panels, microinteractions, and responsive refinements.
- `src/components/home/`: original scroll stories, ambient route network, and phone-to-application portal.
- `src/components/motion/`: fine-pointer cursor companion and progressive native page transitions.
- `src/components/DestinationSearch.tsx`: free-form search and keyboard-accessible featured suggestions.
- `tests/`: Playwright journey, layout, and accessibility tests and visual evidence.
- `blender/scripts/`: reproducible original product scene source.
- `blender/scenes/`: packed editable `.blend` scene.
- `public/animations/`: preview, poster, and optimized product video.
- `public/images/pathable-screen.png`: actual application screenshot used on the phone.

## Map licensing and network

MapLibre GL JS uses [OpenFreeMap](https://openfreemap.org/quick_start/) Positron vector tiles, with built-in visible OpenFreeMap / OpenMapTiles / OpenStreetMap attribution. Geographic tiles require internet access. Local route geometry is illustrative and not a surveyed sidewalk network. The interface shows an explicit message if map resources fail. Fonts are locally bundled Inter and Sora under their SIL Open Font Licenses. Blender geometry and artwork are original to this project; no third-party phone model is used.

MapLibre 6's worker is explicitly bundled with Vite's `?worker&url` approach from its [official installation guidance](https://maplibre.org/maplibre-gl-js/docs/).

## Blender production

The phone has an original rounded titanium body, black glass bezel, camera island, side buttons, mapped PathAble screen, studio lights, a gentle looping tilt, and camera framing changes.

First capture the screen by running the mobile Playwright test with the app running, then copy `tests/phone-screen.png` to `public/images/pathable-screen.png`. Then:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python blender/scripts/create_phone.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python blender/scripts/create_phone.py -- --final
node blender/scripts/encode.mjs
```

The first command creates a small preview for inspection. The final command renders 72 frames at 720 × 900 using Cycles with denoising and a modest sample budget, preferring the Metal GPU when available. Existing rendered frames are skipped to support resuming. After editing the scene or screen artwork, add `--fresh` after `--final` to replace prior frames. The first Metal render may spend several minutes compiling GPU kernels. `encode.mjs` uses `ffmpeg-static` to produce a compact H.264 MP4 and poster. The scene is packed so the screenshot travels with it. Render frames are excluded from Git. The browser uses the poster for reduced motion; the video is muted, inline, and looped.

## Phase 2 · Visual navigation

`src/pages/ARNavigationPage.tsx` is the integrated full-screen player. It consumes the same `NavigationState` and `JourneyAction` dispatch as Phase 1. `state.ar` stores the current visual scene, elapsed seconds, playback state, voice preference, and reroute state. The existing `currentStep` remains the bounded index into the route's original text directions; `ar.sceneIndex` indexes the more detailed visual scenes. Session recovery restores the current scene paused, preventing unexpected video or speech playback after refresh. The homepage Blender assets are unchanged.

### Scene and instruction editing

- `src/types/ar.ts`: media, scenes, keyframes, annotations, events, and playback interfaces.
- `src/data/arVisuals.ts`: original distinct viewpoint media, normalized path coordinates, and camera settings.
- `src/data/arScenes.ts`: `getARScenes()` assembles the selected route's sequence, geographic progress ranges, media references, normalized pathway points, and timed indicators.
- `src/data/navigationSteps.ts`: route-specific `sceneSequences`, instruction text, turn icons, approximate distance labels, and scene durations.
- `src/data/arEvents.ts`: timed contextual events and the reporting opportunity.
- `src/components/ar/`: responsive scene renderer, ground ribbon, chevrons, annotation labels, HUD, playback controls, mini-map, settings, and route-update transition.
- `src/hooks/useARPlayback.ts`: video frame callbacks with animation-frame fallback; image/fallback playback uses a monotonic elapsed-time clock.
- `src/hooks/useARVoice.ts`: opt-in speech synthesis, with cancellation when pausing, changing instructions, rerouting, or exiting.
- `src/styles/ar.css`: AR layouts, responsive controls, and reduced-motion presentation.

Path points use normalized source-image coordinates: x=0 is left, x=1 right, y=0 top, y=1 bottom. Edit the `points` arrays in `arVisuals.ts` for the illustrated viewpoints, or `pathPoints` in `arScenes.ts` for a reference still image and `pathKeyframes` (`time` in seconds, points with matching count/order) for a moving clip. The renderer smooths the centerline, generates a ribbon that narrows toward the horizon, and places tangent-aligned chevrons along it. Images/video and SVG share one source-aspect plane and one camera transform; `coverTransform()` handles viewport cropping without independently stretching the overlay. Annotation regions use the same normalized coordinates. Inspect every real clip's alignment before presenting it as calibrated.

### Replace street-level media

For the original illustrated segments, edit `src/data/arVisuals.ts`; for the historical curb/destination reference, edit `src/data/arScenes.ts`. Place permission-cleared JPEG, WebP, or PNG files in `public/ar/scenes/`, and MP4 or WebM clips in `public/ar/videos/`. Set `media.type`, `src`, `poster`, source dimensions, alt text, and credit in scene data. The opening scene currently uses `/ar/videos/square-reference.mp4`; replace that `src` with a permission-cleared team walkthrough when available. Match video duration to the configured scene duration, and calibrate path/indicator keyframes to that source view. Photos receive only a small shared zoom; reduced motion removes camera movement and crossfades. The next scene's media can be preloaded. Missing media switches to an inline, location-neutral sidewalk illustration while navigation remains usable.

The included Bentonville photo is a **2013 historical reference by Brandonrush, CC BY-SA 3.0**. The eight-second MP4 is a still-photo reference clip, **not original walking footage**. Its reuse, compression, and illustrative photographic overlay compositions are documented in `public/ar/ATTRIBUTION.md` and in the navigation settings. The photo appears at the curb-reference and destination scenes. Other segments use six distinct original, location-neutral SVG illustrations and an eight-second illustration-study clip. These are clearly labeled illustrative viewpoints, not photographs of Bentonville. One reference photograph does not depict every route segment; current conditions, real curb-ramp usability, and precise location alignment are not verified. No Google Street View recording was found or republished. Original team footage and per-clip calibration remain the next media upgrade.

### Reports and Route C

The AR Report action pauses playback and opens the existing `ReportDialog`. The shared reducer stores the session-only obstacle, selects Route C, and preserves the profile/preferences. A route-update transition replaces the AR sequence and map polyline. The demonstrated position is projected onto the predefined alternative; at the scripted reporting junction the B and C positions coincide. If playback was active before reporting, it resumes after the transition; the user can keep it paused. The scripted barrier waits for user action rather than claiming independent detection; Resume or Next can continue the sample walkthrough without filing a report. Restart navigation clears the example report and returns to the initial route preview (Route B after rerouting). Completion uses the existing Phase 1 arrival screen.

The mini-map reuses `MapView.tsx`; `progress` updates only its scripted position marker, while route selection/report changes update the same route geometry and hazard marker used elsewhere. Expanding the map pauses playback; returning restores the prior playback state without resetting the scene.

## Phase 3 · Cinematic presentation

The homepage adds a once-per-load sequential headline reveal, ambient navigation paths and pins, scroll-driven phone rotation, pointer tilt, and a coordinated phone-screen entry transition. The original Blender MP4, poster, and editable scene are reused unchanged. The phone presentation is a CSS/video hybrid; it does not load an interactive 3D model. Reduced motion uses the existing static poster and immediate navigation.

The scroll narrative mixes an animated barrier diagram, functional mobility-profile previews, a dark sticky visual-guidance showcase, and an interactive sample reroute. Fine-pointer devices receive a small cursor companion while retaining the native pointer, selective card tilt, magnetic homepage actions, and consistent press feedback. Touch and reduced-motion users receive predictable standard controls.

The application uses floating map controls, coordinated route-card reveals, hover-only map emphasis, animated preparation feedback, and native snapshot page transitions when supported. Existing selection, reporting, routing, history, and session recovery remain centralized in the original journey reducer.

Generate the original neutral scene artwork with `node scripts/create-illustrative-scenes.mjs`. With local Chrome available, `node scripts/prepare-transit-video.mjs` captures the transit illustration and encodes its compact study clip using the existing ffmpeg dependency. No Blender rendering or external imagery download is needed for these assets.

## Validation

The Playwright suite covers the full desktop journey, mobile route comparison, map markers, Route A/B selection, report-driven Route C, photo preview, arrival, reset, profile defaults, unsupported search, preference persistence, browser back, refresh recovery, and mobile map expansion. Automated axe checks cover the homepage, profiles, preferences, dashboard, route comparison, report modal, preparation, navigation preview, and arrival. Responsive visual checks cover 1440, 1280, 768, 390, and 320 pixels. Homepage video playback and pause/resume have their own browser check. AR tests also cover native video timing and seeking, automatic scene completion, paused-time stability, photo/SVG alignment in portrait and landscape, map expansion/return, in-AR reporting, Route C, restart, refresh recovery, unsupported speech synthesis, native frame-callback fallback, blocked autoplay, failed media, failed tiles, and invalid persisted scene indices. Speech queue/cancellation behavior is tested with a browser API stub; audible output depends on the host voice engine. These checks supplement visual inspection and do not claim comprehensive assistive-technology certification.

The Phase 3 production regression completed with **19 passing browser tests**. Its additional cases cover the cinematic entry, cursor and phone pointer interaction, home profile selection, interactive storytelling, free-form destination preservation, keyboard suggestions, hover-only map emphasis, and five distinct navigation media sources. A settled mobile map/route screen was also inspected separately to distinguish page-transition screenshot timing from the final layout.

Use `PATHABLE_BASE_URL=http://127.0.0.1:5174 npm test -- --workers=1` to run the same suite against a production preview server on port 5174. Visual evidence is saved in `tests/*.png`.
