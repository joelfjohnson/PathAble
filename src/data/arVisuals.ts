import type { ARScene, Point } from "../types/ar";
const neutral = (file: string, alt: string): ARScene["media"] => ({
  type: "image",
  src: `/ar/scenes/${file}.svg`,
  width: 1600,
  height: 1200,
  alt,
  isReference: false,
});
const straight: Point[] = [
  { x: 0.54, y: 0.99 },
  { x: 0.53, y: 0.86 },
  { x: 0.53, y: 0.73 },
  { x: 0.53, y: 0.62 },
  { x: 0.53, y: 0.51 },
  { x: 0.53, y: 0.445 },
];
const crossing: Point[] = [
  { x: 0.51, y: 0.98 },
  { x: 0.49, y: 0.84 },
  { x: 0.5, y: 0.72 },
  { x: 0.56, y: 0.66 },
  { x: 0.62, y: 0.61 },
  { x: 0.66, y: 0.56 },
];
const alternative: Point[] = [
  { x: 0.54, y: 0.99 },
  { x: 0.55, y: 0.87 },
  { x: 0.57, y: 0.75 },
  { x: 0.6, y: 0.64 },
  { x: 0.62, y: 0.53 },
  { x: 0.63, y: 0.45 },
];
export const arVisuals: Record<
  string,
  {
    media: ARScene["media"];
    points: Point[];
    location: string;
    camera: NonNullable<ARScene["camera"]>;
  }
> = {
  depart: {
    media: {
      type: "video",
      src: "/ar/videos/square-reference.mp4",
      poster: "/ar/scenes/bentonville-square.webp",
      width: 1600,
      height: 1200,
      alt: "Historical Bentonville Square reference video from 2013 with an illustrative navigation overlay.",
      isReference: true,
      credit: {
        author: "Brandonrush · 2013",
        source:
          "https://commons.wikimedia.org/wiki/File:Downtown_Bentonville,_AR.jpg",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
        changes:
          "Presented as an eight-second reference clip with an illustrative navigation overlay.",
      },
    },
    points: straight,
    location: "Bentonville Square reference",
    camera: { zoom: 0.025, panY: -0.005 },
  },
  intersection: {
    media: neutral(
      "crossing",
      "Original illustration of an approaching street crossing.",
    ),
    points: crossing,
    location: "Approaching the sample crossing",
    camera: { zoom: 0.02, panX: -0.005 },
  },
  barrier: {
    media: neutral(
      "barrier",
      "Original illustration of a sample obstruction and construction cones ahead.",
    ),
    points: [
      { x: 0.54, y: 0.99 },
      { x: 0.53, y: 0.86 },
      { x: 0.53, y: 0.75 },
      { x: 0.54, y: 0.68 },
      { x: 0.55, y: 0.63 },
    ],
    location: "Sample barrier at the route junction",
    camera: { zoom: 0.018, panY: -0.004 },
  },
  alternative: {
    media: neutral(
      "alternative",
      "Original illustrative view of the alternative pathway beside a planted area.",
    ),
    points: alternative,
    location: "Alternative pathway",
    camera: { zoom: 0.025, panX: -0.006 },
  },
  "north-crossing": {
    media: neutral(
      "north-crossing",
      "Original illustrative view of a northern crossing with a park pavilion.",
    ),
    points: crossing,
    location: "Northern sample crossing",
    camera: { zoom: 0.018, panX: 0.006 },
  },
  rejoin: {
    media: neutral(
      "avenue",
      "Original illustration of the final curved pathway toward a park entrance.",
    ),
    points: alternative,
    location: "The final approach",
    camera: { zoom: 0.024, panY: -0.006 },
  },
};
