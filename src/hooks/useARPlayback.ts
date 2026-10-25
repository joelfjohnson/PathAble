import { useEffect, useRef } from "react";
import { transitionJourney } from "../components/motion/transitionJourney";
import type { ARScene } from "../types/ar";
import type { JourneyAction, NavigationState } from "../types/journey";
export function useARPlayback({
  state,
  scene,
  dispatch,
  getVideo,
  mediaReady,
  mediaFailed,
  onAutoplayBlocked,
}: {
  state: NavigationState;
  scene: ARScene;
  dispatch: React.Dispatch<JourneyAction>;
  getVideo: () => HTMLVideoElement | null;
  mediaReady: boolean;
  mediaFailed: boolean;
  onAutoplayBlocked: () => void;
}) {
  const settings = useRef({
    scene,
    elapsed: state.ar.elapsed,
    onAutoplayBlocked,
  });
  useEffect(() => {
    settings.current = { scene, elapsed: state.ar.elapsed, onAutoplayBlocked };
  }, [scene, state.ar.elapsed, onAutoplayBlocked]);
  const index = state.ar.sceneIndex;
  useEffect(() => {
    const element = getVideo();
    if (
      element &&
      scene.media.type === "video" &&
      element.readyState >= 1 &&
      Math.abs(element.currentTime - settings.current.elapsed) > 0.18
    )
      // oxlint-disable-next-line react/immutability -- Seeking a native media element is an imperative DOM operation, not a React state mutation.
      element.currentTime = settings.current.elapsed;
    if (!state.ar.playing || state.ar.rerouting) {
      element?.pause();
      return;
    }
    let active = true,
      frame = 0,
      videoFrame = 0,
      lastUpdate = 0;
    const start = performance.now(),
      offset = settings.current.elapsed;
    const usingVideo =
      !!element && scene.media.type === "video" && !mediaFailed;
    if (usingVideo)
      void element.play().catch(() => {
        if (active && !element.error && element.isConnected) {
          dispatch({ type: "ar-control", control: "pause" });
          settings.current.onAutoplayBlocked();
        }
      });
    const update = (now: number) => {
      if (!active) return;
      if (now - lastUpdate >= 100) {
        lastUpdate = now;
        const elapsed = usingVideo
          ? element.currentTime
          : offset + (now - start) / 1000;
        if (
          !settings.current.scene.nextSceneId &&
          elapsed >= settings.current.scene.durationSeconds
        ) {
          active = false;
          transitionJourney(() =>
            dispatch({ type: "ar-tick", expectedSceneIndex: index, elapsed }),
          );
          return;
        }
        dispatch({ type: "ar-tick", expectedSceneIndex: index, elapsed });
      }
      if (usingVideo && typeof element.requestVideoFrameCallback === "function")
        videoFrame = element.requestVideoFrameCallback(update);
      else frame = requestAnimationFrame(update);
    };
    if (usingVideo && typeof element.requestVideoFrameCallback === "function")
      videoFrame = element.requestVideoFrameCallback(update);
    else frame = requestAnimationFrame(update);
    const ended = () => {
      if (!active) return;
      active = false;
      const advance = () =>
        dispatch({
          type: "ar-control",
          control: "next",
          expectedSceneIndex: index,
        });
      if (settings.current.scene.nextSceneId) advance();
      else transitionJourney(advance);
    };
    element?.addEventListener("ended", ended);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      if (videoFrame) element?.cancelVideoFrameCallback?.(videoFrame);
      element?.pause();
      element?.removeEventListener("ended", ended);
    };
  }, [
    state.ar.playing,
    state.ar.rerouting,
    state.ar.command,
    index,
    state.selectedRoute,
    getVideo,
    mediaReady,
    scene.media.type,
    mediaFailed,
    dispatch,
  ]);
}
