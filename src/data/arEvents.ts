import type { RouteEvent } from "../types/ar";
export const arEvents: RouteEvent[] = [
  {
    id: "crossing-note",
    sceneId: "intersection",
    atSeconds: 2,
    kind: "guidance",
    title: "Approach the sample crossing",
    detail:
      "Look for the illustrated curb-ramp connection. Conditions are not verified.",
  },
  {
    id: "ramp-note",
    sceneId: "curb",
    atSeconds: 1,
    kind: "guidance",
    title: "Curb ramp along selected route",
    detail:
      "A visual example of infrastructure guidance, not an accessibility assessment.",
  },
  {
    id: "barrier-report",
    sceneId: "barrier",
    atSeconds: 1,
    kind: "report-opportunity",
    title: "An example barrier ahead",
    detail:
      "Report a sample obstruction to try Route C, or continue this walkthrough.",
  },
  {
    id: "alternative-note",
    sceneId: "alternative",
    atSeconds: 0,
    kind: "guidance",
    title: "Follow the updated route",
    detail:
      "Route C uses the predefined alternative. Your mobility preferences are retained.",
  },
];
