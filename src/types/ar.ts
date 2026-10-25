import type { PreferenceId, Route } from "./journey";
export interface Point {
  x: number;
  y: number;
}
export type AnnotationType =
  | "curb-ramp"
  | "incline"
  | "surface"
  | "construction"
  | "entrance"
  | "rest"
  | "elevator"
  | "stairs"
  | "obstacle";
export interface ARIndicator {
  id: string;
  type: AnnotationType;
  point: Point;
  label: string;
  detail: string;
  from: number;
  until?: number;
  preference?: PreferenceId;
  region?: Point[];
}
export interface PathKeyframe {
  time: number;
  points: Point[];
}
export interface ARScene {
  id: string;
  title: string;
  locationLabel: string;
  instruction: string;
  distanceLabel: string;
  media: {
    type: "image" | "video";
    src: string;
    poster?: string;
    width: number;
    height: number;
    alt: string;
    credit?: {
      author: string;
      source: string;
      license: string;
      licenseUrl: string;
      changes: string;
    };
    isReference: boolean;
  };
  durationSeconds: number;
  camera?: { zoom?: number; panX?: number; panY?: number };
  pathPoints: Point[];
  pathKeyframes?: PathKeyframe[];
  indicators: ARIndicator[];
  progressStart: number;
  progressEnd: number;
  turn: "straight" | "right" | "left" | "arrive";
  transition: "crossfade" | "forward";
  nextSceneId?: string;
  previousSceneId?: string;
  audioInstruction?: string;
  eventIds: string[];
}
export interface ARPlaybackState {
  started: boolean;
  playing: boolean;
  sceneIndex: number;
  elapsed: number;
  command: number;
  voiceEnabled: boolean;
  rerouting: boolean;
  resumeAfterReroute: boolean;
  resumeProgress: number;
}
export type ARControl =
  "start" | "play" | "pause" | "next" | "previous" | "restart" | "seek";
export interface RouteEvent {
  id: string;
  sceneId: string;
  atSeconds: number;
  kind: "guidance" | "report-opportunity";
  title: string;
  detail: string;
}
export type ARRouteId = Route["id"];
