import type { ARScene, ARPlaybackState, ARRouteId, Point } from "../types/ar";
import { arVisuals } from "./arVisuals";
import { sceneSequences, navigationInstructions } from "./navigationSteps";
import { routes } from "./journey";
import { progressAtCoordinate } from "../components/ar/geometry";
export const initialARState: ARPlaybackState = {
  started: false,
  playing: false,
  sceneIndex: 0,
  elapsed: 0,
  command: 0,
  voiceEnabled: false,
  rerouting: false,
  resumeAfterReroute: false,
  resumeProgress: 0,
};
export const photoMedia: ARScene["media"] = {
  type: "image",
  src: "/ar/scenes/bentonville-square.webp",
  width: 1600,
  height: 1200,
  alt: "Historical view of Bentonville Square, with a brick crossing, planted island, and courthouse.",
  isReference: true,
  credit: {
    author: "Brandonrush · 2013",
    source:
      "https://commons.wikimedia.org/wiki/File:Downtown_Bentonville,_AR.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    changes:
      "Resized, compressed, and presented with route-guidance overlays and gentle shared motion.",
  },
};
const forward: Point[] = [
  { x: 0.62, y: 0.98 },
  { x: 0.57, y: 0.85 },
  { x: 0.51, y: 0.72 },
  { x: 0.44, y: 0.67 },
  { x: 0.36, y: 0.63 },
  { x: 0.36, y: 0.6 },
];
const across: Point[] = [
  { x: 0.63, y: 0.98 },
  { x: 0.56, y: 0.83 },
  { x: 0.51, y: 0.72 },
  { x: 0.48, y: 0.69 },
  { x: 0.41, y: 0.66 },
  { x: 0.36, y: 0.62 },
];
const rampRegion: Point[] = [
  { x: 0.46, y: 0.685 },
  { x: 0.505, y: 0.675 },
  { x: 0.53, y: 0.696 },
  { x: 0.479, y: 0.712 },
];
const junction: [number, number] = [-94.21125, 36.372325];
export function getARScenes(routeId: ARRouteId, resumeProgress = 0): ARScene[] {
  const route = routes.find((r) => r.id === routeId)!;
  const joint = progressAtCoordinate(route, junction);
  const bRanges: [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ] = [
    [0, joint * 0.45],
    [joint * 0.45, joint * 0.9],
    [joint * 0.9, joint],
    [joint, joint],
    [joint, 1],
  ];
  const ids = sceneSequences[routeId];
  return ids.map((id, index) => {
    const definition = navigationInstructions[id];
    let progressStart = index / ids.length,
      progressEnd = (index + 1) / ids.length;
    if (routeId === "B") [progressStart, progressEnd] = bRanges[index];
    if (routeId === "C") {
      const begin = Math.max(0, Math.min(1, resumeProgress));
      progressStart = begin + ((1 - begin) * index) / ids.length;
      progressEnd = begin + ((1 - begin) * (index + 1)) / ids.length;
    }
    const visual = arVisuals[id];
    const points = visual?.points ?? (id === "curb" ? across : forward);
    return {
      id,
      ...definition,
      ...(routeId === "C" && index === 0 && resumeProgress < joint * 0.5
        ? {
            instruction:
              "Head west toward SW B Street, then follow the alternative pathway.",
          }
        : {}),
      durationSeconds: definition.duration,
      locationLabel: visual?.location ?? "Bentonville City Square reference",
      media:
        visual?.media ??
        (id === "curb"
          ? {
              ...photoMedia,
              type: "video",
              src: "/ar/videos/square-reference.mp4",
              poster: photoMedia.src,
            }
          : photoMedia),
      camera: visual?.camera ?? { zoom: 0.009 },
      pathPoints: points,
      pathKeyframes: [
        { time: 0, points },
        { time: definition.duration, points },
      ],
      progressStart,
      progressEnd,
      transition: id === "curb" ? "crossfade" : "forward",
      previousSceneId: ids[index - 1],
      nextSceneId: ids[index + 1],
      audioInstruction: definition.instruction,
      eventIds:
        id === "intersection"
          ? ["crossing-note"]
          : id === "curb"
            ? ["ramp-note"]
            : id === "barrier"
              ? ["barrier-report"]
              : id === "alternative"
                ? ["alternative-note"]
                : [],
      indicators:
        id === "curb"
          ? [
              {
                id: "sample-ramp",
                type: "curb-ramp",
                point: { x: 0.49, y: 0.69 },
                region: rampRegion,
                label: "Curb ramp along selected route",
                detail: "Curb-ramp details vary by location",
                from: 1,
                preference: "ramps",
              },
            ]
          : id === "barrier"
            ? [
                {
                  id: "sample-obstacle",
                  type: "construction",
                  point: { x: 0.39, y: 0.77 },
                  label: "Potential obstruction ahead",
                  detail: "Report an obstacle to update your route",
                  from: 1,
                },
              ]
            : id === "square"
              ? [
                  {
                    id: "destination",
                    type: "entrance",
                    point: { x: 0.31, y: 0.6 },
                    label: "Bentonville City Square",
                    detail: "Destination",
                    from: 0,
                  },
                ]
              : id === "depart"
                ? [
                    {
                      id: "surface",
                      type: "surface",
                      point: { x: 0.53, y: 0.75 },
                      label: "Your pathway preferences",
                      detail: "Smoother surfaces prioritized",
                      from: 3,
                      until: 7,
                      preference: "smooth",
                    },
                  ]
                : id === "alternative"
                  ? [
                      {
                        id: "rest-stop",
                        type: "rest",
                        point: { x: 0.72, y: 0.92 },
                        label: "Rest stop",
                        detail: "Availability varies by location",
                        from: 2,
                        until: 6,
                        preference: "seating",
                      },
                    ]
                  : [],
    };
  });
}
