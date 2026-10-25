import { routes, hazard } from "../data/journey";
import type { PreferenceId, Route } from "../types/journey";
export type Coordinate = [number, number];
export const supportedPreferences: PreferenceId[] = [
  "stairs",
  "slopes",
  "ramps",
  "curbs",
  "uneven",
  "smooth",
  "crossings",
  "distance",
  "construction",
];
export function meters(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180,
    lat = (b[1] - a[1]) * rad,
    lon = (b[0] - a[0]) * rad;
  return (
    6371000 *
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin(lat / 2) ** 2 +
          Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(lon / 2) ** 2,
      ),
    )
  );
}
const key = (p: Coordinate) => p.join(",");
export interface Edge {
  id: string;
  a: string;
  b: string;
  length: number;
  slope: number;
  steps: number;
  ramp: boolean;
  rough: boolean;
  crossing: boolean;
}
const allPoints = Array.from(
  new Map(
    [...routes.flatMap((r) => r.coordinates), hazard].map((p) => [key(p), p]),
  ).values(),
);
const lies = (p: Coordinate, a: Coordinate, b: Coordinate) =>
  Math.abs(meters(a, p) + meters(p, b) - meters(a, b)) < 0.05;
export const nodes = Object.fromEntries(allPoints.map((p) => [key(p), p]));
const edgeMap = new Map<string, Edge>();
for (const route of routes)
  for (let i = 1; i < route.coordinates.length; i++) {
    const a = route.coordinates[i - 1],
      b = route.coordinates[i];
    const points = allPoints
      .filter((p) => lies(p, a, b))
      .sort((x, y) => meters(a, x) - meters(a, y));
    for (let j = 1; j < points.length; j++) {
      const u = points[j - 1],
        v = points[j],
        id = [key(u), key(v)].sort().join("|");
      const steep =
        route.id === "A" &&
        a[0] === b[0] &&
        a[0] === routes[0].coordinates[0][0];
      edgeMap.set(id, {
        id,
        a: key(u),
        b: key(v),
        length: meters(u, v),
        slope: steep ? 8 : 2,
        steps: steep ? 3 : 0,
        ramp: !steep,
        rough: steep,
        crossing: Math.abs(u[0] - v[0]) > 0.0008,
      });
    }
  }
export const edges = [...edgeMap.values()];
export const reportEdgeIds = edges
  .filter((e) => e.a === key(hazard) || e.b === key(hazard))
  .map((e) => e.id);
export interface Solution {
  routeId: Route["id"];
  coordinates: Coordinate[];
  edgeIds: string[];
  distance: number;
  maxSlope: number;
  steps: number;
  cost: number;
  reasons: string[];
}
export function solveRoute(
  preferences: PreferenceId[],
  reported = false,
  extraBlocked: string[] = [],
): Solution | null {
  const blocked = new Set([
      ...extraBlocked,
      ...(reported ? reportEdgeIds : []),
    ]),
    start = key(routes[0].coordinates[0]),
    end = key(routes[0].coordinates.at(-1)!);
  const costs = new Map([[start, 0]]),
    previous = new Map<string, { node: string; edge: Edge }>(),
    pending = new Set(Object.keys(nodes));
  while (pending.size) {
    let current: string | undefined,
      best = Infinity;
    for (const n of pending) {
      const c = costs.get(n) ?? Infinity;
      if (c < best) {
        current = n;
        best = c;
      }
    }
    if (!current) break;
    pending.delete(current);
    if (current === end) break;
    for (const e of edges) {
      const next = e.a === current ? e.b : e.b === current ? e.a : null;
      if (!next || !pending.has(next) || blocked.has(e.id)) continue;
      if (preferences.includes("stairs") && e.steps > 0) continue;
      if (
        (preferences.includes("ramps") || preferences.includes("curbs")) &&
        !e.ramp
      )
        continue;
      let penalty = 0;
      if (preferences.includes("slopes"))
        penalty += Math.max(0, e.slope - 3) * e.length;
      if (
        (preferences.includes("smooth") || preferences.includes("uneven")) &&
        e.rough
      )
        penalty += e.length * 3;
      if (preferences.includes("crossings") && e.crossing) penalty += 35;
      const score = best + e.length + penalty;
      if (score < (costs.get(next) ?? Infinity)) {
        costs.set(next, score);
        previous.set(next, { node: current, edge: e });
      }
    }
  }
  if (!costs.has(end)) return null;
  const path: Edge[] = [],
    coords: Coordinate[] = [nodes[end]];
  let cursor = end;
  while (cursor !== start) {
    const p = previous.get(cursor);
    if (!p) return null;
    path.unshift(p.edge);
    coords.unshift(nodes[p.node]);
    cursor = p.node;
  }
  const routeId: Route["id"] = coords.some((p) => p[1] > 36.3728)
    ? "C"
    : coords.some((p) => p[0] < -94.211)
      ? "B"
      : "A";
  const reasons = [
    reported
      ? "Reported segment excluded"
      : preferences.includes("stairs")
        ? "Stair segments excluded"
        : "Shortest weighted path",
  ];
  if (preferences.includes("ramps"))
    reasons.push("Curb-ramp requirement applied");
  if (preferences.includes("slopes"))
    reasons.push("Steeper segments penalized");
  if (preferences.includes("smooth") || preferences.includes("uneven"))
    reasons.push("Uneven surfaces penalized");
  return {
    routeId,
    coordinates: coords,
    edgeIds: path.map((e) => e.id),
    distance: Math.round(path.reduce((s, e) => s + e.length, 0)),
    maxSlope: Math.max(...path.map((e) => e.slope)),
    steps: path.reduce((s, e) => s + e.steps, 0),
    cost: costs.get(end)!,
    reasons,
  };
}
export const routeDistance = (route: Route) =>
  Math.round(
    route.coordinates
      .slice(1)
      .reduce((s, p, i) => s + meters(route.coordinates[i], p), 0),
  );
export function heading(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  return (
    ((Math.atan2(
      Math.sin((b[0] - a[0]) * rad) * Math.cos(b[1] * rad),
      Math.cos(a[1] * rad) * Math.sin(b[1] * rad) -
        Math.sin(a[1] * rad) *
          Math.cos(b[1] * rad) *
          Math.cos((b[0] - a[0]) * rad),
    ) *
      180) /
      Math.PI +
      360) %
    360
  );
}
export function streetName(a: Coordinate, b: Coordinate) {
  if (
    Math.abs(a[1] - b[1]) < 0.00005 &&
    a[0] > -94.209 &&
    a[1] > 36.3724 &&
    a[1] < 36.3728
  )
    return "the City Square approach";
  if (Math.abs(a[1] - b[1]) < 0.00005)
    return a[1] > 36.3728
      ? "NW 2nd Street"
      : a[1] > 36.372
        ? "West Central Avenue"
        : "SW 2nd Street";
  return a[0] < -94.211
    ? "B Street"
    : a[0] < -94.2095
      ? "SW A Street"
      : "Main Street";
}
export function routeInstructions(route: Route) {
  return route.coordinates.slice(0, -1).map((p, i) => {
    const next = route.coordinates[i + 1],
      bearing = heading(p, next),
      direction = ["north", "east", "south", "west"][
        Math.round(bearing / 90) % 4
      ];
    return {
      coordinate: p,
      next,
      heading: bearing,
      distance: Math.round(meters(p, next)),
      street: streetName(p, next),
      text: `Head ${direction} on ${streetName(p, next)}`,
      index: i,
    };
  });
}
