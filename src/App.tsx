import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flag,
  Footprints,
  MapPin,
  Route as RouteIcon,
  Settings2,
  ShieldCheck,
  Sparkles,
  PersonStanding,
  Zap,
  HeartPulse,
  RotateCcw,
} from "lucide-react";
import Home from "./pages/Home";
import JourneyProgress from "./components/JourneyProgress";
import { solveRoute, supportedPreferences, routeDistance } from "./lib/routing";
import "./styles/finish.css";
import "./styles/atlas.css";
import "./styles/studio.css";

import { transitionJourney } from "./components/motion/transitionJourney";
const ARNavigationPage = lazy(() => import("./pages/RouteNavigation"));
import Brand from "./components/Brand";
import ReportDialog from "./components/ReportDialog";
import DestinationSearch from "./components/DestinationSearch";
import { useJourney } from "./hooks/useJourney";
import { groups, profiles, routes } from "./data/journey";
import type { NavigationState } from "./types/journey";
const MapView = lazy(() => import("./components/MapView"));
const icons = [Accessibility, Zap, PersonStanding, Footprints, HeartPulse];
function Processing({
  done,
  rerouting = false,
}: {
  done: () => void;
  rerouting?: boolean;
}) {
  const [step, setStep] = useState(0);
  const ref = useRef(done);
  useEffect(() => {
    ref.current = done;
  }, [done]);
  useEffect(() => {
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 500);
    const timeout = setTimeout(() => ref.current(), 2500);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  return (
    <div className="processing" role="status" aria-live="polite">
      <div className="processing-network" aria-hidden="true">
        <svg viewBox="0 0 220 160">
          <path d="M25 130V45H190" className="processing-path-neutral" />
          <path d="M25 130H85V25H190" className="processing-path-purple" />
          <circle cx="25" cy="130" r="9" />
          <circle cx="190" cy="25" r="9" />
        </svg>
        <span>
          <Accessibility size={23} />
        </span>
      </div>
      <span className="eyebrow">
        {rerouting ? "A NEW WAY FORWARD" : "MADE FOR YOUR MOBILITY"}
      </span>
      <h2>{rerouting ? "Preparing an alternative." : "Finding your way."}</h2>
      <p>
        {
          [
            "Applying your preferences",
            "Preparing route options",
            "Comparing pathway preferences",
            "Your journey is ready",
          ][step]
        }
      </p>
      <div className="progress-track">
        <span style={{ width: `${(step + 1) * 25}%` }} />
      </div>
      <div className="processing-factors">
        <span>
          <CheckCircle2 size={14} />
          Your mobility
        </span>
        <span>
          <CheckCircle2 size={14} />
          Your preferences
        </span>
        <span>
          <CheckCircle2 size={14} />
          Featured routes
        </span>
      </div>
      <small>
        Using the featured journey’s illustrative route information.
      </small>
    </div>
  );
}
export default function App() {
  const [state, dispatch] = useJourney();
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const resumeAfterReport = useRef(false);
  const [hoveredRoute, setHoveredRoute] = useState<
    NavigationState["selectedRoute"] | null
  >(null);
  const [origin, setOrigin] = useState("Downtown transit pickup"),
    [destination, setDestination] = useState("Bentonville City Square"),
    [searchError, setSearchError] = useState("");
  const solution = solveRoute(state.preferences, !!state.obstacle);
  const recommendedId = solution?.routeId;
  const route = routes.find((r) => r.id === state.selectedRoute)!;
  const profile = profiles.find((p) => p.id === state.profile)!;
  const stage = state.stage;

  const rerouting = stage === "processing" && !!state.obstacle;
  const go = useCallback(
    (next: NavigationState["stage"]) => {
      setPanelExpanded(true);
      setHoveredRoute(null);
      setReportOpen(false);
      transitionJourney(() => dispatch({ type: "stage", stage: next }));
    },
    [dispatch],
  );
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      stage === "home"
        ? "PathAble — Navigation Without Barriers"
        : `${stage === "profile" ? "Your mobility" : stage === "preferences" ? "Your preferences" : "Your journey"} · PathAble`;
    setTimeout(
      () => document.querySelector<HTMLElement>("main h1, main h2")?.focus(),
      0,
    );
  }, [stage]);
  useEffect(() => {
    const onPop = (event: PopStateEvent) => go(event.state?.stage || "home");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [go]);
  useEffect(() => {
    if (stage !== "processing" && window.history.state?.stage !== stage) {
      window.history.pushState(
        { stage },
        "",
        stage === "home" ? "/" : `/#${stage}`,
      );
    }
  }, [stage]);
  const findRoutes = () => {
    if (
      origin.trim().toLowerCase() !== "downtown transit pickup" ||
      destination.trim().toLowerCase() !== "bentonville city square"
    ) {
      setSearchError(
        "Choose the featured Bentonville journey to preview supported routes. Your search has been preserved.",
      );
      return;
    }
    setSearchError("");
    if (!solution) {
      setSearchError(
        "No route meets these requirements. Adjust your preferences or remove the report.",
      );
      return;
    }
    dispatch({ type: "route", route: solution.routeId });
    go("processing");
  };
  const back = () => {
    const prev: Partial<
      Record<NavigationState["stage"], NavigationState["stage"]>
    > = {
      profile: "home",
      preferences: "profile",
      dashboard: "preferences",
      processing: "dashboard",
      routes: "dashboard",
      prepare: "routes",
      navigation: "prepare",
      arrived: "dashboard",
    };
    go(prev[stage] || "home");
  };
  const activeSummary = groups
    .flatMap((g) => g.items)
    .filter((i) => state.preferences.includes(i.id));
  return (
    <MotionConfig reducedMotion="user">
      {stage === "home" ? (
        <Home
          start={() => go("profile")}
          profile={state.profile}
          onProfile={(profile) => dispatch({ type: "profile", profile })}
        />
      ) : (
        <div className="application premium-application" data-stage={stage}>
          <header className="app-header">
            <Brand onClick={() => go("home")} />
            <JourneyProgress stage={stage} />
            <button className="profile-chip" onClick={() => go("profile")}>
              <Accessibility size={18} />
              <span>{profile.name}</span>
              <ChevronDown size={14} />
            </button>
          </header>
          {stage === "profile" || stage === "preferences" ? (
            <main className="onboarding">
              <button className="back-link" onClick={back}>
                <ArrowLeft size={16} /> Back
              </button>
              <div className="onboarding-progress">
                <span className="active">
                  01 <span>Your mobility</span>
                </span>
                <i />
                <span className={stage === "preferences" ? "active" : ""}>
                  02 <span>Your preferences</span>
                </span>
                <i />
                <span>
                  03 <span>Your journey</span>
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  ref={(element) => {
                    if (element)
                      requestAnimationFrame(() => {
                        if (element.isConnected)
                          element.querySelector<HTMLElement>("h1")?.focus();
                      });
                  }}
                  onAnimationComplete={() =>
                    document.querySelector<HTMLElement>("main h1")?.focus()
                  }
                  initial={
                    typeof document.startViewTransition === "function"
                      ? false
                      : { opacity: 0, y: 12 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {stage === "profile" ? (
                    <>
                      <div className="eyebrow">LET'S START WITH YOU</div>
                      <h1 tabIndex={-1}>How do you prefer to travel?</h1>
                      <p className="intro">
                        Every journey is personal. Let's make this one yours.
                      </p>
                      <div
                        className="profile-grid"
                        role="group"
                        aria-label="Mobility profile"
                      >
                        {profiles.map((p, i) => {
                          const Icon = icons[i];
                          return (
                            <button
                              key={p.id}
                              aria-pressed={p.id === state.profile}
                              className={
                                "profile-card " +
                                (p.id === state.profile ? "selected" : "")
                              }
                              onClick={() =>
                                dispatch({ type: "profile", profile: p.id })
                              }
                            >
                              <div className="profile-top">
                                <span className="round-icon">
                                  <Icon size={25} />
                                </span>
                                <span className="radio-dot">
                                  {p.id === state.profile && (
                                    <Check size={12} />
                                  )}
                                </span>
                              </div>
                              <h3>{p.name}</h3>
                              <p>{p.description}</p>
                              <small>{p.detail}</small>
                            </button>
                          );
                        })}
                      </div>
                      <div className="onboarding-bottom">
                        <p>
                          <ShieldCheck size={17} /> Your choices stay with you
                          throughout this journey.
                        </p>
                        <button
                          className="button"
                          onClick={() => go("preferences")}
                        >
                          Make it yours <ArrowRight size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="eyebrow">A ROUTE AROUND YOUR NEEDS</div>
                      <h1 tabIndex={-1}>Your journey, your needs.</h1>
                      <p className="intro">
                        A few small preferences can make a big difference.
                      </p>
                      <div className="preferences-layout">
                        <div>
                          {groups.map((g, i) => (
                            <details
                              className="preference-group"
                              key={g.name}
                              open={i === 0 || undefined}
                            >
                              <summary>
                                <span>
                                  <Settings2 size={18} />
                                  {g.name}
                                </span>
                                <ChevronDown size={17} />
                              </summary>
                              <div className="preference-items">
                                {g.items.map((item) => (
                                  <label className="switch-row" key={item.id}>
                                    <span>
                                      {item.label}
                                      {!supportedPreferences.includes(
                                        item.id,
                                      ) && (
                                        <small className="unsupported-setting">
                                          Not mapped in this area
                                        </small>
                                      )}
                                    </span>
                                    <input
                                      type="checkbox"
                                      role="switch"
                                      disabled={
                                        !supportedPreferences.includes(item.id)
                                      }
                                      checked={state.preferences.includes(
                                        item.id,
                                      )}
                                      onChange={() =>
                                        dispatch({
                                          type: "preference",
                                          preference: item.id,
                                        })
                                      }
                                    />
                                    <span
                                      className="switch"
                                      aria-hidden="true"
                                    />
                                  </label>
                                ))}
                              </div>
                            </details>
                          ))}
                        </div>
                        <aside className="preference-summary">
                          <span className="round-icon">
                            <Accessibility size={25} />
                          </span>
                          <h3>Uniquely yours.</h3>
                          <p>{profile.name}</p>
                          <div className="summary-number">
                            {state.preferences.length}
                            <span>preferences selected</span>
                          </div>
                          <p>
                            We'll compare the sample routes using the
                            preferences represented in this journey.
                          </p>
                          <small>
                            Routing uses a small local network with modeled
                            accessibility attributes. Unmapped options are
                            disabled.
                          </small>
                        </aside>
                      </div>
                      <div className="onboarding-bottom">
                        <button
                          className="text-link"
                          onClick={() =>
                            dispatch({
                              type: "profile",
                              profile: state.profile,
                            })
                          }
                        >
                          <RotateCcw size={16} /> Reset to profile defaults
                        </button>
                        <button
                          className="button"
                          onClick={() => go("dashboard")}
                        >
                          Let's find your way <ArrowRight size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          ) : stage === "navigation" ? (
            <Suspense
              fallback={
                <main className="map-loading">
                  Preparing visual navigation…
                </main>
              }
            >
              <ARNavigationPage
                state={state}
                dispatch={dispatch}
                onBack={() => go("routes")}
                onReport={(resume) => {
                  resumeAfterReport.current = resume;
                  setReportOpen(true);
                }}
              />
            </Suspense>
          ) : (
            <main
              className={
                "journey-layout " + (!panelExpanded ? "panel-is-collapsed" : "")
              }
            >
              <aside
                className={
                  "journey-panel " + (!panelExpanded ? "panel-collapsed" : "")
                }
              >
                <button
                  className="mobile-panel-toggle"
                  aria-expanded={panelExpanded}
                  onClick={() => setPanelExpanded(!panelExpanded)}
                >
                  <span />
                  {panelExpanded ? "Show more map" : "Open journey controls"}
                  <ChevronDown size={15} />
                </button>
                <div className="journey-panel-scroll">
                  <button className="back-link" onClick={back}>
                    <ArrowLeft size={16} />{" "}
                    {stage === "dashboard" ? "Preferences" : "Back"}
                  </button>
                  {stage === "processing" ? (
                    <Processing
                      rerouting={rerouting}
                      done={() => {
                        go("routes");
                      }}
                    />
                  ) : stage === "arrived" ? (
                    <div className="arrival">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="arrival-icon"
                      >
                        <Check size={42} />
                      </motion.div>
                      <div className="eyebrow">A LITTLE MORE INDEPENDENCE</div>
                      <h1 tabIndex={-1}>You've arrived.</h1>
                      <p>Bentonville City Square</p>
                      <div className="arrival-summary">
                        <span>
                          <RouteIcon /> {routeDistance(route)} m
                        </span>
                        <span>
                          <CheckCircle2 /> Journey complete
                        </span>
                      </div>
                      <h3>A journey on your terms.</h3>
                      <p>
                        You explored the {route.name.toLowerCase()} with your
                        personal mobility preferences.
                      </p>
                      <small>
                        Featured walkthrough completed. No real location was
                        tracked.
                      </small>
                      <button
                        className="button full"
                        onClick={() => dispatch({ type: "restart" })}
                      >
                        Start another journey <ArrowRight size={17} />
                      </button>
                      <button
                        className="text-link"
                        onClick={() => go("dashboard")}
                      >
                        Return to dashboard
                      </button>
                    </div>
                  ) : stage === "prepare" ? (
                    <div className="prepare">
                      <span className="eyebrow">READY WHEN YOU ARE</span>
                      <h1 tabIndex={-1}>
                        A good journey
                        <br />
                        starts here.
                      </h1>
                      <div className="destination-title">
                        <span className="round-icon">
                          <MapPin />
                        </span>
                        <div>
                          <small>YOUR DESTINATION</small>
                          <h3>Bentonville City Square</h3>
                        </div>
                      </div>
                      <div className="selected-summary">
                        <span className="pill">
                          ROUTE {route.id} · SELECTED
                        </span>
                        <h3>{route.name}</h3>
                        <div className="route-metrics">
                          <strong>
                            {routeDistance(route)} <small>m</small>
                          </strong>
                          <span>
                            <Clock3 size={16} />
                            {Math.max(
                              1,
                              Math.ceil(routeDistance(route) / 60),
                            )}{" "}
                            min estimate
                          </span>
                        </div>
                        {route.features.map((f) => (
                          <p key={f}>
                            <Check size={16} />
                            {f}
                          </p>
                        ))}
                      </div>
                      <h3>Before you set off</h3>
                      <ol className="instruction-list">
                        {route.steps.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                      <div className="info">
                        <ShieldCheck size={19} />
                        <span>
                          Illustrative conditions. Assess your surroundings and
                          use your own judgment.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="eyebrow">BENTONVILLE · YOUR JOURNEY</div>
                      <h1 tabIndex={-1}>
                        {stage === "routes"
                          ? "Your way forward."
                          : "Where to today?"}
                      </h1>
                      <p className="panel-intro">
                        {stage === "routes"
                          ? "Compare distance, comfort, and the needs you selected."
                          : "Set your destination. Your mobility preferences come with you."}
                      </p>
                      {stage === "dashboard" ? (
                        <>
                          <DestinationSearch
                            origin={origin}
                            destination={destination}
                            onOrigin={(text) => {
                              setOrigin(text);
                              setSearchError("");
                            }}
                            onDestination={(text) => {
                              setDestination(text);
                              setSearchError("");
                            }}
                            onSearch={findRoutes}
                            onFeatured={() => {
                              setOrigin("Downtown transit pickup");
                              setDestination("Bentonville City Square");
                              setSearchError("");
                            }}
                            error={searchError}
                          />
                          <div className="journey-personal">
                            <div>
                              <Accessibility size={19} />
                              <strong>{profile.name}</strong>
                              <button
                                className="text-link"
                                onClick={() => go("profile")}
                              >
                                Edit
                              </button>
                            </div>
                            <div className="preference-tags">
                              {activeSummary.slice(0, 3).map((p) => (
                                <span key={p.id}>{p.label}</span>
                              ))}
                              {activeSummary.length > 3 && (
                                <span>+{activeSummary.length - 3} more</span>
                              )}
                            </div>
                            <button
                              className="text-link"
                              onClick={() => go("preferences")}
                            >
                              <Settings2 size={15} /> Adjust preferences
                            </button>
                          </div>

                          <div className="featured-note">
                            <span className="pill">THE FEATURED JOURNEY</span>
                            <h3>Discover downtown Bentonville.</h3>
                            <p>
                              Explore an accessibility-first journey from a
                              simulated transit pickup to the heart of the city.
                            </p>
                            <div>
                              <MapPin size={15} /> Bentonville, Arkansas
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {state.obstacle && (
                            <div className="reroute-notice" role="status">
                              <CheckCircle2 size={20} />
                              <div>
                                <strong>A new way around.</strong>
                                <p>
                                  Your {state.obstacle.type.toLowerCase()}{" "}
                                  report was added to this session. Route C
                                  avoids the example barrier.
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="compact-destination">
                            <MapPin size={18} />
                            <span>
                              Downtown pickup <ArrowRight size={13} /> City
                              Square
                            </span>
                          </div>
                          {solution && (
                            <section
                              className="route-reason"
                              aria-label="Why this route"
                            >
                              <details>
                                <summary>Why Route {solution.routeId}?</summary>
                                <p>{solution.reasons.join(" · ")}</p>
                                <div>
                                  <span>
                                    {solution.maxSlope}% max modeled incline
                                  </span>
                                  <span>{solution.steps} steps</span>
                                </div>
                                <small>
                                  Calculated locally · illustrative conditions
                                </small>
                              </details>
                            </section>
                          )}
                          <div className="route-list">
                            {routes
                              .filter((r) => r.id !== "C" || state.obstacle)
                              .sort((a, b) => {
                                const rec = recommendedId;
                                return (
                                  Number(b.id === rec) - Number(a.id === rec)
                                );
                              })
                              .map((r) => {
                                const recommended = r.id === recommendedId;
                                return (
                                  <article
                                    className={
                                      "route-card " +
                                      (r.id === state.selectedRoute
                                        ? "selected"
                                        : "")
                                    }
                                    key={r.id}
                                    style={
                                      {
                                        "--route-order":
                                          r.id === "A"
                                            ? 1
                                            : r.id === "B"
                                              ? 0
                                              : 2,
                                      } as React.CSSProperties
                                    }
                                    onPointerEnter={() => setHoveredRoute(r.id)}
                                    onPointerLeave={() => setHoveredRoute(null)}
                                    onFocusCapture={() => setHoveredRoute(r.id)}
                                    onBlurCapture={(e) => {
                                      if (
                                        !e.currentTarget.contains(
                                          e.relatedTarget as Node,
                                        )
                                      )
                                        setHoveredRoute(null);
                                    }}
                                  >
                                    {recommended && (
                                      <span className="recommendation">
                                        <Sparkles size={12} />{" "}
                                        {state.preferences.includes(
                                          "distance",
                                        ) && r.id === "A"
                                          ? "SHORTEST DISTANCE"
                                          : "RECOMMENDED FOR YOU"}
                                      </span>
                                    )}
                                    <button
                                      className="route-select"
                                      onClick={() =>
                                        dispatch({ type: "route", route: r.id })
                                      }
                                      disabled={
                                        !!state.obstacle &&
                                        r.id !== recommendedId
                                      }
                                      aria-pressed={
                                        r.id === state.selectedRoute
                                      }
                                    >
                                      <div className="route-card-title">
                                        <span>ROUTE {r.id}</span>
                                        <span className="radio-dot">
                                          {r.id === state.selectedRoute && (
                                            <Check size={12} />
                                          )}
                                        </span>
                                      </div>
                                      <h3>{r.name}</h3>
                                      <div className="route-metrics">
                                        <strong>
                                          {routeDistance(r)} <small>m</small>
                                        </strong>
                                        <span>
                                          <Clock3 size={15} />
                                          {Math.max(
                                            1,
                                            Math.ceil(routeDistance(r) / 60),
                                          )}{" "}
                                          min estimate
                                        </span>
                                      </div>
                                      <p>{r.description}</p>
                                      <div className="route-features">
                                        {r.features.slice(0, 2).map((f) => (
                                          <span key={f}>
                                            {r.id === "A" ? (
                                              <Flag size={13} />
                                            ) : (
                                              <Check size={13} />
                                            )}{" "}
                                            {f}
                                          </span>
                                        ))}
                                      </div>
                                    </button>
                                    <details className="route-details">
                                      <summary>
                                        Pathway details{" "}
                                        <ChevronDown size={14} />
                                      </summary>
                                      <p>
                                        {r.features.join(" · ")}.{" "}
                                        {r.id === "A" &&
                                        state.preferences.includes("slopes")
                                          ? "Less aligned with your incline preference. "
                                          : ""}
                                        {r.id === "B"
                                          ? "Recommended when step-free paths, curb ramps, or gentler inclines are prioritized. "
                                          : ""}
                                        {state.obstacle && r.id !== "C"
                                          ? "This route includes the reported example barrier. "
                                          : ""}
                                        Crossings and curb availability are
                                        illustrative. Surface quality, exact
                                        slope, seating, elevators, entrances,
                                        and construction have not been verified.
                                      </p>
                                    </details>
                                  </article>
                                );
                              })}
                          </div>
                        </>
                      )}
                    </>
                  )}
                  <div className="scenario-disclaimer">
                    <ShieldCheck size={14} />
                    <span>
                      Bentonville pilot · accessibility conditions are modeled.
                    </span>
                  </div>
                </div>
                {["dashboard", "routes", "prepare"].includes(stage) && (
                  <div className="journey-action-dock">
                    {stage !== "dashboard" && (
                      <div className="dock-route-summary">
                        <span>
                          <span className="dock-route-dot" />
                          Route {state.selectedRoute} selected
                        </span>
                        <strong>
                          {routeDistance(route)} m{" "}
                          <span>
                            ·{" "}
                            {Math.max(1, Math.ceil(routeDistance(route) / 60))}{" "}
                            min
                          </span>
                        </strong>
                      </div>
                    )}
                    <button
                      className="button full"
                      onClick={
                        stage === "dashboard"
                          ? findRoutes
                          : () => go("navigation")
                      }
                    >
                      {stage === "dashboard"
                        ? "Find accessible routes"
                        : stage === "routes"
                          ? `Continue with route ${state.selectedRoute}`
                          : "Start navigation preview"}
                      <ArrowRight size={18} />
                    </button>
                    {stage === "routes" && (
                      <button
                        className="dock-report"
                        onClick={() => setReportOpen(true)}
                      >
                        <Flag size={14} />
                        Report a barrier
                      </button>
                    )}
                    {stage === "prepare" && (
                      <span className="dock-note">
                        Visual walkthrough · manual controls available
                      </span>
                    )}
                  </div>
                )}
              </aside>
              <div className="map-area">
                {stage === "processing" && (
                  <div className="map-processing-indicator">
                    <span className="live-dot" />
                    <strong>Comparing the featured pathways</strong>
                    <small>
                      Illustrative route data · your preferences applied
                    </small>
                  </div>
                )}
                <Suspense
                  fallback={
                    <div className="map-loading">Preparing your map…</div>
                  }
                >
                  <MapView
                    selected={state.selectedRoute}
                    showRoutes={stage !== "dashboard"}
                    reported={!!state.obstacle}
                    hovered={hoveredRoute}
                    sidebar
                  />
                </Suspense>
                <div className="map-top-label">
                  <span className="round-icon">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <strong>Bentonville City Square</strong>
                    <small>
                      Downtown pickup <span aria-hidden="true">→</span> City
                      Square
                    </small>
                  </div>
                </div>
                <div className="map-bottom-card">
                  <span className="round-icon teal">
                    <ShieldCheck size={22} />
                  </span>
                  <div>
                    <strong>
                      {stage === "dashboard"
                        ? "Your mobility, remembered."
                        : `Route ${state.selectedRoute} · ${routeDistance(route)} m`}
                    </strong>
                    <small>
                      {stage === "dashboard"
                        ? profile.name
                        : `${Math.max(1, Math.ceil(routeDistance(route) / 60))} min estimate · ${profile.name}`}
                    </small>
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      )}
      {reportOpen && (
        <ReportDialog
          close={() => {
            setReportOpen(false);
            if (state.stage === "navigation" && resumeAfterReport.current)
              dispatch({ type: "ar-control", control: "play" });
            resumeAfterReport.current = false;
          }}
          submit={(obstacle) => {
            dispatch({
              type: "report",
              obstacle,
              fromNavigation: state.stage === "navigation",
              resumePlayback: resumeAfterReport.current,
            });
            setReportOpen(false);
          }}
        />
      )}
    </MotionConfig>
  );
}
