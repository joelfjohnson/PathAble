import type { ARRouteId } from "../types/ar";
export const sceneSequences: Record<ARRouteId, string[]> = {
  A: ["depart", "intersection", "square"],
  B: ["depart", "intersection", "curb", "barrier", "square"],
  C: ["alternative", "north-crossing", "rejoin", "square"],
};
export const navigationInstructions: Record<
  string,
  {
    title: string;
    instruction: string;
    distanceLabel: string;
    turn: "straight" | "right" | "left" | "arrive";
    duration: number;
  }
> = {
  depart: {
    title: "A little more freedom.",
    instruction: "Continue along the highlighted sidewalk.",
    distanceLabel: "Next turn · about 90 m",
    turn: "straight",
    duration: 8,
  },
  intersection: {
    title: "Your next turn, clearly ahead.",
    instruction: "Turn right at the sample crossing.",
    distanceLabel: "Crossing · about 25 m",
    turn: "right",
    duration: 8,
  },
  curb: {
    title: "The details that matter.",
    instruction: "Follow the illustrated curb-ramp connection.",
    distanceLabel: "Curb ramp · example location",
    turn: "left",
    duration: 8,
  },
  barrier: {
    title: "A change in the path.",
    instruction: "An example obstruction is ahead.",
    distanceLabel: "Sample barrier · ahead",
    turn: "straight",
    duration: 10,
  },
  alternative: {
    title: "A new way forward.",
    instruction: "Continue north along the alternative pathway.",
    distanceLabel: "Route C · alternative selected",
    turn: "straight",
    duration: 8,
  },
  "north-crossing": {
    title: "Room for a different route.",
    instruction: "Turn right at the northern sample crossing.",
    distanceLabel: "Next crossing · about 30 m",
    turn: "right",
    duration: 8,
  },
  rejoin: {
    title: "Back on your way.",
    instruction: "Follow the updated pathway toward the square.",
    distanceLabel: "Destination · about 60 m",
    turn: "right",
    duration: 8,
  },
  square: {
    title: "Your destination is ahead.",
    instruction: "Continue to Bentonville City Square.",
    distanceLabel: "Bentonville City Square · ahead",
    turn: "arrive",
    duration: 7,
  },
};
