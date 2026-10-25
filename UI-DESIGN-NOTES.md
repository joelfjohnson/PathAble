# PathAble visual redesign — October 25, 2026

## Reference research

CropIntel public site: https://cropintel.org/
Official 2025 AR03 winner: https://www.congressionalappchallenge.us/25-ar03/
Additional winner context: https://katherineclark.house.gov/2024/12/16/2024-12-whip-clark-announces-congressional-app-challenge-winner/ and https://www.congressionalappchallenge.us/24-wa02/

Inspected CropIntel's desktop and narrow-screen opening, workflow sections, product illustration, crop selector, FAQ expansion, scanner entry/sign-in, and diagnosis disclaimer. Scanner/private features require an account; these were not tested. Current design is not evidence of its exact competition-era appearance. The winner announcement does not establish that aesthetics caused the win. Other winner sources were contextual research, not full UI walkthroughs.

Useful patterns: one coherent visual theme, readable hierarchy, product-relevant imagery, a clear primary action, interactive explanations, generous spacing, and boundaries on product claims. No source code, branding, assets, endorsements, or customer logos were copied from CropIntel.

## Implementation

Replaced the active Home component with an original wayfinding design: ivory, deep green ink, purple route highlights, editorial typography, interactive shortest/step-free route comparison, mobility profile selector, local photo, FAQ, and a concise final action. The preview uses the project's actual local route coordinates/distances with illustrative cartography. The existing local photo remains credited under its existing license.

Applied the same visual system across profile, preferences, route comparison, navigation, reporting, and arrival. Removed magnetic/tilt pointer effects from the active app and retired the old landing-page phone/decoration sequence. Motion is limited to short section entrances, route drawing, disclosure feedback, and state transitions, with reduced-motion support.

No new package, subscription, API key, billing service, or paid asset was introduced. Existing route logic, reports, panorama links and session persistence remain in place.

## Validation

Production build and lint checks; browser walkthrough of landing interactions, onboarding, route selection, report/reroute, navigation and arrival; responsive review at a narrow viewport. The historical UI test suite still contains old landing/AR selectors and is not a claim of complete regression coverage.
