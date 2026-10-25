import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Flag,
  LocateFixed,
  Map as MapIcon,
  Maximize2,
  Pause,
  Play,
  ScanLine,
  Volume2,
  X,
} from "lucide-react";
import { routeDistance, routeInstructions } from "../../lib/routing";
import type { ProfileId, Route } from "../../types/journey";

type Phase = "loading" | "active";

const profileLabels: Record<ProfileId, string> = {
  manual: "Manual wheelchair",
  powered: "Powered wheelchair",
  walker: "Walker or cane",
  limited: "Limited walking mobility",
  temporary: "Temporary mobility restrictions",
};

export default function ImmersiveARPreview({
  route,
  profile,
  obstacle,
  onClose,
  onReport,
  onArrive,
}: {
  route: Route;
  profile: ProfileId;
  obstacle: boolean;
  onClose: () => void;
  onReport: () => void;
  onArrive: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(1);
  const [voice, setVoice] = useState(false);
  const [miniMap, setMiniMap] = useState(false);
  const instructions = useMemo(() => routeInstructions(route), [route]);
  const progress = Math.min(1, elapsed / Math.max(1, duration));
  const stepIndex = Math.min(
    instructions.length - 1,
    Math.floor(progress * instructions.length),
  );
  const step = instructions[stepIndex] ?? {
    text: "Continue to your destination",
    distance: 0,
    heading: 0,
    street: "Bentonville City Square",
    coordinate: route.coordinates.at(-1) ?? route.coordinates[0],
  };
  const remaining = Math.max(0, Math.round(routeDistance(route) * (1 - progress)));
  const messages = [
    "Preparing your route",
    "Loading navigation view",
    `Route ${route.id} ready`,
  ];

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setInterval(() => setMessage((value) => Math.min(2, value + 1)), 420);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase("active"), 1250);
    return () => window.clearTimeout(timer);
  }, [route.id]);

  useEffect(() => {
    if (phase !== "active") return;
    const element = video.current;
    if (!element) return;
    element.currentTime = 0;
    void element.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [phase, route.id]);

  useEffect(() => {
    if (!voice || !step || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(`${step.text}. Continue for ${step.distance} meters.`));
  }, [voice, step]);

  const sync = () => {
    const element = video.current;
    if (!element) return;
    setElapsed(element.currentTime);
    setDuration(element.duration || 1);
  };
  const togglePlay = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      if (element.ended) element.currentTime = 0;
      void element.play().then(() => setPlaying(true));
    } else {
      element.pause();
      setPlaying(false);
    }
  };
  const announce = () => {
    if (!("speechSynthesis" in window) || !step) return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(`${step.text}. ${step.distance} meters.`));
  };
  const toggleVoice = () => {
    if (voice) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setVoice(false);
      return;
    }
    setVoice(true);
    announce();
  };
  const routePointArray = route.coordinates.map(([longitude, latitude]) => {
    const x = 14 + ((longitude + 94.212) / 0.004) * 72;
    const y = 88 - ((latitude - 36.3708) / 0.003) * 72;
    return `${x},${Math.max(10, Math.min(90, y))}`;
  });
  const routePoints = routePointArray.join(" ");
  const activePoint = routePointArray[Math.max(0, Math.min(routePointArray.length - 1, Math.floor(progress * routePointArray.length)))] ?? "14,88";

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen?.();
    }
  };

  return (
    <div className={`immersive-ar ${phase === "loading" ? "is-loading" : "is-active"}`} role="dialog" aria-modal="true" aria-label="PathAble AR navigation">
      <div className="immersive-ar-environment">
        <video
          ref={video}
          className="immersive-ar-video"
          src="/ar/videos/PathAble_AR_Navigation_FINAL.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={sync}
          onTimeUpdate={sync}
          onEnded={() => setPlaying(false)}
          aria-label="Bentonville route environment"
        />
        <div className="immersive-ar-ui-mask" aria-hidden="true" />
        <div className="immersive-ar-vignette" aria-hidden="true" />
      </div>

      {phase === "loading" ? (
        <div className="immersive-ar-loading" aria-live="polite">
          <div className="ar-loading-orbit"><span /><span /><span /><ScanLine size={31} /></div>
          <div className="ar-loading-brand">PathAble<span>.</span></div>
          <h1 id="immersive-ar-title">Your way forward.</h1>
          <p>{messages[message]}</p>
          <div className="ar-loading-progress"><i style={{ width: `${Math.min(92, 24 + message * 32)}%` }} /></div>
          <small>Personalized for {profileLabels[profile]}</small>
        </div>
      ) : (
        <>
          <header className="immersive-ar-topbar">
            <button className="ar-glass-button" aria-label="Close AR navigation" onClick={onClose}><ArrowLeft size={19} /></button>
            <div className="immersive-ar-destination"><span>NOW NAVIGATING</span><strong>Route {route.id} · {route.name} · Bentonville City Square</strong></div>
            <div className="immersive-ar-top-actions">
              <span className="ar-interactive-chip"><i /> Interactive preview</span>
              <button className="ar-glass-button" aria-label="Toggle fullscreen" onClick={toggleFullscreen}><Maximize2 size={18} /></button>
            </div>
          </header>
          <div className="immersive-ar-turn-card" aria-live="polite">
            <div className="ar-turn-icon"><ArrowRight size={25} style={{ transform: `rotate(${step.heading - 90}deg)` }} /></div>
            <div><span>NEXT DIRECTION · {stepIndex + 1} OF {instructions.length}</span><h2>{step.text}</h2><p>{step.distance} m ahead · {remaining} m remaining</p></div>
          </div>
          {stepIndex >= 2 && <div className="immersive-ar-alert"><Accessibility size={18} /><span><strong>Accessibility alert</strong><small>Follow the highlighted curb-ramp connection.</small></span></div>}
          {obstacle && <div className="immersive-ar-reroute" role="status"><LocateFixed size={17} /><span><strong>Route updated</strong><small>Continuing on the alternative accessible path.</small></span></div>}
          {miniMap && <aside className="immersive-ar-minimap" aria-label="Route progress map"><div className="ar-map-title"><MapIcon size={14} /> ROUTE {route.id}<button aria-label="Collapse mini-map" onClick={() => setMiniMap(false)}><X size={13} /></button></div><svg viewBox="0 0 100 100"><polyline points={routePoints} fill="none" stroke="#ffffff55" strokeWidth="3" /><polyline points={routePoints} fill="none" stroke="#a77dff" strokeWidth="3" strokeDasharray="8 3" /><circle cx="14" cy="88" r="3" fill="#9be3c0" /><circle cx={activePoint.split(",")[0]} cy={activePoint.split(",")[1]} r="4" fill="#8fd7ff" /><circle cx="86" cy="14" r="4" fill="#fff" /></svg><span>{Math.round(progress * 100)}% complete</span></aside>}
          {!miniMap && <button className="immersive-ar-map-reopen" aria-label="Show mini-map" onClick={() => setMiniMap(true)}><MapIcon size={16} /><span>Map</span></button>}
          <div className="immersive-ar-profile"><Accessibility size={16} /><span>{profileLabels[profile]}</span></div>
          <div className="immersive-ar-bottom">
            <div className="immersive-ar-progress-row" aria-label={`Journey progress ${Math.round(progress * 100)} percent`}><span>ROUTE</span><i><b style={{ width: `${progress * 100}%` }} /></i><strong>{Math.round(progress * 100)}%</strong></div>
            <div className="immersive-ar-controls"><button className="ar-control-main" aria-label={playing ? "Pause navigation" : "Start navigation"} onClick={togglePlay}>{playing ? <Pause size={20} /> : <Play size={20} />}</button><button aria-label={voice ? "Disable voice guidance" : "Enable voice guidance"} aria-pressed={voice} onClick={toggleVoice}><Volume2 size={18} /></button><button aria-label="Report an obstacle" onClick={onReport}><Flag size={18} /><em>Report</em></button></div>
            <div className="immersive-ar-footnote"><span><i /> PathAble AR navigation</span><button onClick={onArrive}>Destination reached</button><small>Illustrative route preview · GPS tracking is off</small></div>
          </div>
        </>
      )}
    </div>
  );
}
