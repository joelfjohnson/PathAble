import { useId } from "react";
import { pointsAtTime, samplePath } from "./geometry";
import type { ARScene } from "../../types/ar";
export default function ARPathOverlay({
  scene,
  elapsed,
  width,
  height,
  reduced,
  playing,
}: {
  scene: ARScene;
  elapsed: number;
  width: number;
  height: number;
  reduced: boolean;
  playing: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const points = samplePath(pointsAtTime(scene, elapsed));
  const scaled = points.map((p) => ({ x: p.x * width, y: p.y * height }));
  const left: string[] = [],
    right: string[] = [];
  scaled.forEach((p, i) => {
    const a = scaled[Math.max(i - 1, 0)],
      b = scaled[Math.min(i + 1, scaled.length - 1)],
      dx = b.x - a.x,
      dy = b.y - a.y,
      len = Math.hypot(dx, dy) || 1,
      half =
        ((0.004 + 0.055 * (1 - i / (scaled.length - 1)) ** 1.8) * width) / 2;
    left.push(`${p.x - (dy / len) * half},${p.y + (dx / len) * half}`);
    right.push(`${p.x + (dy / len) * half},${p.y - (dx / len) * half}`);
  });
  const polygon = [...left, ...right.reverse()].join(" ");
  return (
    <svg
      className="ar-path-overlay"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      data-overlay-time={elapsed.toFixed(2)}
      data-playing={playing}
    >
      <defs>
        <linearGradient
          id={`ribbon-${id}`}
          x1="0"
          y1="1"
          x2="0"
          y2="0"
          gradientUnits="objectBoundingBox"
        >
          <stop stopColor="#8B5CF6" stopOpacity=".55" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity=".3" />
        </linearGradient>
        <filter
          id={`shadow-${id}`}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#3b1e65"
            floodOpacity=".24"
          />
        </filter>
      </defs>
      <polygon
        points={polygon}
        fill={`url(#ribbon-${id})`}
        stroke="#f3edff"
        strokeWidth="2"
        filter={`url(#shadow-${id})`}
      />
      <polyline
        points={scaled.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#b9a0ff"
        strokeOpacity=".7"
        strokeWidth="2"
      />
      {Array.from({ length: 6 }, (_, i) => {
        const t = (i / 6 + (reduced ? 0 : elapsed * 0.035)) % 1,
          index = Math.min(
            scaled.length - 2,
            Math.floor(t * (scaled.length - 1)),
          ),
          a = scaled[index],
          q = scaled[index + 1],
          fraction = t * (scaled.length - 1) - index,
          p = {
            x: a.x + (q.x - a.x) * fraction,
            y: a.y + (q.y - a.y) * fraction,
          },
          size = (0.006 + 0.027 * (1 - t) ** 1.5) * width,
          angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + 90;
        return (
          <g
            key={i}
            transform={`translate(${p.x} ${p.y}) rotate(${angle})`}
            opacity={0.5 + (1 - t) * 0.45}
          >
            <path
              d={`M${-size / 2} ${size / 4}L0 ${-size / 4}L${size / 2} ${size / 4}`}
              fill="none"
              stroke="#fff"
              strokeWidth={size * 0.19}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M${-size / 2} ${size / 4}L0 ${-size / 4}L${size / 2} ${size / 4}`}
              fill="none"
              stroke="#6d28d9"
              strokeWidth={size * 0.085}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      {scene.id === "barrier" && (
        <g transform={`translate(${width * 0.39} ${height * 0.77})`}>
          <ellipse cy="10" rx="63" ry="10" fill="#251332" opacity=".28" />
          <path d="M-45 8L-35-60M45 8L35-60" stroke="#e6e0d8" strokeWidth="7" />
          <rect
            x="-55"
            y="-55"
            width="110"
            height="30"
            rx="4"
            fill="#f5a541"
            stroke="#fff5db"
            strokeWidth="2"
          />
          <path
            d="M-44-53l20 26M-13-53l20 26M18-53l20 26"
            stroke="#fff4db"
            strokeWidth="12"
          />
        </g>
      )}
      {scene.indicators
        .filter(
          (i) =>
            i.region && elapsed >= i.from && elapsed <= (i.until ?? Infinity),
        )
        .map((i) => (
          <polygon
            key={i.id}
            points={i
              .region!.map((p) => `${p.x * width},${p.y * height}`)
              .join(" ")}
            fill="#c4b5fd"
            fillOpacity=".35"
            stroke="#fff"
            strokeWidth="4"
          />
        ))}
    </svg>
  );
}
