import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
maplibregl.setWorkerUrl(workerUrl);
import { destination, hazard, routes, start } from "../data/journey";
import { pointAlongRoute } from "./ar/geometry";
import type { Route } from "../types/journey";
export default function MapView({
  selected,
  showRoutes,
  reported,
  progress,
  compact = false,
  hovered,
  sidebar = false,
}: {
  selected: Route["id"];
  showRoutes: boolean;
  reported: boolean;
  progress?: number;
  compact?: boolean;
  hovered?: Route["id"] | null;
  sidebar?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null),
    map = useRef<maplibregl.Map | null>(null);
  const positionMarker = useRef<maplibregl.Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [viewSize, setViewSize] = useState("");
  useEffect(() => {
    if (!container.current) return;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({
        container: container.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [-94.2099, 36.3719],
        zoom: 16.4,
        attributionControl: { compact: true },
      });
      map.current = m;
      m.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      m.addControl(new maplibregl.ScaleControl(), "bottom-right");
      m.on("error", () => {
        if (!m.isStyleLoaded()) setFailed(true);
      });
      m.on("load", () => {
        setFailed(false);
        setReady(true);
      });
      [
        [start, "start-marker", "●", "Simulated transit pickup"],
        [destination, "end-marker", "⚑", "Bentonville City Square"],
      ].forEach(([coord, cls, label, title]) => {
        const el = document.createElement("div");
        el.className = cls as string;
        el.textContent = label as string;
        el.title = title as string;
        new maplibregl.Marker({ element: el })
          .setLngLat(coord as [number, number])
          .addTo(m);
      });
      const ro = new ResizeObserver(([entry]) => {
        m.resize();
        setViewSize(`${entry.contentRect.width}:${entry.contentRect.height}`);
      });
      ro.observe(container.current);
      return () => {
        ro.disconnect();
        m.remove();
        map.current = null;
      };
    } catch {
      queueMicrotask(() => setFailed(true));
    }
  }, []);
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    for (const r of routes) {
      const id = "route-" + r.id;
      const visible = showRoutes && (r.id !== "C" || reported);
      const data = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: visible ? r.coordinates : [],
        },
      };
      if (m.getSource(id))
        (m.getSource(id) as maplibregl.GeoJSONSource).setData(data);
      else {
        m.addSource(id, { type: "geojson", data });
        m.addLayer({
          id,
          type: "line",
          source: id,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": r.id === selected ? "#7c3aed" : "#9098a5",
            "line-width": r.id === selected ? 7 : 4,
            "line-opacity": r.id === selected ? 1 : 0.35,
            "line-opacity-transition": { duration: 400 },
            "line-color-transition": { duration: 350 },
          },
        });
      }
      m.setPaintProperty(
        id,
        "line-color",
        r.id === selected ? "#7c3aed" : "#9098a5",
      );
      m.setPaintProperty(id, "line-width", r.id === selected ? 7 : 4);
      m.setPaintProperty(id, "line-opacity", r.id === selected ? 1 : 0.45);
    }
    let animationFrame = 0;
    if (
      showRoutes &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const coordinates = routes.find((r) => r.id === selected)!.coordinates;
      const source = m.getSource(
        "route-" + selected,
      ) as maplibregl.GeoJSONSource;
      const started = performance.now();
      const draw = (now: number) => {
        const progress =
          Math.max(0, Math.min((now - started) / 950, 1)) *
          (coordinates.length - 1);
        const index = Math.min(Math.floor(progress), coordinates.length - 2);
        const fraction = progress - index;
        const a = coordinates[index],
          b = coordinates[index + 1];
        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              ...coordinates.slice(0, index + 1),
              [
                a[0] + (b[0] - a[0]) * fraction,
                a[1] + (b[1] - a[1]) * fraction,
              ],
            ],
          },
        });
        if (progress < coordinates.length - 1)
          animationFrame = requestAnimationFrame(draw);
      };
      animationFrame = requestAnimationFrame(draw);
    }
    if (showRoutes) {
      m.resize();
      m.moveLayer("route-" + selected);
      const coordinates = routes.find((r) => r.id === selected)!.coordinates;
      const bounds = new maplibregl.LngLatBounds(
        coordinates[0],
        coordinates[0],
      );
      coordinates.forEach((point) => bounds.extend(point));
      m.fitBounds(bounds, {
        padding: compact
          ? Math.min(22, m.getContainer().clientHeight * 0.15)
          : {
              top: Math.min(145, m.getContainer().clientHeight * 0.22),
              bottom: Math.min(75, m.getContainer().clientHeight * 0.12),
              left:
                sidebar && m.getContainer().clientWidth > 700
                  ? Math.min(460, m.getContainer().clientWidth * 0.4)
                  : Math.min(55, m.getContainer().clientWidth * 0.12),
              right: Math.min(55, m.getContainer().clientWidth * 0.12),
            },
        maxZoom: 17,
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : 900,
      });
    }
    const el = document.createElement("div");
    el.className = "hazard-marker" + (reported ? " is-reported" : "");
    el.textContent = reported ? "!" : "◇";
    el.title = reported
      ? "Reported example barrier"
      : "Example curb-ramp location";
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(hazard)
      .addTo(m);
    return () => {
      cancelAnimationFrame(animationFrame);
      marker.remove();
    };
  }, [ready, selected, showRoutes, reported, compact, sidebar, viewSize]);
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    for (const r of routes) {
      const id = "route-" + r.id;
      if (m.getLayer(id)) {
        m.setPaintProperty(
          id,
          "line-width",
          r.id === selected ? 7 : r.id === hovered ? 5 : 3,
        );
        m.setPaintProperty(
          id,
          "line-opacity",
          r.id === selected ? 1 : r.id === hovered ? 0.9 : 0.35,
        );
      }
    }
  }, [ready, selected, hovered]);
  useEffect(() => {
    const m = map.current;
    if (!m || !ready || progress === undefined) return;
    const coordinate = pointAlongRoute(
      routes.find((r) => r.id === selected)!,
      progress,
    );
    if (!positionMarker.current) {
      const el = document.createElement("div");
      el.className = "ar-position-marker";
      el.title = "Scripted journey position";
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", "Scripted journey position");
      positionMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat(coordinate)
        .addTo(m);
    } else positionMarker.current.setLngLat(coordinate);
    positionMarker.current.getElement().dataset.progress = String(progress);
  }, [ready, progress, selected]);
  useEffect(
    () => () => {
      positionMarker.current = null;
    },
    [],
  );
  return (
    <div
      className={"map-wrap " + (compact ? "compact-map" : "")}
      data-selected-route={selected}
      data-highlighted-route={hovered ?? selected}
    >
      <div
        ref={container}
        className="map-canvas"
        aria-label="Interactive map of the featured Bentonville journey"
      />
      {!ready && !failed && (
        <div className="map-tile-loading" role="status">
          <div className="map-skeleton-lines" />
          <span>
            <i />
            Preparing your Bentonville map…
          </span>
        </div>
      )}
      {failed && (
        <div className="map-error" role="status">
          Map tiles are unavailable. Route details remain available in the
          journey panel.
        </div>
      )}
      <div className="map-location">
        <span className="live-dot" /> BENTONVILLE, AR{" "}
        <span>36.3729° N · 94.2088° W</span>
      </div>
      <div className="map-legend">
        <i /> Selected route <i className="neutral" /> Other route
      </div>
    </div>
  );
}
