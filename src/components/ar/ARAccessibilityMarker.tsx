import {
  Accessibility,
  Construction,
  DoorOpen,
  Armchair,
  TriangleAlert,
  MoveUpRight,
  Footprints,
  ArrowUpDown,
} from "lucide-react";
import type { ARIndicator } from "../../types/ar";
const icons = {
  "curb-ramp": Accessibility,
  incline: MoveUpRight,
  surface: Footprints,
  construction: Construction,
  entrance: DoorOpen,
  rest: Armchair,
  elevator: ArrowUpDown,
  stairs: TriangleAlert,
  obstacle: TriangleAlert,
};
export default function ARAccessibilityMarker({
  indicator,
  x,
  y,
  viewWidth,
}: {
  indicator: ARIndicator;
  x: number;
  y: number;
  viewWidth: number;
}) {
  const Icon = icons[indicator.type];
  const cardX = Math.max(112, Math.min(viewWidth - 112, x));
  return (
    <div
      className={
        "ar-annotation " +
        (["construction", "obstacle", "incline"].includes(indicator.type)
          ? "warning"
          : "")
      }
      style={{ left: cardX, top: Math.max(130, y - 60) }}
    >
      <details>
        <summary>
          <Icon size={17} />
          <span>{indicator.label}</span>
        </summary>
        <p>{indicator.detail}</p>
      </details>
      <svg
        aria-hidden="true"
        className="ar-annotation-stem"
        width="100%"
        height="60"
        viewBox="0 0 224 60"
        overflow="visible"
      >
        <path
          d={`M112 0L${112 + x - cardX} 55`}
          stroke="#fff"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
        <circle
          cx={112 + x - cardX}
          cy="55"
          r="5"
          fill="#8b5cf6"
          stroke="#fff"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
