# PathAble — first draft and video run

Project: `C:\Users\pvish\Documents\Coding\Congressional App Challenge 2026`

## Open the first draft

Run `npm run dev -- --host 127.0.0.1` from this folder, then open http://127.0.0.1:5173 . The server may already be running. Refresh the page to load the latest layout. Session recovery preserves your current screen; click the PathAble logo to return home.

## What changed in this draft

- Added a four-step journey indicator: Mobility, Preferences, Route, Navigate.
- Reorganized the map panel into a scrolling content area and a persistent action area. Continue, start navigation, and report actions stay within reach.
- Made route cards more compact and improved text hierarchy, secondary-label contrast, and spacing.
- Replaced decorative map copy with the actual destination, selected route, time estimate and mobility profile.
- Reworked the mobile experience as a map with an expandable journey sheet. The main action remains visible while its content scrolls.
- Kept the original Blender phone scene, animated homepage, shared journey state and existing AR walkthrough.
- Made Playwright's browser selection work on Windows, macOS and systems with Playwright-managed browsers. PATHABLE_BROWSER_PATH can override discovery.

## Recommended recording sequence

1. Start on the homepage. Allow the existing phone animation and headline to settle.
2. Select Start navigating.
3. Select Manual wheelchair, then Make it yours.
4. Show Avoid stairs, Avoid steep inclines, and Require curb ramps. Optionally show another preference section. Select Let's find your way.
5. Keep Downtown transit pickup -> Bentonville City Square. This is the supported journey; arbitrary search text does not enable additional routes.
6. Select Find accessible routes. Route B should be recommended with the default profile.
7. Compare Route A (320 m) and Route B (410 m). Select B. Use Pathway details to explain how the scenario relates to preferences.
8. Select Continue with route B, then Start navigation preview, then Start AR journey.
9. Pause and advance instructions if desired. At the barrier, use Report, select Construction, and submit. Route C is the predefined alternative (490 m).
10. Continue the updated journey and use Complete journey to reach the arrival screen.

The report can also be shown on the route-comparison screen before entering navigation. That shorter sequence has an existing automated desktop test.

## Accurate description for the video

This is a working frontend for one supported journey with local route alternatives, persistent session state, preference-based route selection, reporting, and a visual walkthrough. The geographic basemap is real. Distances, accessibility attributes, pickup location and visual progress are illustrative. There is no surveyed sidewalk database, real-time GPS, live camera AR or public reporting backend. The first visual-navigation scene includes a credited historical reference image; other views are original illustrations. Keep the existing media credits and relevant labels.

## Checks

`npm run build`, `npm run lint`, and `npm test -- tests/journey.spec.ts --workers=1`.

Targeted accessibility and in-AR rerouting checks are in `tests/accessibility.spec.ts` and `tests/ar-navigation.spec.ts`. Current visual evidence is in `tests/routes-desktop.png` and `tests/routes-mobile.png`.

## Partner's useful next work

Rehearse this run, draft narration around visible behavior, and obtain permission-cleared real footage if available. Replacing illustrated viewpoints with accurately aligned team footage would improve the presentation more than generating another decorative 3D model. Coordinate edits to shared route and AR data before changing those files.

No GitHub push or public deployment was performed in this task. The pre-existing package-lock modification was preserved.
