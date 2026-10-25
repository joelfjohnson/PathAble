import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { ARScene } from "../../types/ar";
import type { PreferenceId } from "../../types/journey";
import { coverTransform, clamp } from "./geometry";
import ARPathOverlay from "./ARPathOverlay";
import ARAccessibilityMarker from "./ARAccessibilityMarker";
function NeutralScene({ sceneId }: { sceneId: string }) {
  return (
    <svg
      viewBox="0 0 1600 1200"
      preserveAspectRatio="none"
      className="ar-neutral-scene"
      role="img"
      aria-label="Location-neutral sidewalk illustration"
    >
      <path fill="#e7edf1" d="M0 0h1600v1200H0z" />
      <path fill="#e5e1dc" d="M1050 390l550-90v520l-550-100z" />
      <path fill="#bac6cc" d="M1140 470l400-55v145l-400 35z" />
      <path fill="#c4d2c6" d="M0 600l520 80 220 180H0z" />
      <path fill="#acb1bb" d="M0 830l780-140 820 200v310H0z" />
      <path fill="#eee5d9" d="M1600 1200H930L650 820l-190-110 48-25 205 98z" />
      <path fill="#fbf7f0" d="M1080 1200H920L615 810l-150-95 30-20 200 90z" />
      <path d="M315 600v150M860 560v200" stroke="#93978e" strokeWidth="16" />
      <g fill="#aec5b3">
        <ellipse cx="315" cy="500" rx="195" ry="195" />
        <ellipse cx="860" cy="470" rx="170" ry="170" />
      </g>
      {sceneId === "barrier" && (
        <g>
          <path d="M795 745h145v55H795z" fill="#b28c5d" />
          <path
            d="M810 749l30 45m20-45 30 45"
            stroke="#fff4df"
            strokeWidth="14"
          />
        </g>
      )}
      {sceneId.includes("crossing") && (
        <path
          d="M800 850l250-30m-220 80 250-30m-220 80 250-30"
          stroke="#faf8ef"
          strokeWidth="27"
        />
      )}
      {sceneId === "depart" && (
        <g>
          <path d="M80 730h320v-50H80z" fill="#8f879f" />
          <path
            d="M105 730v210m270-210v210"
            stroke="#b6acbc"
            strokeWidth="12"
          />
        </g>
      )}
      <path
        d="M765 790h70l33 33-91 21z"
        fill="#f3e4cd"
        stroke="#c0b19a"
        strokeWidth="3"
      />
    </svg>
  );
}
export default function ARSceneRenderer({
  scene,
  elapsed,
  playing,
  preferences,
  onVideo,
  preloadMedia,
  onMediaStatus,
}: {
  scene: ARScene;
  elapsed: number;
  playing: boolean;
  preferences: PreferenceId[];
  onVideo: (id: string, node: HTMLVideoElement | null) => void;
  preloadMedia?: ARScene["media"];
  onMediaStatus: (id: string, ready: boolean, failed: boolean) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const attachVideo = useCallback(
    (node: HTMLVideoElement | null) => onVideo(scene.id, node),
    [onVideo, scene.id],
  );
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: scene.media.width,
    height: scene.media.height,
  });
  const reduced = !!useReducedMotion();
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!preloadMedia) return;
    const image = new Image();
    image.src =
      preloadMedia.type === "image"
        ? preloadMedia.src
        : (preloadMedia.poster ?? "");
    let clip: HTMLVideoElement | undefined;
    if (preloadMedia.type === "video") {
      clip = document.createElement("video");
      clip.preload = "metadata";
      clip.src = preloadMedia.src;
      clip.load();
    }
    return () => {
      image.onload = null;
      if (clip) {
        clip.removeAttribute("src");
        clip.load();
      }
    };
  }, [preloadMedia]);
  useEffect(() => {
    const element = box.current?.querySelector<
      HTMLVideoElement | HTMLImageElement
    >(".ar-scene-media");
    if (!element) return;
    let mounted = true;
    const ready = () => {
      if (!mounted) return;
      const width =
        element instanceof HTMLVideoElement
          ? element.videoWidth
          : element.naturalWidth;
      const height =
        element instanceof HTMLVideoElement
          ? element.videoHeight
          : element.naturalHeight;
      setDimensions({
        width: width || scene.media.width,
        height: height || scene.media.height,
      });
      onMediaStatus(scene.id, true, false);
    };
    const failed = () => {
      if (!mounted) return;
      setFailed(true);
      onMediaStatus(scene.id, false, true);
    };
    for (const event of ["loadedmetadata", "canplay", "load"])
      element.addEventListener(event, ready);
    element.addEventListener("error", failed);
    if (element instanceof HTMLVideoElement) {
      if (element.error) queueMicrotask(failed);
      else if (element.readyState >= 1) queueMicrotask(ready);
    } else if (element.complete)
      queueMicrotask(element.naturalWidth > 0 ? ready : failed);
    return () => {
      mounted = false;
      for (const event of ["loadedmetadata", "canplay", "load"])
        element.removeEventListener(event, ready);
      element.removeEventListener("error", failed);
    };
  }, [
    onMediaStatus,
    scene.id,
    scene.media.width,
    scene.media.height,
    scene.media.type,
    scene.media.src,
  ]);
  const plane = coverTransform(
    size.width,
    size.height,
    dimensions.width,
    dimensions.height,
  );
  // Preserve the ground in wide viewports instead of cropping away the sidewalk.
  plane.top = size.height - plane.height;
  const mediaFailure = () => {
    setFailed(true);
    onMediaStatus(scene.id, false, true);
  };
  useEffect(() => {
    if (scene.media.type !== "video" || failed) return;
    const video = box.current?.querySelector("video");
    if (!video) return;
    let lastTime = video.currentTime;
    let stalledFor = 0;
    const timer = window.setInterval(() => {
      const stalled =
        video.readyState < 2 ||
        (playing && !video.paused && video.currentTime === lastTime);
      stalledFor = stalled ? stalledFor + 1 : 0;
      lastTime = video.currentTime;
      if (stalledFor >= 5) {
        setFailed(true);
        onMediaStatus(scene.id, false, true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [scene.id, scene.media.type, failed, playing, onMediaStatus]);
  const progress = clamp(elapsed / scene.durationSeconds);
  const cameraScale = reduced
    ? 1
    : 1 + progress * (scene.camera?.zoom ?? 0.014);
  const cameraX = reduced
    ? 0
    : progress * (scene.camera?.panX ?? 0) * size.width;
  const cameraY = reduced
    ? 0
    : progress * (scene.camera?.panY ?? 0) * size.height;
  return (
    <div
      ref={box}
      className="ar-scene-renderer"
      data-scene-id={scene.id}
      data-media-fallback={failed}
    >
      <div
        className="ar-world"
        style={{
          transform: reduced
            ? "none"
            : `translate3d(${cameraX}px,${cameraY}px,0) scale(${cameraScale})`,
        }}
      >
        <div
          className="ar-media-plane"
          style={{
            width: plane.width,
            height: plane.height,
            left: plane.left,
            top: plane.top,
          }}
        >
          {scene.media.type === "video" && !failed && scene.media.poster && (
            <img
              className="ar-scene-poster"
              src={scene.media.poster}
              alt=""
              aria-hidden="true"
            />
          )}
          {failed ? (
            scene.media.poster && !posterFailed ? (
              <img
                className="ar-scene-media"
                src={scene.media.poster}
                alt={scene.media.alt}
                onError={() => setPosterFailed(true)}
              />
            ) : (
              <NeutralScene sceneId={scene.id} />
            )
          ) : scene.media.type === "video" ? (
            <video
              ref={attachVideo}
              style={{ opacity: videoVisible ? 1 : 0 }}
              onLoadedData={() => setVideoVisible(true)}
              className="ar-scene-media"
              src={scene.media.src}
              poster={scene.media.poster}
              muted
              playsInline
              preload="auto"
              aria-label={scene.media.alt}
              onLoadedMetadata={(e) => {
                setDimensions({
                  width: e.currentTarget.videoWidth || scene.media.width,
                  height: e.currentTarget.videoHeight || scene.media.height,
                });
                onMediaStatus(scene.id, true, false);
              }}
              onError={mediaFailure}
            />
          ) : (
            <img
              className="ar-scene-media"
              src={scene.media.src}
              alt={scene.media.alt}
              onLoad={(e) => {
                setDimensions({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                });
                onMediaStatus(scene.id, true, false);
              }}
              onError={mediaFailure}
            />
          )}
          <ARPathOverlay
            scene={scene}
            elapsed={elapsed}
            width={dimensions.width}
            height={dimensions.height}
            reduced={reduced}
            playing={playing}
          />
        </div>
        {scene.indicators
          .filter(
            (i) =>
              elapsed >= i.from &&
              elapsed <= (i.until ?? Infinity) &&
              (!i.preference ||
                preferences.includes(i.preference) ||
                i.type === "curb-ramp"),
          )
          .map((i) => (
            <ARAccessibilityMarker
              key={i.id}
              indicator={i}
              x={plane.left + i.point.x * plane.width}
              y={plane.top + i.point.y * plane.height}
              viewWidth={size.width}
            />
          ))}
      </div>
      <div className="ar-scene-vignette" />
      <div className="ar-media-label">
        <strong>
          {failed
            ? "Illustrative scene · media unavailable"
            : scene.media.isReference
              ? `Bentonville · ${scene.locationLabel}`
              : `Illustrative viewpoint · ${scene.locationLabel}`}
        </strong>
        <span>
          {failed
            ? "The walkthrough continues with a neutral visual."
            : "Historical imagery · simulated navigation"}
        </span>
      </div>
    </div>
  );
}
