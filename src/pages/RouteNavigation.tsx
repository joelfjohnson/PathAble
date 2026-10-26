import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Navigation,
  Flag,
  ExternalLink,
  Volume2,
  ScanLine,
} from "lucide-react";
import MapView from "../components/MapView";
import ImmersiveARPreview from "../components/ar/ImmersiveARPreview";
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
  return (
    <section className="route-navigation" aria-label="Route navigation">
      <header className="navigation-top">
        <button className="nav-button" onClick={onBack}>
          <ArrowLeft size={18} /> Routes
        </button>
        <div>
          <strong>Bentonville City Square</strong>
          <span>
            Route {route.id} · {routeDistance(route)} m
          </span>
        </div>
        <span className="pilot-chip">Bentonville routes</span>
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
              Opens Google Maps in a new tab. Imagery availability varies.
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
        <ImmersiveARPreview
          route={route}
          profile={state.profile}
          obstacle={!!state.obstacle}
          onClose={() => setArOpen(false)}
          onReport={() => onReport(true)}
          onArrive={() => {
            setArOpen(false);
            dispatch({ type: "stage", stage: "arrived" });
          }}
        />
      )}
    </section>
  );
}
