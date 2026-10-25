import type { ARPlaybackState, ARControl } from "./ar";
export type Stage =
  | "home"
  | "profile"
  | "preferences"
  | "dashboard"
  | "processing"
  | "routes"
  | "prepare"
  | "navigation"
  | "arrived";
export type ProfileId =
  "manual" | "powered" | "walker" | "limited" | "temporary";
export type PreferenceId =
  | "stairs"
  | "slopes"
  | "ramps"
  | "curbs"
  | "uneven"
  | "smooth"
  | "crossings"
  | "elevators"
  | "seating"
  | "entrances"
  | "distance"
  | "construction";
export interface Route {
  id: "A" | "B" | "C";
  name: string;
  distance: number;
  minutes: number;
  description: string;
  features: string[];
  coordinates: [number, number][];
  steps: string[];
}
export interface Obstacle {
  type: string;
  description: string;
  image?: string;
  coordinates: [number, number];
}
export interface NavigationState {
  stage: Stage;
  profile: ProfileId;
  preferences: PreferenceId[];
  selectedRoute: Route["id"];
  currentStep: number;
  destination: { name: string; coordinates: [number, number] };
  obstacle: Obstacle | null;
  completed: boolean;
  ar: ARPlaybackState;
}
export type JourneyAction =
  | { type: "stage"; stage: Stage }
  | { type: "profile"; profile: ProfileId }
  | { type: "preference"; preference: PreferenceId }
  | { type: "route"; route: Route["id"] }
  | {
      type: "report";
      obstacle: Obstacle;
      fromNavigation?: boolean;
      resumePlayback?: boolean;
    }
  | { type: "nav-step"; index: number }
  | { type: "next" }
  | { type: "restart" }
  | {
      type: "ar-control";
      control: ARControl;
      elapsed?: number;
      expectedSceneIndex?: number;
      sceneIndex?: number;
    }
  | { type: "ar-tick"; elapsed: number; expectedSceneIndex: number }
  | { type: "ar-reroute-ready" }
  | { type: "ar-voice"; enabled: boolean };
