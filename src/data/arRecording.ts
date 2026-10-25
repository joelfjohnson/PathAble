import type { ARScene, PathKeyframe, Point } from "../types/ar";

/** Source timestamps are seconds in the supplied 41-second recording.
 * The main route is chronological. The alternate route reuses the closing
 * viewpoints; it is a scripted branch, not evidence of a different street. */
export const recordingSegments = {
  depart: [0, 8, 8],
  intersection: [8, 16, 8],
  curb: [16, 24, 8],
  barrier: [24, 34, 10],
  alternative: [24, 28, 8],
  "north-crossing": [28, 32, 8],
  rejoin: [32, 34, 8],
  square: [34, 41, 7],
} as const;

// Hand-authored image coordinates. The source camera moves in the roadway,
// so these are illustrative sidewalk guides, never tracked ground geometry.
const ribbon = (side: "left" | "right", horizon = 0.54): Point[] => {
  const xs =
    side === "right"
      ? [0.97, 0.88, 0.77, 0.68, 0.61]
      : [0.22, 0.29, 0.37, 0.43, 0.48];
  return xs.map((x, i) => ({ x, y: [0.96, 0.81, 0.69, 0.6, horizon][i] }));
};
const poses: Record<string, [number, "left" | "right", number?][]> = {
  depart: [
    [0, "right"],
    [3, "right", 0.49],
    [8, "right", 0.52],
  ],
  intersection: [
    [0, "right"],
    [2, "right", 0.65],
    [3.5, "left", 0.62],
    [5, "left", 0.55],
    [6.5, "right"],
    [8, "right"],
  ],
  curb: [
    [0, "right"],
    [3, "right", 0.56],
    [4.5, "left", 0.56],
    [8, "left", 0.53],
  ],
  barrier: [
    [0, "left", 0.6],
    [3, "left"],
    [6, "left", 0.51],
    [10, "left", 0.53],
  ],
  alternative: [
    [0, "left", 0.6],
    [6, "left"],
    [8, "left", 0.52],
  ],
  "north-crossing": [
    [0, "left", 0.52],
    [8, "left", 0.51],
  ],
  rejoin: [
    [0, "left", 0.51],
    [8, "left", 0.53],
  ],
  square: [
    [0, "left", 0.53],
    [3, "left", 0.51],
    [7, "left", 0.51],
  ],
};
export function recordingKeyframes(id: string): PathKeyframe[] {
  return poses[id].map(([time, side, horizon]) => ({
    time,
    points: ribbon(side, horizon),
  }));
}
export function recordingMedia(id: string): ARScene["media"] {
  return {
    type: "video",
    src: `/ar/videos/ar-recording-${id}.mp4`,
    poster: `/ar/videos/ar-recording-${id}.jpg`,
    width: 1280,
    height: 674,
    alt: "User-supplied Bentonville Street View screen recording. Scripted navigation preview; not live or wheelchair-height footage.",
    isReference: true,
    preserveFullFrame: true,
    sourceLabel: "Google Street View recording · simulated guidance",
  };
}

// Third-party rights have not been established. Keep the supplied recording
// in local development; release builds retain the licensed reference assets.
export const useLocalRecording = import.meta.env.DEV;
