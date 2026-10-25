import type { ProfileId, PreferenceId, Route } from "../types/journey";
export const profiles: {
  id: ProfileId;
  name: string;
  description: string;
  detail: string;
}[] = [
  {
    id: "manual",
    name: "Manual wheelchair",
    description: "Smoother surfaces. Gentler slopes.",
    detail: "Step-free paths, curb ramps, and less effort along the way.",
  },
  {
    id: "powered",
    name: "Powered wheelchair",
    description: "Space to move with confidence.",
    detail: "Pathway width, smooth surfaces, and accessible entrances.",
  },
  {
    id: "walker",
    name: "Walker or cane",
    description: "A steadier, more comfortable journey.",
    detail: "Even pathways, manageable inclines, and places to rest.",
  },
  {
    id: "limited",
    name: "Limited walking mobility",
    description: "A little less distance. More comfort.",
    detail: "Shorter journeys, fewer elevation changes, and rest stops.",
  },
  {
    id: "temporary",
    name: "Temporary mobility restrictions",
    description: "Support for where you are today.",
    detail: "Adjust each preference to suit your recovery and comfort.",
  },
];
export const groups: {
  name: string;
  items: { id: PreferenceId; label: string }[];
}[] = [
  {
    name: "Pathway conditions",
    items: [
      { id: "stairs", label: "Avoid stairs" },
      { id: "slopes", label: "Avoid steep inclines" },
      { id: "ramps", label: "Require curb ramps" },
      { id: "curbs", label: "Avoid high curbs" },
      { id: "uneven", label: "Avoid uneven sidewalks" },
      { id: "smooth", label: "Prefer smooth pavement" },
    ],
  },
  {
    name: "Comfort & convenience",
    items: [
      { id: "crossings", label: "Minimize street crossings" },
      { id: "seating", label: "Include seating and rest stops" },
      { id: "distance", label: "Minimize travel distance" },
    ],
  },
  {
    name: "Accessibility infrastructure",
    items: [
      { id: "elevators", label: "Prefer elevators where needed" },
      { id: "entrances", label: "Prefer accessible entrances" },
      { id: "construction", label: "Avoid reported construction" },
    ],
  },
];
export const defaults: Record<ProfileId, PreferenceId[]> = {
  manual: ["stairs", "slopes", "ramps", "curbs", "smooth"],
  powered: ["stairs", "ramps", "smooth", "entrances"],
  walker: ["uneven", "slopes", "seating"],
  limited: ["distance", "seating", "slopes"],
  temporary: ["stairs", "smooth", "seating"],
};
export const start: [number, number] = [-94.21018, 36.37148];
export const destination: [number, number] = [-94.20862, 36.37265];
export const hazard: [number, number] = [-94.20955, 36.372325];
export const routes: Route[] = [
  {
    id: "A",
    name: "Shortest route",
    distance: 320,
    minutes: 5,
    description: "A shorter journey with an illustrative steep-slope concern.",
    features: [
      "Shorter distance",
      "Example steep incline",
      "2 sample crossings",
    ],
    coordinates: [
      start,
      [-94.21018, 36.372325],
      [-94.20886, 36.372325],
      [-94.20886, 36.37265],
      destination,
    ],
    steps: [
      "Head north along the sample pathway.",
      "Turn right toward the square.",
      "Continue to Bentonville City Square.",
    ],
  },
  {
    id: "B",
    name: "Accessibility-focused",
    distance: 410,
    minutes: 7,
    description: "A little farther. Designed around a gentler sample pathway.",
    features: [
      "Gentler sample slopes",
      "Step-free example path",
      "Example curb ramps",
    ],
    coordinates: [
      start,
      [-94.21125, 36.37148],
      [-94.21125, 36.372325],
      [-94.20886, 36.372325],
      [-94.20886, 36.37265],
      destination,
    ],
    steps: [
      "Head west toward SW B Street.",
      "Turn right and continue north.",
      "Turn right toward the square, using the example curb ramp.",
      "Continue to Bentonville City Square.",
    ],
  },
  {
    id: "C",
    name: "Alternative accessible route",
    distance: 490,
    minutes: 9,
    description:
      "A predefined alternative that avoids the reported example barrier.",
    features: [
      "Avoids reported barrier",
      "Step-free example path",
      "Longer sample journey",
    ],
    coordinates: [
      start,
      [-94.21125, 36.37148],
      [-94.21125, 36.37296],
      [-94.20886, 36.37296],
      [-94.20886, 36.37265],
      destination,
    ],
    steps: [
      "Head west toward SW B Street.",
      "Continue north past the example barrier.",
      "Turn right along the alternative pathway.",
      "Enter Bentonville City Square from the north.",
    ],
  },
];
