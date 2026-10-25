import type { Point, ARScene } from "../../types/ar";
import type { Route } from "../../types/journey";
export const clamp = (n: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
const distance = (a: number[], b: number[]) =>
  Math.hypot((b[0] - a[0]) * Math.cos((36.37 * Math.PI) / 180), b[1] - a[1]);
export function pointAlongRoute(
  route: Route,
  progress: number,
): [number, number] {
  const lengths = route.coordinates
    .slice(1)
    .map((p, i) => distance(route.coordinates[i], p));
  const total = lengths.reduce((a, b) => a + b, 0);
  let remaining = clamp(progress) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const t = lengths[i] ? clamp(remaining / lengths[i]) : 0,
        a = route.coordinates[i],
        b = route.coordinates[i + 1];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    remaining -= lengths[i];
  }
  return route.coordinates[0];
}
export function progressAtCoordinate(
  route: Route,
  coordinate: [number, number],
) {
  const lengths = route.coordinates
    .slice(1)
    .map((p, i) => distance(route.coordinates[i], p));
  const total = lengths.reduce((a, b) => a + b, 0);
  let traversed = 0,
    best = Infinity,
    result = 0;
  for (let i = 0; i < lengths.length; i++) {
    const a = route.coordinates[i],
      b = route.coordinates[i + 1],
      sx = Math.cos((36.37 * Math.PI) / 180),
      vx = (b[0] - a[0]) * sx,
      vy = b[1] - a[1];
    const t = clamp(
      ((coordinate[0] - a[0]) * sx * vx + (coordinate[1] - a[1]) * vy) /
        (vx * vx + vy * vy),
    );
    const p: [number, number] = [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
      ],
      d = distance(p, coordinate);
    if (d < best) {
      best = d;
      result = (traversed + lengths[i] * t) / total;
    }
    traversed += lengths[i];
  }
  return clamp(result);
}
export function sceneRouteProgress(scene: ARScene, elapsed: number) {
  return (
    scene.progressStart +
    (scene.progressEnd - scene.progressStart) *
      clamp(elapsed / scene.durationSeconds)
  );
}
export function pointsAtTime(scene: ARScene, time: number): Point[] {
  const frames = scene.pathKeyframes;
  if (!frames?.length) return scene.pathPoints;
  const next = frames.findIndex((f) => f.time >= time);
  if (next <= 0)
    return next === 0 ? frames[0].points : frames[frames.length - 1].points;
  const a = frames[next - 1],
    b = frames[next],
    t = clamp((time - a.time) / (b.time - a.time));
  return a.points.map((p, i) => ({
    x: p.x + (b.points[i].x - p.x) * t,
    y: p.y + (b.points[i].y - p.y) * t,
  }));
}
// Catmull–Rom interpolation keeps the ribbon and its tangent aligned through turns.
export function samplePath(points: Point[], count = 64): Point[] {
  if (points.length < 2) return points;
  return Array.from({ length: count }, (_, i) => {
    const t = (i / (count - 1)) * (points.length - 1),
      j = Math.min(Math.floor(t), points.length - 2),
      u = t - j;
    const a = points[Math.max(0, j - 1)],
      b = points[j],
      c = points[j + 1],
      d = points[Math.min(points.length - 1, j + 2)];
    const axis = (k: "x" | "y") =>
      0.5 *
      (2 * b[k] +
        (-a[k] + c[k]) * u +
        (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * u * u +
        (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * u * u * u);
    return { x: axis("x"), y: axis("y") };
  });
}
export function coverTransform(
  viewWidth: number,
  viewHeight: number,
  mediaWidth: number,
  mediaHeight: number,
) {
  const scale = Math.max(viewWidth / mediaWidth, viewHeight / mediaHeight);
  return {
    width: mediaWidth * scale,
    height: mediaHeight * scale,
    left: (viewWidth - mediaWidth * scale) / 2,
    top: (viewHeight - mediaHeight * scale) / 2,
  };
}
