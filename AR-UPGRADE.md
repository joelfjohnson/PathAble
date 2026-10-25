# AR navigation upgrade

Run `npm run dev` and follow the normal journey into visual navigation. Current preview: http://127.0.0.1:5174 (5173 was already occupied).

## What changed
- All eight scene IDs now have real Bentonville photographic backgrounds: five source photographs, with different framing and motion across stages. No stage depends on a remote image request during playback.
- Replaced flat illustration backgrounds in the normal flow. Local neutral illustrations remain only as an emergency fallback.
- Per-view ground paths, smooth arrow interpolation, a visible sample barricade, optional rest-stop annotation, dark translucent instruction cards, and a segmented journey timeline.
- Video is hidden until its first frame is ready, with a poster underneath. Failed/stalled video switches to its poster and the journey continues on the local clock. If both fail, the inline fallback still supports all controls.
- Existing Route A/B/C state, reporting, rerouting, voice, mini-map and arrival preserved. Homepage and general application styling untouched.

## Recording sequence
Select Manual wheelchair, choose preferences, keep the supported pickup-to-City-Square route, select Route B, start visual navigation. Play or advance through departure, intersection and curb ramp. At the barrier, report Construction and accept Route C. Continue through the alternative, north crossing and final approach to arrival. Restart resets the barrier and returns to Route B.

## Media limits
This is animated historical reference imagery, NOT a continuous filmed wheelchair trip. Some photographs recur with different framing. The exact camera viewpoints do not match every coordinate of the existing route. No live spatial tracking, current accessibility verification, or continuous first-person footage has been added. The in-app credits explain this. A geographically exact continuous sequence still requires licensed street-level coverage of that route or an actual recording. Do not describe this version as live AR in the competition video.

Image authors, links, licenses and adaptations are documented in public/ar/ATTRIBUTION.md and public/ar/source-manifest.json. CC BY-SA adaptations remain under that license; other imagery retains its source license.

## Verification
Existing AR browser suite: playback, seek, map, ramp, report, reroute, arrival, voice, mobile, refresh, reduced motion, media failure and autoplay recovery.
New ar-upgrade.spec.ts checks all eight backgrounds plus video-to-poster recovery.
Production build and lint checked. Existing map bundle-size warning remains.
