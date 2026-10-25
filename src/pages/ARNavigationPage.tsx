import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Accessibility,
  Check,
  Flag,
  MapPin,
  Settings2,
  ShieldCheck,
  Navigation,
  Route as RouteIcon,
} from "lucide-react";
import { transitionJourney } from "../components/motion/transitionJourney";
import { routes, profiles } from "../data/journey";
import { getARScenes } from "../data/arScenes";
import { arEvents } from "../data/arEvents";
import { sceneRouteProgress } from "../components/ar/geometry";
import { useARPlayback } from "../hooks/useARPlayback";
import { useARVoice } from "../hooks/useARVoice";
import ARSceneRenderer from "../components/ar/ARSceneRenderer";
import ARInstructionHUD from "../components/ar/ARInstructionHUD";
import ARControls from "../components/ar/ARControls";
import ARMiniMap from "../components/ar/ARMiniMap";
import ARRerouteTransition from "../components/ar/ARRerouteTransition";
import ARSettingsDialog from "../components/ar/ARSettingsDialog";
import type { NavigationState, JourneyAction } from "../types/journey";
export default function ARNavigationPage({
  state,
  dispatch,
  onBack,
  onReport,
}: {
  state: NavigationState;
  dispatch: React.Dispatch<JourneyAction>;
  onBack: () => void;
  onReport: (resume: boolean) => void;
}) {
  const route = routes.find((r) => r.id === state.selectedRoute)!;
  const scenes = useMemo(
    () => getARScenes(state.selectedRoute, state.ar.resumeProgress),
    [state.selectedRoute, state.ar.resumeProgress],
  );
  const index = Math.min(scenes.length - 1, Math.max(0, state.ar.sceneIndex));
  const scene = scenes[index];
  const profile = profiles.find((p) => p.id === state.profile)!;
  const videoNodes = useRef(new Map<string, HTMLVideoElement>());
  const registerVideo = useCallback(
    (id: string, node: HTMLVideoElement | null) => {
      if (node) videoNodes.current.set(id, node);
      else videoNodes.current.delete(id);
    },
    [],
  );
  const getVideo = useCallback(
    () => videoNodes.current.get(scene.id) ?? null,
    [scene.id],
  );
  const resumeFromMap = useRef(false);
  const resumeFromSettings = useRef(false);
  const [media, setMedia] = useState<{
    id: string;
    ready: boolean;
    failed: boolean;
  }>({ id: "", ready: false, failed: false });
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState(false);
  const [mapMode, setMapMode] = useState<"mini" | "full" | "off">(() =>
    matchMedia("(max-width:700px)").matches ? "off" : "mini",
  );
  const reduced = !!useReducedMotion();
  const onMediaStatus = useCallback(
    (id: string, ready: boolean, failed: boolean) =>
      setMedia((current) =>
        current.id === id &&
        current.ready === ready &&
        current.failed === failed
          ? current
          : { id, ready, failed },
      ),
    [],
  );
  useARPlayback({
    state,
    scene,
    dispatch,
    getVideo,
    mediaReady:
      scene.media.type === "video" &&
      media.id === scene.id &&
      media.ready &&
      !media.failed,
    mediaFailed: media.id === scene.id && media.failed,
    onAutoplayBlocked: () =>
      setNotice(
        "Playback was paused by your browser. Use Resume journey to continue, or step through the scenes.",
      ),
  });
  const voiceSupported = useARVoice(
    state.ar.voiceEnabled,
    state.ar.playing && !state.ar.rerouting,
    scene.audioInstruction ?? scene.instruction,
  );
  useEffect(() => {
    if (state.ar.started && !state.ar.rerouting)
      document.querySelector<HTMLButtonElement>(".ar-play")?.focus();
  }, [state.ar.started, state.ar.rerouting]);
  const routeProgress = sceneRouteProgress(scene, state.ar.elapsed);
  const pause = useCallback(
    () =>
      dispatch({
        type: "ar-control",
        control: "pause",
        elapsed: getVideo()?.readyState
          ? getVideo()!.currentTime
          : state.ar.elapsed,
      }),
    [dispatch, state.ar.elapsed, getVideo],
  );
  const report = () => {
    const resume = state.ar.playing;
    pause();
    onReport(resume);
  };
  const openMap = () => {
    resumeFromMap.current = state.ar.playing;
    pause();
    setMapMode("full");
  };
  const closeMap = useCallback(() => {
    setMapMode(matchMedia("(max-width:700px)").matches ? "off" : "mini");
    if (resumeFromMap.current)
      dispatch({ type: "ar-control", control: "play" });
    resumeFromMap.current = false;
  }, [dispatch]);
  useEffect(() => {
    if (mapMode !== "full") return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMap();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mapMode, closeMap]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(timeout);
  }, [notice]);
  const rerouteReady = useCallback(
    () => dispatch({ type: "ar-reroute-ready" }),
    [dispatch],
  );
  const activeEvent = arEvents.find(
    (event) =>
      scene.eventIds.includes(event.id) && state.ar.elapsed >= event.atSeconds,
  );
  const end = index === scenes.length - 1;
  return (
    <main className="ar-navigation" aria-label="Scripted visual navigation">
      <div className="ar-visual-stage">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            className="ar-scene-layer"
            key={`${state.selectedRoute}-${scene.id}`}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.5 }}
          >
            <ARSceneRenderer
              scene={scene}
              elapsed={state.ar.elapsed}
              playing={state.ar.playing}
              preferences={state.preferences}
              onVideo={registerVideo}
              preloadMedia={scenes[index + 1]?.media}
              onMediaStatus={onMediaStatus}
            />
          </motion.div>
        </AnimatePresence>
        <header className="ar-topbar">
          <button
            className="ar-back"
            onClick={() => {
              pause();
              onBack();
            }}
            aria-label="Back to navigation preparation"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <span>YOUR DESTINATION</span>
            <strong>{state.destination.name}</strong>
          </div>
          <span className="ar-route-chip">ROUTE {route.id}</span>
          <button
            className="ar-settings-button"
            aria-label="Navigation settings"
            onClick={() => {
              resumeFromSettings.current = state.ar.playing;
              pause();
              setSettings(true);
            }}
          >
            <Settings2 size={19} />
          </button>
        </header>
        {!state.ar.started ? (
          <motion.section
            className="ar-ready"
            initial={
              state.ar.command === 0 &&
              typeof document.startViewTransition === "function"
                ? false
                : { opacity: 0, y: reduced ? 0 : 10 }
            }
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="round-icon">
              <Navigation size={24} />
            </span>
            <div className="eyebrow">THE WAY FORWARD IS YOURS</div>
            <h1 tabIndex={-1}>Your journey is ready.</h1>
            <p>
              A clearer view of the path ahead. Explore our visual Bentonville
              walkthrough at your pace.
            </p>
            <div className="ar-ready-profile">
              <Accessibility size={18} />
              {profile.name}
              <span>
                <Check size={13} /> {state.preferences.length} preferences
              </span>
            </div>
            <div className="ar-ready-route">
              <RouteIcon size={18} />
              <span>{route.name}</span>
              <strong>
                {route.distance} m <small>sample route</small>
              </strong>
            </div>
            <button
              className="button full"
              onClick={() => dispatch({ type: "ar-control", control: "start" })}
            >
              Start AR journey <ArrowRight size={18} />
            </button>
            <small>
              <ShieldCheck size={13} /> Scripted demonstration · not live
              location-anchored AR.
            </small>
          </motion.section>
        ) : (
          <>
            <h1 className="sr-only" tabIndex={-1}>
              Visual navigation to {state.destination.name}
            </h1>
            <ARInstructionHUD
              scene={scene}
              index={index}
              total={scenes.length}
              routeId={route.id}
            />
            <div className="ar-journey-caption">
              <span className="live-dot" />
              <span>
                {state.ar.playing ? "JOURNEY PLAYING" : "JOURNEY PAUSED"}
              </span>
              <span>{profile.name}</span>
            </div>
            {mapMode !== "off" && (
              <ARMiniMap
                route={route}
                progress={routeProgress}
                reported={!!state.obstacle}
                expanded={mapMode === "full"}
                onExpand={openMap}
                onClose={closeMap}
              />
            )}
            {activeEvent?.kind === "report-opportunity" && !state.obstacle && (
              <section className="ar-event-card" aria-label="Example obstacle">
                <span>
                  <Flag size={17} /> SCRIPTED EXAMPLE
                </span>
                <h3>{activeEvent.title}</h3>
                <p>{activeEvent.detail}</p>
                <button onClick={report}>
                  Report & explore Route C <ArrowRight size={16} />
                </button>
              </section>
            )}
            {state.obstacle && (
              <div className="ar-route-updated">
                <Check size={14} /> Route C avoids the reported example barrier.
              </div>
            )}
            <div className="ar-bottom-panel">
              <div className="ar-journey-progress">
                <span>
                  YOUR JOURNEY{" "}
                  <strong>{Math.round(routeProgress * 100)}%</strong>
                </span>
                <div
                  role="progressbar"
                  aria-label="Demonstrated journey progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(routeProgress * 100)}
                >
                  <i style={{ width: `${routeProgress * 100}%` }} />
                </div>
                <span>
                  <MapPin size={13} /> City Square
                </span>
              </div>
              <ARControls
                busy={state.ar.rerouting}
                playing={state.ar.playing}
                first={index === 0}
                last={end}
                elapsed={state.ar.elapsed}
                duration={scene.durationSeconds}
                voiceEnabled={state.ar.voiceEnabled}
                voiceSupported={voiceSupported}
                mapOpen={mapMode === "full"}
                onPlay={() =>
                  dispatch({
                    type: "ar-control",
                    control: state.ar.playing ? "pause" : "play",
                    elapsed: state.ar.elapsed,
                  })
                }
                onPrevious={() =>
                  dispatch({
                    type: "ar-control",
                    control: "previous",
                    expectedSceneIndex: index,
                  })
                }
                onNext={() => {
                  const advance = () =>
                    dispatch({
                      type: "ar-control",
                      control: "next",
                      expectedSceneIndex: index,
                    });
                  if (end) transitionJourney(advance);
                  else advance();
                }}
                onRestart={() => {
                  setMapMode(
                    matchMedia("(max-width:700px)").matches ? "off" : "mini",
                  );
                  dispatch({ type: "ar-control", control: "restart" });
                }}
                onMap={mapMode === "full" ? closeMap : openMap}
                onReport={report}
                onVoice={() =>
                  voiceSupported
                    ? dispatch({
                        type: "ar-voice",
                        enabled: !state.ar.voiceEnabled,
                      })
                    : setNotice(
                        "Voice guidance is unavailable in this browser. All directions remain visible.",
                      )
                }
                onSeek={(elapsed) =>
                  dispatch({ type: "ar-control", control: "seek", elapsed })
                }
              />
            </div>
          </>
        )}
        <button
          className="ar-credit-button"
          onClick={() => {
            resumeFromSettings.current = state.ar.playing;
            pause();
            setSettings(true);
          }}
        >
          Reference imagery & credits
        </button>
        {notice && (
          <div className="ar-notice" role="status">
            {notice}
          </div>
        )}
        {state.ar.rerouting && (
          <ARRerouteTransition
            onReady={rerouteReady}
            onPause={() => {
              dispatch({ type: "ar-control", control: "pause" });
              setNotice("The alternative will stay paused until you resume.");
            }}
          />
        )}
      </div>
      {settings && (
        <ARSettingsDialog
          state={state}
          scene={scene}
          voiceSupported={voiceSupported}
          showMiniMap={mapMode === "mini"}
          onVoice={(enabled) => dispatch({ type: "ar-voice", enabled })}
          onMiniMap={(enabled) => setMapMode(enabled ? "mini" : "off")}
          onClose={() => {
            setSettings(false);
            if (resumeFromSettings.current)
              dispatch({ type: "ar-control", control: "play" });
            resumeFromSettings.current = false;
          }}
        />
      )}
    </main>
  );
}
