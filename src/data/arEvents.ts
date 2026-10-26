import type { RouteEvent } from "../types/ar";
export const arEvents: RouteEvent[] = [
  {
    id: "crossing-note",
    sceneId: "intersection",
    atSeconds: 2,
    kind: "guidance",
    title: "Approach the crossing",
    detail:
      "Look for the curb-ramp connection. Check local conditions as you travel.",
  },
  {
    id: "ramp-note",
    sceneId: "curb",
    atSeconds: 1,
    kind: "guidance",
    title: "Curb ramp along selected route",
    detail:
      "Check the curb-ramp connection and surrounding conditions as you travel.",
  },
  {
    id: "barrier-report",
    sceneId: "barrier",
    atSeconds: 1,
    kind: "report-opportunity",
    title: "Report an obstacle",
    detail:
      "Report an obstacle to try the alternative route, or continue.",
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
