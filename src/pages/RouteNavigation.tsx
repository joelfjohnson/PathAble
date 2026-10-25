import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Navigation,
  Flag,
  ExternalLink,
  Volume2,
  ScanLine,
  X,
} from "lucide-react";
import MapView from "../components/MapView";
import { routes } from "../data/journey";
import {
  routeInstructions,
  routeDistance,
  type Coordinate,
} from "../lib/routing";
import type { NavigationState, JourneyAction } from "../types/journey";
export default function RouteNavigation({
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
  const steps = routeInstructions(route),
    index = Math.min(Math.max(0, state.currentStep), steps.length - 1),
    step = steps[index];
  const [inspected, setInspected] = useState<Coordinate | null>(null);
  const [arOpen, setArOpen] = useState(false);
  const point = inspected ?? step.coordinate;
  const url =
    "https://www.google.com/maps/@?" +
    new URLSearchParams({
      api: "1",
      map_action: "pano",
      viewpoint: `${point[1]},${point[0]}`,
      heading: String(Math.round(step.heading)),
      pitch: "0",
    });
  const remaining = steps.slice(index).reduce((sum, s) => sum + s.distance, 0);
  const move = (n: number) => {
    setInspected(null);
    dispatch({ type: "nav-step", index: n });
  };
  const turn = (i: number) => {
    if (i === 0) return steps[i].text;
    const delta = ((steps[i].heading - steps[i - 1].heading + 540) % 360) - 180;
    return `${Math.abs(delta) < 30 ? "Continue" : delta > 0 ? "Turn right" : "Turn left"} onto ${steps[i].street}`;
  };
  useEffect(() => {
    if (!arOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setArOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [arOpen]);
  return (
    <section className="route-navigation" aria-label="Route navigation">
      <header className="navigation-top">
        <button className="nav-button" onClick={onBack}>
          <ArrowLeft size={18} /> Routes
        </button>
        <div>
          <strong>Bentonville City Square</strong>
          <span>
            Route {route.id} · {routeDistance(route)} m · route preview
          </span>
        </div>
        <span className="pilot-chip">Bentonville pilot</span>
      </header>
      <div className="navigation-layout">
        <aside className="directions-panel">
          {state.obstacle && (
            <div className="reroute-notice" role="status">
              Route recalculated from the starting point. Reported segment
              excluded.
            </div>
          )}
          <div className="instruction-card" aria-live="polite">
            <Navigation
              size={30}
              style={{ transform: `rotate(${step.heading - 45}deg)` }}
            />
            <span>
              STEP {index + 1} OF {steps.length}
            </span>
            <h1>{turn(index)}</h1>
            <p>
              Continue for <strong>{step.distance} m</strong>
            </p>
            <small>
              {remaining} m remaining · estimated{" "}
              {Math.max(1, Math.ceil(remaining / 60))} min
            </small>
          </div>
          <button
            className="nav-button voice-button"
            onClick={() => {
              if ("speechSynthesis" in window) {
                speechSynthesis.cancel();
                speechSynthesis.speak(
                  new SpeechSynthesisUtterance(
                    `${turn(index)}. Continue for ${step.distance} meters.`,
                  ),
                );
              }
            }}
          >
            <Volume2 size={18} /> Read instruction
          </button>
          <ol className="direction-list">
            {steps.map((s, i) => (
              <li key={i}>
                <button
                  aria-current={i === index ? "step" : undefined}
                  onClick={() => move(i)}
                >
                  <span>{i + 1}</span>
                  <div>
                    <strong>{turn(i)}</strong>
                    <small>{s.distance} m</small>
                  </div>
                </button>
              </li>
            ))}
          </ol>
          <div className="navigation-actions">
            <button
              className="nav-button"
              disabled={index === 0}
              onClick={() => move(index - 1)}
            >
              Previous
            </button>
            <button
              className="nav-button primary"
              onClick={() =>
                index === steps.length - 1
                  ? dispatch({ type: "stage", stage: "arrived" })
                  : move(index + 1)
              }
            >
              {index === steps.length - 1 ? "Finish route" : "Next direction"}
              <ArrowRight size={18} />
            </button>
          </div>
          <button
            className="nav-button report-action"
            disabled={!!state.obstacle}
            onClick={() => onReport(false)}
          >
            <Flag size={17} />
            {state.obstacle ? "Barrier reported" : "Report a barrier"}
          </button>
          <p className="navigation-note">
            Step through the planned route. Position is not live GPS;
            accessibility conditions are modeled and require field verification.
          </p>
        </aside>
        <div className="navigation-map-panel">
          <MapView
            selected={route.id}
            showRoutes
            reported={!!state.obstacle}
            coordinate={step.coordinate}
            onInspect={setInspected}
          />
          <div className="street-inspector">
            <div>
              <strong>
                {inspected ? "Selected map location" : "Explore this direction"}
              </strong>
              <p>
                Click any street on the map, then open its real panoramic
                imagery.
              </p>
            </div>
            <a
              className="nav-button primary"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Google Street View <ExternalLink size={17} />
            </a>
            <small>
              Opens Google Maps in a new tab. Imagery availability varies. This
              is Street View, not live AR.
            </small>
            <button
              className="nav-button ar-preview-action"
              onClick={() => setArOpen(true)}
            >
              <ScanLine size={18} /> View AR navigation
            </button>
            {inspected && (
              <button className="nav-button" onClick={() => setInspected(null)}>
                Return to current step
              </button>
            )}
          </div>
        </div>
      </div>
      {arOpen && (
        <div
          className="ar-preview-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setArOpen(false);
          }}
        >
          <section
            className="ar-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ar-preview-title"
          >
            <header>
              <div>
                <span>PATHABLE AR NAVIGATION · BENTONVILLE</span>
                <h2 id="ar-preview-title">Follow your route.</h2>
                <p>
                  Navigate toward Bentonville City Square with PathAble’s purple
                  guidance layer.
                </p>
              </div>
              <button
                className="ar-preview-close"
                aria-label="Close AR navigation preview"
                onClick={() => setArOpen(false)}
              >
                <X size={20} />
              </button>
            </header>
            <div className="ar-preview-video-wrap">
              <video
                className="ar-preview-video"
                src="/ar/videos/PathAble_AR_Navigation_FINAL.mp4"
                controls
                playsInline
                preload="metadata"
                aria-label="PathAble augmented reality navigation preview"
              />
              <div className="ar-preview-badge" aria-hidden="true">
                <ScanLine size={16} /> AR NAVIGATION
              </div>
            </div>
            <footer>
              <span>Route {route.id} · Bentonville City Square</span>
              <small>
                Featured journey preview · camera and GPS tracking are not
                active.
              </small>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
