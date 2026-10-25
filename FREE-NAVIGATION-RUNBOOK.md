# Free navigation pilot — recording guide

This version uses OpenFreeMap/MapLibre and local route calculation. It does not require a Google API key, billing account, paid tiles, or a backend. Do not configure a billable Maps API for this build.

## Start

Run `npm install` if dependencies are missing, then `npm run dev`. Use the localhost URL printed by Vite.

## Recording sequence

1. Start navigating; choose Manual wheelchair.
2. Review mobility preferences. Unmapped settings are disabled.
3. Keep the featured downtown pickup and Bentonville City Square destination.
4. Find accessible routes. Show the shorter option and explain why Route B is recommended.
5. Continue with Route B. Show the numbered instructions, distance, position marker, and complete route.
6. Use Next direction; optionally Read instruction. Click a map location and Open Google Street View to explore real imagery in Google Maps. Return to the PathAble tab afterwards.
7. Report a barrier and submit. Route C is computed with the reported segment excluded. This recalculation starts from the original pickup, not a live GPS position.
8. Step through the alternative and Finish route to show arrival.

## What is implemented

A local graph and Dijkstra route search; stair/ramp exclusions and slope/surface penalties; obstacle exclusion; coordinate-derived distances; selectable directions; spoken instructions where supported; session-local reports; responsive map and external panorama links.

## Scope to describe accurately

This is a small Bentonville route pilot with modeled accessibility attributes. The transit pickup is illustrative. No field verification or live GPS is provided. Street View opens externally and depends on coverage; it is historical panoramic imagery, not live AR. The former photo-based AR screen is no longer the active navigation experience. Genuine camera alignment remains future work.

## Verification

`npm run build`
`npm run lint`
`npx playwright test tests/free-navigation.spec.ts --workers=1`

If using a non-default server port, set PATHABLE_BASE_URL before running Playwright. The new focused tests cover graph constraints, unreachable destinations, obstacle rerouting, the complete walkthrough, session restoration and mobile width. Older AR/video-specific UI tests describe the replaced screen and require migration before using the entire historical suite as a release gate.

## Before recording

Manually open each Street View link and check coverage/direction. No key or payment is required. If imagery is unavailable at a sidewalk point, choose a nearby street point on the map. Keep claims limited to what the recording actually demonstrates. A brief review by someone who uses a wheelchair would help validate clarity; do not label modeled routes verified or safe based only on imagery.
