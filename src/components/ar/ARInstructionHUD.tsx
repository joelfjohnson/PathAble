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
}: {
  scene: ARScene;
  index: number;
  total: number;
  routeId: string;
}) {
  const Icon = icons[scene.turn];
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
        <p>
          {scene.distanceLabel} <span>· illustrative</span>
        </p>
      </div>
    </div>
  );
}
