# PathAble recording readiness — October 25, 2026

## Audit evidence
Walked the whole app at 1920x1080: homepage, profile, preferences, destination, route comparison, preparation, visual navigation, barrier report, Route C and arrival. Captures: tests/audit-*.png. Four browser tests passed across journey.spec.ts and ar-upgrade.spec.ts, covering desktop/mobile, supported destinations, report/reroute/arrival, all eight scene backgrounds, and failed-video recovery. An initial test run failed because the preview server was stopped; starting the server resolved that environmental failure.

## Verdict
The current flow can be recorded successfully, but technical substance and visual coherence need a focused pass before the final competition recording. No winning outcome is guaranteed.

## Next implementation scope, in order
1. Build a small local graph for this single start/destination, using illustrative edge attributes. Run Dijkstra with hard constraints (stairs/blocked edges) and explainable penalties (incline/surface). Retain the current map and journey UI. Reports must block the associated edge and trigger an actual recomputation. No API key or backend required. Handle no-feasible-route explicitly.
2. Show why the recommendation changed: distance tradeoff, maximum modeled incline, steps/curb information and which preferences were applied. Distinguish modeled, unknown and verified information; no invented accessibility score or verification. Show available but unsupported preferences as unavailable for this dataset.
3. Improve map comparison: selected purple path, clearly visible dashed alternative, start/destination labels, report position and route-change animation. Compute distance from geometry or clearly identify modeled values. Keep instructions consistent with the displayed route.
4. Consolidate preparation into one useful screen. Increase the size of key metrics for video. Reduce repeated slogans and scope notices to concise contextual information plus accessible details.
5. Rework visual-navigation framing where arrows cross a curb, parked vehicle or disappear under controls. Use a few strong shots rather than presenting unrelated reference photographs as a continuous first-person trip. Keep a concise visual-navigation simulation label. Reports are user input, not automatic hazard detection.
6. Give arrival a clear outcome: destination, route traveled, reported barrier avoided. Avoid a map-loading transition dominating the final shot. Add a reset/rehearsal entry point that uses the same real app state.
7. Rehearse the exact recording path and freeze a checkpoint before recording. No added coverage, accounts or infrastructure needed for this scope.

Acceptance: changing the demonstrated constraint must change an actual computed route; the new route cannot include a reported blocked edge; route explanation must come from data; controls and report-to-arrival must work at recording resolution. Network failure must not prevent the supported local journey.

## Proposed 2m50 video
- 0:00–0:18 Names, app name, audience, purpose, and the concrete problem: a shorter route can be unusable for a wheelchair user.
- 0:18–0:38 Select manual wheelchair and show only the two or three constraints that actually affect this dataset.
- 0:38–1:08 Compare routes on the map. Explain why the computed recommendation is worth the extra distance, using actual model output.
- 1:08–1:28 Show a short visual-navigation sequence and ramp annotation; identify simulated/historical imagery once.
- 1:28–1:58 Report the sample barrier. Show the blocked segment, recomputation and the alternative on the map. This is the main demonstration payoff.
- 1:58–2:18 Continue and arrive. Show the concrete outcome.
- 2:18–2:40 Explain React/TypeScript, the local graph, routing algorithm and one real engineering difficulty. This segment depends on implementing the engine first; do not claim it before it exists.
- 2:40–2:50 State the current supported area, next expansion and concise closing.

Record actual interactions at 1920x1080. Use narration and captions; cut dead time without inventing actions or results. Keep the final export under three minutes. User-test feedback or quotations may be included only if actually obtained with permission.

## Team responsibilities
Main implementation owner: routing, explanations, map and recording reliability. Partner: obtain brief mobility-user feedback if available, prepare voiceover and screen recording, check registration and written answers. Use one editing owner for each code file to avoid conflicting changes.

## Submission references
Official 2026 rules: https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf
National source-code collection policy: https://www.congressionalappchallenge.us/congress/congressional-toolkit/
The video and written answers are reviewed; judges may request app/source access. National rules do not make a GitHub repository a universal submission component; district offices can collect code. Any Arkansas District 3 additions need separate confirmation.
The official rules list October 26, 2026 at noon EDT, which is 11 a.m. in Arkansas. Use that earlier published deadline rather than conflicting evening times on other offices' pages. Video must be public on YouTube or Vimeo; follow the form's instructions.
