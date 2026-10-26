import { ArrowUp, CornerUpRight, CornerUpLeft, MapPin } from "lucide-react";
import type { ARScene } from "../../types/ar";
const icons = {
  straight: ArrowUp,
  right: CornerUpRight,
  left: CornerUpLeft,
  arrive: MapPin,
};
export default function ARInstructionHUD({
  scene,
  index,
  total,
  routeId,
  elapsed = 0,
}: {
  scene: ARScene;
  index: number;
  total: number;
  routeId: string;
  elapsed?: number;
}) {
  const Icon = icons[scene.turn];
  const distance = scene.distanceLabel.match(/about (\d+) m/);
  const distanceLabel = distance
    ? scene.distanceLabel.replace(
        `about ${distance[1]} m`,
        `about ${Math.max(5, Math.round((Number(distance[1]) * (1 - Math.min(1, elapsed / scene.durationSeconds))) / 5) * 5)} m`,
      )
    : scene.distanceLabel;
  return (
    <div className="ar-instruction-hud" aria-live="polite" aria-atomic="true">
      <span className="ar-direction-icon">
        <Icon size={28} />
      </span>
      <div>
        <div className="ar-hud-meta">
          ROUTE {routeId} <span>·</span> STEP {index + 1} OF {total}
        </div>
        <h2 tabIndex={-1}>{scene.instruction}</h2>
        <p aria-live="off">
          {distanceLabel} <span>· estimated</span>
        </p>
      </div>
    </div>
  );
}
