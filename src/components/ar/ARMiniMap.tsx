import { lazy, Suspense } from "react";
import { Maximize2, LocateFixed, X } from "lucide-react";
import type { Route } from "../../types/journey";
const MapView = lazy(() => import("../MapView"));
export default function ARMiniMap({
  route,
  progress,
  reported,
  expanded,
  onExpand,
  onClose,
}: {
  route: Route;
  progress: number;
  reported: boolean;
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
}) {
  return (
    <section
      className={"ar-minimap " + (expanded ? "expanded" : "")}
      aria-label={expanded ? "Expanded journey map" : "Journey mini-map"}
    >
      <div className="ar-minimap-heading">
        <span>
          <LocateFixed size={14} /> ROUTE {route.id} ·{" "}
          {Math.round(progress * 100)}%
        </span>
        <button
          onClick={expanded ? onClose : onExpand}
          aria-label={expanded ? "Close expanded map" : "Expand mini-map"}
        >
          {expanded ? <X size={17} /> : <Maximize2 size={14} />}
        </button>
      </div>
      <Suspense
        fallback={<div className="ar-minimap-loading">Loading route map…</div>}
      >
        <MapView
          selected={route.id}
          showRoutes
          reported={reported}
          progress={progress}
          compact={!expanded}
        />
      </Suspense>
      <div className="ar-minimap-footer">
        Scripted position <span>{route.distance} m · sample route</span>
      </div>
    </section>
  );
}
