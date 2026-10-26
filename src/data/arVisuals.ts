import type { ARScene, Point } from "../types/ar";
// Per-view ground coordinates share the media transform; no GPS anchoring is implied.
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
      width: 1600,
      height: 1200,
      alt: "Bentonville City Square brick crossing and planted island, 2013.",
      isReference: true,
      credit: {
        author: "Brandonrush · 2013",
        source:
          "https://commons.wikimedia.org/wiki/File:Downtown_Bentonville,_AR.jpg",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
        changes: "Resized; animated framing and route-guidance overlays.",
      },
      poster: "/ar/scenes/bentonville-square.webp",
    },
    points: [
      {
        x: 0.77,
        y: 0.99,
      },
      {
        x: 0.64,
        y: 0.87,
      },
      {
        x: 0.51,
        y: 0.73,
      },
      {
        x: 0.49,
        y: 0.69,
      },
      {
        x: 0.44,
        y: 0.65,
      },
      {
        x: 0.35,
        y: 0.6,
      },
    ],
    location: "City Square · brick pathway",
    camera: {
      zoom: 0.13,
      panX: -0.015,
      panY: -0.008,
    },
  },
  intersection: {
    media: {
      type: "image",
      src: "/ar/scenes/massey.jpg",
      width: 1920,
      height: 1440,
      alt: "Historic Hotel Massey in Bentonville, Arkansas",
      isReference: true,
      credit: {
        author: "Brandonrush",
        source: "https://commons.wikimedia.org/wiki/File:Hotel_Massey.jpg",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
        changes:
          "Resized; animated framing and route-guidance overlays. Historical reference, not a recording of this route.",
      },
    },
    points: [
      {
        x: 0.98,
        y: 0.88,
      },
      {
        x: 0.84,
        y: 0.875,
      },
      {
        x: 0.7,
        y: 0.887,
      },
      {
        x: 0.57,
        y: 0.9,
      },
      {
        x: 0.43,
        y: 0.915,
      },
      {
        x: 0.29,
        y: 0.93,
      },
    ],
    location: "Central Avenue · Massey corner",
    camera: {
      zoom: 0.12,
      panX: 0.025,
    },
  },
  curb: {
    media: {
      type: "image",
      src: "/ar/scenes/bentonville-square.webp",
      width: 1600,
      height: 1200,
      alt: "Bentonville City Square brick crossing and planted island, 2013.",
      isReference: true,
      credit: {
        author: "Brandonrush · 2013",
        source:
          "https://commons.wikimedia.org/wiki/File:Downtown_Bentonville,_AR.jpg",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
        changes: "Resized; animated framing and route-guidance overlays.",
      },
    },
    points: [
      {
        x: 0.77,
        y: 0.99,
      },
      {
        x: 0.64,
        y: 0.87,
      },
      {
        x: 0.51,
        y: 0.73,
      },
      {
        x: 0.49,
        y: 0.69,
      },
      {
        x: 0.44,
        y: 0.65,
      },
      {
        x: 0.35,
        y: 0.6,
      },
    ],
    location: "Square crossing · ramp connection",
    camera: {
      zoom: 0.22,
      panX: -0.025,
      panY: -0.01,
    },
  },
  barrier: {
    media: {
      type: "image",
      src: "/ar/scenes/walton.jpg",
      width: 1920,
      height: 1276,
      alt: "Walton five and dime Bentonville AR",
      isReference: true,
      credit: {
        author: "Russ",
        source:
          "https://commons.wikimedia.org/wiki/File:Walton_five_and_dime_Bentonville_AR_(14292373504).jpg",
        license: "CC BY 2.0",
        licenseUrl: "https://creativecommons.org/licenses/by/2.0",
        changes:
          "Resized; animated framing and route-guidance overlays. Historical reference, not a recording of this route.",
      },
    },
    points: [
      {
        x: 0.22,
        y: 0.87,
      },
      {
        x: 0.28,
        y: 0.84,
      },
      {
        x: 0.33,
        y: 0.81,
      },
      {
        x: 0.37,
        y: 0.79,
      },
      {
        x: 0.39,
        y: 0.77,
      },
    ],
    location: "Main Street · storefront pathway",
    camera: {
      zoom: 0.12,
      panX: 0.02,
    },
  },
  alternative: {
    media: {
      type: "image",
      src: "/ar/scenes/roy.jpg",
      width: 1920,
      height: 1442,
      alt: "Roy's Office Supply Building in Bentonville, Arkansas",
      isReference: true,
      credit: {
        author: "Brandonrush",
        source:
          "https://commons.wikimedia.org/wiki/File:Roy%27s_Office_Supply_Building.jpg",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
        changes:
          "Resized; animated framing and route-guidance overlays. Historical reference, not a recording of this route.",
      },
    },
    points: [
      {
        x: 0.98,
        y: 0.97,
      },
      {
        x: 0.87,
        y: 0.95,
      },
      {
        x: 0.76,
        y: 0.93,
      },
      {
        x: 0.66,
        y: 0.915,
      },
      {
        x: 0.56,
        y: 0.9,
      },
      {
        x: 0.49,
        y: 0.89,
      },
    ],
    location: "Main Street · alternative sidewalk",
    camera: {
      zoom: 0.14,
      panX: -0.025,
    },
  },
  "north-crossing": {
    media: {
      type: "image",
      src: "/ar/scenes/terry.jpg",
      width: 1920,
      height: 1439,
      alt: "Terry Block Building in Bentonville, Arkansas NRHP: 82004613.",
      isReference: true,
      credit: {
        author: "Brandonrush",
        source:
          "https://commons.wikimedia.org/wiki/File:Terry_Block_Building.jpg",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
        changes:
          "Resized; animated framing and route-guidance overlays. Historical reference, not a recording of this route.",
      },
    },
    points: [
      {
        x: 0.39,
        y: 0.99,
      },
      {
        x: 0.4,
        y: 0.93,
      },
      {
        x: 0.41,
        y: 0.87,
      },
      {
        x: 0.43,
        y: 0.84,
      },
      {
        x: 0.49,
        y: 0.845,
      },
      {
        x: 0.6,
        y: 0.86,
      },
    ],
    location: "Central & Main · corner connection",
    camera: {
      zoom: 0.13,
      panX: -0.02,
    },
  },
  rejoin: {
    media: {
      type: "image",
      src: "/ar/scenes/walton.jpg",
      width: 1920,
      height: 1276,
      alt: "Walton five and dime Bentonville AR",
      isReference: true,
      credit: {
        author: "Russ",
        source:
          "https://commons.wikimedia.org/wiki/File:Walton_five_and_dime_Bentonville_AR_(14292373504).jpg",
        license: "CC BY 2.0",
        licenseUrl: "https://creativecommons.org/licenses/by/2.0",
        changes:
          "Resized; animated framing and route-guidance overlays. Historical reference, not a recording of this route.",
      },
    },
    points: [
      {
        x: 0.2,
        y: 0.88,
      },
      {
        x: 0.27,
        y: 0.85,
      },
      {
        x: 0.33,
        y: 0.82,
      },
      {
        x: 0.38,
        y: 0.79,
      },
      {
        x: 0.41,
        y: 0.77,
      },
    ],
    location: "West side of City Square",
    camera: {
      zoom: 0.19,
      panX: 0.025,
    },
  },
  square: {
    media: {
      type: "image",
      src: "/ar/scenes/bentonville-square.webp",
      width: 1600,
      height: 1200,
      alt: "Bentonville City Square brick crossing and planted island, 2013.",
      isReference: true,
      credit: {
        author: "Brandonrush · 2013",
        source:
          "https://commons.wikimedia.org/wiki/File:Downtown_Bentonville,_AR.jpg",
        license: "CC BY-SA 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
        changes: "Resized; animated framing and route-guidance overlays.",
      },
    },
    points: [
      {
        x: 0.77,
        y: 0.99,
      },
      {
        x: 0.64,
        y: 0.87,
      },
      {
        x: 0.51,
        y: 0.73,
      },
      {
        x: 0.49,
        y: 0.69,
      },
      {
        x: 0.44,
        y: 0.65,
      },
      {
        x: 0.35,
        y: 0.6,
      },
    ],
    location: "Bentonville City Square",
    camera: {
      zoom: 0.1,
      panX: 0.02,
    },
  },
};
