import { solveRoute } from "../lib/routing";
import { useEffect, useReducer, useRef } from "react";
import { defaults, destination, routes } from "../data/journey";
import type { JourneyAction, NavigationState } from "../types/journey";
import { getARScenes, initialARState } from "../data/arScenes";
import {
  clamp,
  pointAlongRoute,
  progressAtCoordinate,
  sceneRouteProgress,
} from "../components/ar/geometry";
export const initialState: NavigationState = {
  stage: "home",
  profile: "manual",
  preferences: defaults.manual,
  selectedRoute: "B",
  currentStep: 0,
  destination: { name: "Bentonville City Square", coordinates: destination },
  obstacle: null,
  completed: false,
  ar: initialARState,
};
export function journeyReducer(
  state: NavigationState,
  action: JourneyAction,
): NavigationState {
  switch (action.type) {
    case "stage":
      return {
        ...state,
        stage: action.stage,
        completed: action.stage === "arrived" ? true : state.completed,
        ar:
          action.stage !== "navigation"
            ? { ...state.ar, playing: false }
            : state.ar,
      };
    case "profile":
      return {
        ...state,
        profile: action.profile,
        preferences: defaults[action.profile],
      };
    case "preference":
      return {
        ...state,
        preferences: state.preferences.includes(action.preference)
          ? state.preferences.filter((p) => p !== action.preference)
          : [...state.preferences, action.preference],
      };
    case "route":
      return {
        ...state,
        selectedRoute: action.route,
        currentStep: 0,
        completed: false,
        ar: { ...initialARState, voiceEnabled: state.ar.voiceEnabled },
      };
    case "nav-step":
      return {
        ...state,
        currentStep: Math.max(
          0,
          Math.min(
            Math.trunc(action.index) || 0,
            routes.find((r) => r.id === state.selectedRoute)!.coordinates
              .length - 2,
          ),
        ),
      };
    case "report": {
      const solved = solveRoute(state.preferences, true);
      if (!solved) return state;
      const oldRoute = routes.find((r) => r.id === state.selectedRoute)!;
      const oldScene = getARScenes(
        state.selectedRoute,
        state.ar.resumeProgress,
      )[state.ar.sceneIndex];
      const progress = oldScene
        ? sceneRouteProgress(oldScene, state.ar.elapsed)
        : 0;
      const resumeProgress = progressAtCoordinate(
        routes.find((r) => r.id === "C")!,
        pointAlongRoute(oldRoute, progress),
      );
      return {
        ...state,
        obstacle: action.obstacle,
        selectedRoute: solved.routeId,
        currentStep: 0,
        completed: false,
        stage: action.fromNavigation ? "navigation" : "processing",
        ar: {
          ...initialARState,
          voiceEnabled: state.ar.voiceEnabled,
          started: !!action.fromNavigation,
          rerouting: !!action.fromNavigation,
          resumeAfterReroute: !!action.resumePlayback,
          resumeProgress,
          command: state.ar.command + 1,
        },
      };
    }
    case "ar-voice":
      return { ...state, ar: { ...state.ar, voiceEnabled: action.enabled } };
    case "ar-reroute-ready":
      return state.ar.rerouting
        ? {
            ...state,
            ar: {
              ...state.ar,
              rerouting: false,
              playing: state.ar.resumeAfterReroute,
              command: state.ar.command + 1,
            },
          }
        : state;
    case "ar-tick": {
      if (
        state.stage !== "navigation" ||
        !state.ar.playing ||
        state.ar.sceneIndex !== action.expectedSceneIndex ||
        state.ar.rerouting
      )
        return state;
      const scene = getARScenes(state.selectedRoute, state.ar.resumeProgress)[
        state.ar.sceneIndex
      ];
      const elapsed = clamp(action.elapsed, 0, scene.durationSeconds);
      // Reporting is a deliberate user action; stop at the scripted barrier instead of inventing detection.
      if (scene.id === "barrier" && elapsed >= scene.durationSeconds)
        return {
          ...state,
          ar: {
            ...state.ar,
            elapsed,
            playing: false,
            command: state.ar.command + 1,
          },
        };
      if (elapsed >= scene.durationSeconds)
        return journeyReducer(state, {
          type: "ar-control",
          control: "next",
          expectedSceneIndex: action.expectedSceneIndex,
        });
      return { ...state, ar: { ...state.ar, elapsed } };
    }
    case "ar-control": {
      if (
        action.expectedSceneIndex !== undefined &&
        action.expectedSceneIndex !== state.ar.sceneIndex
      )
        return state;
      if (action.control === "restart")
        return {
          ...state,
          selectedRoute:
            state.obstacle || state.selectedRoute === "C"
              ? "B"
              : state.selectedRoute,
          obstacle: null,
          currentStep: 0,
          completed: false,
          stage: "navigation",
          ar: {
            ...initialARState,
            voiceEnabled: state.ar.voiceEnabled,
            command: state.ar.command + 1,
          },
        };
      const scenes = getARScenes(state.selectedRoute, state.ar.resumeProgress),
        scene = scenes[state.ar.sceneIndex] || scenes[0];
      const ar = { ...state.ar, command: state.ar.command + 1 };
      if (action.control === "pause")
        return {
          ...state,
          ar: {
            ...ar,
            playing: false,
            resumeAfterReroute: false,
            elapsed: clamp(
              action.elapsed ?? ar.elapsed,
              0,
              scene.durationSeconds,
            ),
          },
        };
      if (
        action.control === "play" &&
        scene.id === "barrier" &&
        ar.elapsed >= scene.durationSeconds
      ) {
        return journeyReducer(
          { ...state, ar: { ...ar, playing: true } },
          {
            type: "ar-control",
            control: "next",
            expectedSceneIndex: ar.sceneIndex,
          },
        );
      }
      if (action.control === "start" || action.control === "play")
        return {
          ...state,
          ar: {
            ...ar,
            started: true,
            playing: !ar.rerouting,
            resumeAfterReroute: ar.rerouting ? true : ar.resumeAfterReroute,
          },
        };
      if (action.control === "seek") {
        const targetIndex =
          action.sceneIndex === undefined
            ? ar.sceneIndex
            : Math.round(clamp(action.sceneIndex, 0, scenes.length - 1));
        return {
          ...state,
          currentStep: Math.min(
            targetIndex,
            routes.find((r) => r.id === state.selectedRoute)!.steps.length - 1,
          ),
          ar: {
            ...ar,
            sceneIndex: targetIndex,
            elapsed: clamp(
              action.elapsed ?? 0,
              0,
              scenes[targetIndex].durationSeconds,
            ),
          },
        };
      }
      const index =
        action.control === "next"
          ? ar.sceneIndex + 1
          : Math.max(0, ar.sceneIndex - 1);
      if (index >= scenes.length)
        return {
          ...state,
          stage: "arrived",
          completed: true,
          currentStep:
            routes.find((r) => r.id === state.selectedRoute)!.steps.length - 1,
          ar: { ...ar, playing: false, elapsed: scene.durationSeconds },
        };
      return {
        ...state,
        currentStep: Math.min(
          index,
          routes.find((r) => r.id === state.selectedRoute)!.steps.length - 1,
        ),
        ar: { ...ar, sceneIndex: index, elapsed: 0 },
      };
    }
    case "next": {
      const last =
        state.currentStep >=
        routes.find((r) => r.id === state.selectedRoute)!.steps.length - 1;
      return {
        ...state,
        currentStep: last ? state.currentStep : state.currentStep + 1,
        completed: last,
        stage: last ? "arrived" : "navigation",
      };
    }
    case "restart":
      return {
        ...initialState,
        profile: state.profile,
        preferences: state.preferences,
        stage: "dashboard",
      };
  }
}
function restoreJourney(): NavigationState {
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("pathable-journey") || "null",
    );
    if (
      saved &&
      [
        "home",
        "profile",
        "preferences",
        "dashboard",
        "processing",
        "routes",
        "prepare",
        "navigation",
        "arrived",
      ].includes(saved.stage) &&
      routes.some((r) => r.id === saved.selectedRoute) &&
      saved.profile in defaults &&
      Array.isArray(saved.preferences)
    )
      return {
        ...initialState,
        ...saved,
        stage: saved.stage === "processing" ? "dashboard" : saved.stage,
        ar: {
          ...initialARState,
          ...saved.ar,
          started: !!saved.ar?.started,
          voiceEnabled: !!saved.ar?.voiceEnabled,
          resumeProgress: clamp(saved.ar?.resumeProgress ?? 0),
          command: Number.isInteger(saved.ar?.command) ? saved.ar.command : 0,
          sceneIndex: Math.floor(
            clamp(
              saved.ar?.sceneIndex ?? 0,
              0,
              getARScenes(saved.selectedRoute).length - 1,
            ),
          ),
          elapsed: clamp(
            saved.ar?.elapsed ?? 0,
            0,
            getARScenes(saved.selectedRoute)[
              Math.floor(
                clamp(
                  saved.ar?.sceneIndex ?? 0,
                  0,
                  getARScenes(saved.selectedRoute).length - 1,
                ),
              )
            ].durationSeconds,
          ),
          playing: false,
          rerouting: false,
        },
      };
  } catch {
    /* Storage is optional in private browsing. */
  }
  return initialState;
}
export function useJourney() {
  const [state, dispatch] = useReducer(
    journeyReducer,
    initialState,
    restoreJourney,
  );
  const lastSaved = useRef(0);
  const importantKey = `${state.stage}:${state.selectedRoute}:${state.ar.command}:${state.ar.voiceEnabled}:${state.profile}:${state.preferences.join(",")}`;
  const savedKey = useRef("");
  useEffect(() => {
    if (
      savedKey.current === importantKey &&
      Date.now() - lastSaved.current < 800
    )
      return;
    savedKey.current = importantKey;
    lastSaved.current = Date.now();
    try {
      sessionStorage.setItem(
        "pathable-journey",
        JSON.stringify({
          ...state,
          obstacle: state.obstacle
            ? { ...state.obstacle, image: undefined }
            : null,
        }),
      );
    } catch {
      /* Continue with memory if storage is unavailable. */
    }
  }, [state, importantKey]);
  return [state, dispatch] as const;
}
