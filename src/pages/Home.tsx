import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  useInView,
  useTransform,
} from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Accessibility,
  Check,
  MapPin,
  Navigation,
  Plus,
  Flag,
  ArrowDown,
  Pause,
  Play,
  ScanLine,
  Route as RouteIcon,
  SlidersHorizontal,
} from "lucide-react";
import Brand from "../components/Brand";
import HeroScenery from "../components/home/HeroScenery";
import AccessibilityStats from "../components/home/AccessibilityStats";
import InteractiveCursor from "../components/motion/InteractiveCursor";
import { useSurfaceMotion } from "../hooks/useSurfaceMotion";
import { defaults, profiles, routes } from "../data/journey";
import { routeDistance, solveRoute } from "../lib/routing";
import type { ProfileId, Route } from "../types/journey";

const project = (p: [number, number]) => [
  76 + (p[0] + 94.21125) * 190000,
  410 - (p[1] - 36.37148) * 180000,
];
const heroHeadline = "Navigation Without Barriers";
const marqueeFeatures = [
  { icon: Accessibility, label: "Wheelchair navigation" },
  { icon: ScanLine, label: "AR guidance" },
  { icon: RouteIcon, label: "Accessible routes" },
  { icon: Flag, label: "Obstacle reporting" },
  { icon: SlidersHorizontal, label: "Mobility preferences" },
];
const pilotPhotos = [
  {
    src: "/ar/bentonville/pilot-trail.webp",
    alt: "Paved Crystal Bridges Trail winding through Compton Gardens in Bentonville.",
    title: "Crystal Bridges Trail",
    detail: "Compton Gardens",
  },
  {
    src: "/ar/bentonville/square.webp",
    alt: "Downtown Bentonville City Square with its brick crossing and surrounding buildings.",
    title: "City Square",
    detail: "Downtown Bentonville",
  },
  {
    src: "/ar/bentonville/pilot-museum.webp",
    alt: "Walkway and buildings at Crystal Bridges Museum of American Art in Bentonville.",
    title: "Crystal Bridges",
    detail: "Museum grounds",
  },
  {
    src: "/ar/bentonville/pilot-station.webp",
    alt: "The former Bentonville train station and its surrounding grounds.",
    title: "Former train station",
    detail: "A Bentonville landmark",
  },
  {
    src: "/ar/bentonville/pilot-eighth.webp",
    alt: "Street and sidewalk along 8th Street in Bentonville.",
    title: "8th Street",
    detail: "Street and sidewalk",
  },
] as const;
function RoutePreview({ route, paused }: { route: Route; paused: boolean }) {
  const reduce = useReducedMotion();
  const r = route;
  const points = r.coordinates.map(project);
  return (
    <svg
      className="atlas-map"
      viewBox="0 0 640 520"
      role="img"
      aria-label={
        r.id === "C"
          ? "Alternative route avoiding the example barrier"
          : r.id === "B"
            ? "Step-free route around the modeled stairs"
            : "Shorter route through the modeled stair segment"
      }
    >
      <rect width="640" height="520" fill="#eeedf7" />
      <g fill="#dfdeed" stroke="#d3d1e5" strokeWidth="1">
        {[105, 284, 475].flatMap((x) =>
          [36, 177, 306, 440].map((y) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={x === 475 ? 115 : 130}
              height={y === 440 ? 70 : 70}
              rx="3"
            />
          )),
        )}
      </g>
      <path
        d="M0 410H640 M0 258H640 M0 144H640 M76 0V520 M280 0V520 M530 0V520"
        stroke="#fafaf6"
        strokeWidth="24"
        fill="none"
      />
      <rect x="552" y="161" width="80" height="77" rx="12" fill="#d0dec8" />
      <g fill="#767d73" fontFamily="Inter,sans-serif" fontSize="10">
        <text x="302" y="402">
          SW 2ND ST
        </text>
        <text x="120" y="249">
          WEST CENTRAL AVE
        </text>
        <text x="310" y="135">
          NW 2ND ST
        </text>
        <text x="536" y="287" transform="rotate(-90 536 287)">
          MAIN ST
        </text>
        <text x="564" y="198">
          CITY
        </text>
        <text x="564" y="213">
          SQUARE
        </text>
        <text x="60" y="363" transform="rotate(-90 60 363)">
          B STREET
        </text>
      </g>
      <polyline
        points={routes[0].coordinates
          .map(project)
          .map((p) => p.join(","))
          .join(" ")}
        fill="none"
        stroke="#8c938b"
        strokeWidth="3"
        strokeDasharray="5 7"
      />
      <motion.polyline
        key={`glow-${r.id}`}
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="#9d72ee"
        strokeWidth="25"
        opacity=".18"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce || paused ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduce || paused ? 0 : 1.1 }}
      />
      <motion.polyline
        key={r.id}
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="#7355d5"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce || paused ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduce || paused ? 0 : 1.1, ease: "easeInOut" }}
      />
      <polyline
        className="cinema-map-flow"
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="#ede5ff"
        strokeWidth="3"
        strokeDasharray="2 38"
        strokeLinecap="round"
      />
      <circle
        cx={points[0][0]}
        cy={points[0][1]}
        r="10"
        fill="white"
        stroke="#7355d5"
        strokeWidth="4"
      />
      <g transform={`translate(${points.at(-1)![0]},${points.at(-1)![1]})`}>
        <circle
          className="cinema-map-destination"
          r="25"
          fill="#9976d8"
          opacity=".2"
        />
        <circle r="18" fill="#253c36" />
        <path
          d="M-4 8V-8L7-5V2L-4-1"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
      </g>
      <g transform="translate(280,329)">
        <rect
          x="-16"
          y="-16"
          width="32"
          height="32"
          rx="9"
          fill="#fff8eb"
          stroke="#e8b96f"
        />
        <path
          d="M-8 6H-3V1H2V-4H8"
          fill="none"
          stroke="#9c6225"
          strokeWidth="2"
        />
      </g>
      <text x="302" y="333" fontSize="11" fill="#7b592c">
        Stairs
      </text>
      <text x="292" y="435" fontSize="11" fill="#243d36">
        Start here
      </text>
      <g transform="translate(590,52)">
        <path d="M0-12L-6 7L0 4L6 7Z" fill="#253c36" />
        <text y="-20" textAnchor="middle" fontSize="10" fill="#253c36">
          N
        </text>
      </g>
    </svg>
  );
}
export default function Home({
  start,
  profile = "manual",
  onProfile,
}: {
  start: () => void;
  profile?: ProfileId;
  onProfile?: (profile: ProfileId) => void;
}) {
  const [accessible, setAccessible] = useState(true);
  const [gentleSlopes, setGentleSlopes] = useState(true);
  const [previewBarrier, setPreviewBarrier] = useState(false);
  const reduced = useReducedMotion();
  const [effectsPaused, setEffectsPaused] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  const visibleHeadline =
    reduced || typingComplete
      ? heroHeadline
      : heroHeadline.slice(0, typedLength);
  const heroRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLElement>(null);
  const humanPhotoRef = useRef<HTMLElement>(null);
  const heroVisible = useInView(heroRef, { margin: "100px" });
  const marqueeVisible = useInView(marqueeRef, { margin: "80px" });
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const { scrollYProgress: humanPhotoProgress } = useScroll({
    target: humanPhotoRef,
    offset: ["start end", "end start"],
  });
  const previewParallax = useTransform(heroProgress, [0, 1], [0, -90]);
  const sceneryParallax = useTransform(heroProgress, [0, 1], [0, 155]);
  const humanPhotoParallax = useTransform(
    humanPhotoProgress,
    [0, 1],
    [42, -42],
  );
  const scenePointer = useMotionValue(0);
  const sceneryX = useSpring(scenePointer, { stiffness: 45, damping: 25 });
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const tiltX = useSpring(rotateX, { stiffness: 100, damping: 24 });
  const tiltY = useSpring(rotateY, { stiffness: 100, damping: 24 });
  const motionOff = !!reduced || effectsPaused;
  useSurfaceMotion("home", !motionOff);
  useEffect(() => {
    if (reduced) {
      const finishTimer = window.setTimeout(() => setTypingComplete(true), 0);
      return () => window.clearTimeout(finishTimer);
    }
    if (typingComplete) return;
    let index = 0;
    let typingTimer = 0;
    const startTimer = window.setTimeout(() => {
      typingTimer = window.setInterval(() => {
        index += 1;
        setTypedLength(index);
        if (index >= heroHeadline.length) {
          window.clearInterval(typingTimer);
          setTypingComplete(true);
        }
      }, 54);
    }, 180);
    return () => {
      window.clearTimeout(startTimer);
      if (typingTimer) window.clearInterval(typingTimer);
    };
  }, [reduced, typingComplete]);
  const reveal = {
    initial: {
      opacity: motionOff ? 1 : 0,
      y: motionOff ? 0 : 58,
      rotateX: motionOff ? 0 : 5,
    },
    whileInView: { opacity: 1, y: 0, rotateX: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: {
      duration: motionOff ? 0 : 0.9,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  };
  const previewSolution = solveRoute(
    [
      ...(accessible ? ["stairs" as const, "ramps" as const] : []),
      ...(gentleSlopes ? ["slopes" as const] : []),
    ],
    previewBarrier,
  );
  const previewRoute = {
    ...(routes.find((route) => route.id === previewSolution?.routeId) ??
      routes[1]),
    coordinates: previewSolution?.coordinates ?? routes[1].coordinates,
  };
  const isStepFree = previewRoute.id !== "A";
  const changePreviewProfile = (next: ProfileId) => {
    onProfile?.(next);
    setAccessible(
      defaults[next].includes("stairs") || defaults[next].includes("ramps"),
    );
    setGentleSlopes(defaults[next].includes("slopes"));
  };
  return (
    <div
      className="atlas-home"
      id="top"
      data-effects-paused={motionOff || !heroVisible}
      data-motion-paused={motionOff}
    >
      <InteractiveCursor disabled={motionOff} />
      <motion.div
        className="studio-scroll-progress"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
      <a href="#main" className="atlas-skip">
        Skip to content
      </a>
      <header className="atlas-header">
        <Brand
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduced ? "instant" : "smooth",
            })
          }
        />
        <nav aria-label="Main navigation">
          <a href="#how">The experience</a>
          <a href="#local">Our starting point</a>
          <a href="#questions">Questions</a>
        </nav>
        <button
          className="studio-motion-toggle"
          aria-label={
            effectsPaused
              ? "Enable background animation"
              : "Pause background animation"
          }
          aria-pressed={effectsPaused}
          onClick={() => setEffectsPaused((v) => !v)}
        >
          {effectsPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button className="atlas-link-button" onClick={start}>
          Open PathAble <ArrowUpRight size={18} />
        </button>
      </header>
      <main id="main">
        <section
          className="atlas-hero"
          ref={heroRef}
          onPointerMove={(event) => {
            if (motionOff || event.pointerType !== "mouse") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            scenePointer.set(
              ((event.clientX - bounds.left) / bounds.width - 0.5) * -24,
            );
          }}
          onPointerLeave={() => scenePointer.set(0)}
        >
          <HeroScenery
            y={sceneryParallax}
            x={sceneryX}
            paused={motionOff || !heroVisible}
          />
          <div className="studio-atmosphere" aria-hidden="true">
            <div className="studio-orb studio-orb-one" />
            <div className="studio-orb studio-orb-two" />
            <svg viewBox="0 0 1400 850" preserveAspectRatio="xMidYMid slice">
              <path
                className="studio-route-base"
                d="M-100 680H280Q350 680 350 610V380Q350 320 410 320H850Q920 320 920 250V120H1500"
              />
              <path
                className="studio-route-trace"
                d="M-100 680H280Q350 680 350 610V380Q350 320 410 320H850Q920 320 920 250V120H1500"
              />
              <circle cx="350" cy="610" r="8" />
              <circle cx="920" cy="250" r="8" />
              <circle cx="1140" cy="120" r="5" />
            </svg>
            {Array.from({ length: 12 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${8 + ((i * 29) % 85)}%`,
                  top: `${12 + ((i * 17) % 75)}%`,
                  animationDelay: `${i * -0.7}s`,
                }}
              />
            ))}
          </div>
          <motion.div className="atlas-hero-copy" {...reveal}>
            <div className="atlas-kicker">
              <span /> BENTONVILLE, ARKANSAS
            </div>
            <h1 aria-label={heroHeadline}>
              <span aria-hidden="true">
                {["Navigation", "Without", "Barriers"].map((word, index) => {
                  const offset = heroHeadline.indexOf(word);
                  const cursorHere =
                    index === 2
                      ? typingComplete || typedLength >= offset
                      : !typingComplete &&
                        typedLength >= offset &&
                        typedLength <= offset + word.length;
                  return (
                    <span
                      className={`cinema-title-line cinema-title-line-${index}`}
                      key={word}
                    >
                      {visibleHeadline.slice(offset, offset + word.length)}
                      {cursorHere && (
                        <i className="atlas-typewriter-cursor" />
                      )}{" "}
                    </span>
                  );
                })}
              </span>
            </h1>
            <p>
              A route should fit the person taking it. Explore pathways around
              your mobility needs, one city block at a time.
            </p>
            <button className="atlas-primary" data-magnetic onClick={start}>
              Start navigating <ArrowUpRight size={21} />
            </button>
            <a className="atlas-explore" href="#how">
              See the difference <ArrowDown size={16} />
            </a>
            <div className="atlas-hero-foot">
              <Accessibility size={20} />
              <span>
                Designed around mobility.
                <br />
                <strong>Starting with downtown Bentonville.</strong>
              </span>
            </div>
          </motion.div>
          <div className="cinema-scene-note">
            <span /> REAL PLACES. PERSONAL PATHWAYS.
            <small>Crystal Bridges Trail · Bentonville</small>
          </div>
          <motion.div
            className="atlas-preview"
            style={{
              y: motionOff ? 0 : previewParallax,
              rotateX: motionOff ? 0 : tiltX,
              rotateY: motionOff ? 0 : tiltY,
              transformPerspective: 1200,
            }}
            onPointerMove={(event) => {
              if (motionOff || event.pointerType !== "mouse") return;
              const bounds = event.currentTarget.getBoundingClientRect();
              rotateX.set(
                (0.5 - (event.clientY - bounds.top) / bounds.height) * 9,
              );
              rotateY.set(
                ((event.clientX - bounds.left) / bounds.width - 0.5) * 9,
              );
            }}
            onPointerLeave={() => {
              rotateX.set(0);
              rotateY.set(0);
            }}
            {...reveal}
            transition={{ duration: 0.65, delay: 0.12 }}
          >
            <div className="atlas-preview-header">
              <div>
                <span className="atlas-small">YOUR NEXT JOURNEY</span>
                <strong>Downtown → City Square</strong>
              </div>
              <MapPin size={20} />
            </div>
            <div className="atlas-map-container">
              <RoutePreview route={previewRoute} paused={motionOff} />
              <div className="atlas-map-tag">
                <span /> BENTONVILLE PILOT
              </div>
            </div>
            <div className="atlas-preview-bottom">
              <label className="cinema-preview-profile">
                <Accessibility size={15} />
                <span className="atlas-sr-only">
                  Mobility profile for route preview
                </span>
                <select
                  value={profile}
                  onChange={(event) =>
                    changePreviewProfile(event.target.value as ProfileId)
                  }
                >
                  {profiles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal size={14} />
              </label>
              <div
                className="atlas-segment"
                role="group"
                aria-label="Compare example routes"
              >
                <button
                  aria-pressed={!isStepFree}
                  onClick={() => {
                    setAccessible(false);
                    setGentleSlopes(false);
                  }}
                >
                  Shortest route
                </button>
                <button
                  aria-pressed={isStepFree}
                  onClick={() => {
                    setAccessible(true);
                    setGentleSlopes(true);
                  }}
                >
                  <Accessibility size={16} /> Step-free route
                </button>
              </div>
              <div
                className="cinema-route-preferences"
                role="group"
                aria-label="Try route preferences"
              >
                <button
                  aria-pressed={gentleSlopes}
                  onClick={() => setGentleSlopes((value) => !value)}
                >
                  <Check size={12} />
                  Gentler slopes
                </button>
                <button
                  aria-pressed={previewBarrier}
                  onClick={() => setPreviewBarrier((value) => !value)}
                >
                  <Flag size={12} />
                  Avoid example barrier
                </button>
              </div>
              <div className="atlas-preview-readout" aria-live="polite">
                <div>
                  <strong>
                    {previewSolution?.distance ?? routeDistance(previewRoute)}
                    <small> m</small>
                  </strong>
                  <span>
                    {previewBarrier
                      ? "Around the reported example barrier"
                      : isStepFree
                        ? "Around the stairs"
                        : "Includes modeled stairs"}
                  </span>
                </div>
                <span
                  className={
                    isStepFree ? "atlas-status" : "atlas-status warning"
                  }
                >
                  {isStepFree ? <Check size={15} /> : <Flag size={15} />}{" "}
                  {isStepFree
                    ? "Matches step-free needs"
                    : "Review this barrier"}
                </span>
              </div>
              <small className="atlas-caption">
                Interactive route study · modeled accessibility conditions
              </small>
            </div>
          </motion.div>
          <a
            className="cinema-scene-credit"
            href="/ar/ATTRIBUTION.md"
            target="_blank"
            rel="noreferrer"
          >
            Bentonville photography <ArrowUpRight size={12} />
          </a>
        </section>
        <section
          ref={marqueeRef}
          className="feature-marquee"
          aria-label="PathAble features"
          data-effects-paused={motionOff || !marqueeVisible}
        >
          <p className="atlas-sr-only">
            PathAble features: Wheelchair navigation, AR guidance, accessible
            routes, obstacle reporting, and mobility preferences.
          </p>
          <div className="feature-marquee-viewport" aria-hidden="true">
            <div className="feature-marquee-track">
              {[0, 1].map((copy) => (
                <div className="feature-marquee-group" key={copy}>
                  {marqueeFeatures.map(({ icon: Icon, label }) => (
                    <span className="feature-marquee-item" key={label}>
                      <Icon size={17} strokeWidth={1.8} />
                      {label}
                      <i />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
        <AccessibilityStats paused={motionOff} />
        <section
          className="atlas-human-story"
          aria-labelledby="human-story-title"
        >
          <motion.figure
            className="atlas-human-photo"
            ref={humanPhotoRef}
            {...reveal}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="atlas-human-image-pan"
              style={{ y: motionOff ? 0 : humanPhotoParallax }}
            >
              <img
                src="/ar/photography/wheelchair-photographer.webp"
                alt="A wheelchair user holding a camera on a busy city street."
                loading="lazy"
                decoding="async"
              />
            </motion.div>
            <figcaption>
              <span>Editorial street photography</span>
              <a
                href="https://www.pexels.com/photo/closeup-of-a-photographer-on-a-wheelchair-19417430/"
                target="_blank"
                rel="noreferrer"
                aria-label="Editorial photograph by Toàn Văn on Pexels"
              >
                Photo: Toàn Văn / Pexels ↗
              </a>
            </figcaption>
          </motion.figure>
          <motion.div className="atlas-human-copy" {...reveal}>
            <span className="atlas-kicker">ROUTES FOR REAL LIFE</span>
            <h2 id="human-story-title">
              The best route feels <em>like yours.</em>
            </h2>
            <p>
              Getting across town is personal. PathAble brings mobility
              preferences, curb details, and community reports into one clearer
              view of the journey ahead.
            </p>
            <div className="atlas-human-details">
              <span>Step-free choices</span>
              <span>Route context</span>
              <span>Community reports</span>
            </div>
          </motion.div>
        </section>
        <section id="how" className="atlas-experience">
          <motion.div className="atlas-section-heading" {...reveal}>
            <span className="atlas-kicker">01 / THE EXPERIENCE</span>
            <h2>
              Know the route.
              <br />
              <em>Before you take it.</em>
            </h2>
            <p>
              Less guesswork at the next crossing. More control over the way you
              get there.
            </p>
          </motion.div>
          <div className="atlas-feature-grid">
            <motion.article
              {...reveal}
              transition={{ duration: 0.55, delay: reduced ? 0 : 0.05 }}
            >
              <div className="atlas-feature-top">
                <span>01</span>
                <Accessibility />
              </div>
              <h3>Start with you.</h3>
              <p>
                Choose your mobility profile. Prioritize step-free paths, curb
                ramps, and gentler inclines.
              </p>
              <div
                className="atlas-profile-demo"
                role="group"
                aria-label="Preview mobility profile"
              >
                {(
                  [
                    ["manual", "Manual wheelchair"],
                    ["powered", "Powered wheelchair"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    aria-pressed={profile === id}
                    onClick={() => changePreviewProfile(id)}
                  >
                    <span>{profile === id && <Check size={12} />}</span>
                    {label}
                  </button>
                ))}
              </div>
            </motion.article>
            <motion.article
              {...reveal}
              transition={{ duration: 0.55, delay: reduced ? 0 : 0.15 }}
            >
              <div className="atlas-feature-top">
                <span>02</span>
                <Navigation />
              </div>
              <h3>See your next move.</h3>
              <p>
                Follow numbered directions, inspect the map, and open real
                street-level imagery when you need context.
              </p>
              <div className="atlas-instruction-example">
                <ArrowRight size={28} />
                <div>
                  <small>NEXT DIRECTION</small>
                  <strong>Turn onto Central Ave</strong>
                  <span>Then continue toward the square</span>
                </div>
              </div>
            </motion.article>
            <motion.article
              {...reveal}
              transition={{ duration: 0.55, delay: reduced ? 0 : 0.25 }}
            >
              <div className="atlas-feature-top">
                <span>03</span>
                <Flag />
              </div>
              <h3>Find another way.</h3>
              <p>
                A blocked curb changes the journey. Report it and recalculate
                around the affected segment.
              </p>
              <div className="atlas-report-example">
                <span className="atlas-hazard-dot" />
                <div>
                  <strong>Blocked curb ramp</strong>
                  <small>Excluded from the next route</small>
                </div>
                <Check size={18} />
              </div>
            </motion.article>
          </div>
        </section>
        <section id="local" className="atlas-local atlas-local-pilot">
          <div className="atlas-local-row atlas-local-row-first">
            <div className="atlas-local-heading">
              <motion.span className="atlas-kicker" {...reveal}>
                02 / OUR FIRST PILOT LAUNCH
              </motion.span>
              <motion.h2
                {...reveal}
                transition={{ ...reveal.transition, delay: reduced ? 0 : 0.08 }}
              >
                Starting Local.
                <br />
                <em>Thinking Bigger.</em>
              </motion.h2>
              <motion.p
                className="atlas-local-lead"
                {...reveal}
                transition={{ ...reveal.transition, delay: reduced ? 0 : 0.16 }}
              >
                Bentonville, Arkansas — Where Accessible Navigation Begins.
              </motion.p>
              <motion.p
                className="atlas-local-introduction"
                {...reveal}
                transition={{ ...reveal.transition, delay: reduced ? 0 : 0.24 }}
              >
                For our initial pilot launch, PathAble focuses on Bentonville,
                Arkansas. We&apos;ve developed an initial model of the
                city&apos;s pedestrian network to explore how sidewalk
                conditions, accessibility barriers, and individual mobility
                preferences can influence navigation.
              </motion.p>
            </div>
            <div
              className="atlas-local-gallery atlas-local-gallery-first"
              role="group"
              aria-label="Photographs from across Bentonville, Arkansas"
            >
              {pilotPhotos.slice(0, 3).map((photo, index) => (
                <motion.figure
                  className={`atlas-local-photo atlas-local-photo-${index + 1}`}
                  key={photo.src}
                  {...reveal}
                  transition={{
                    ...reveal.transition,
                    delay: reduced ? 0 : index * 0.1,
                  }}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    <strong>{photo.title}</strong>
                    <span>{photo.detail}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
          <div className="atlas-local-row atlas-local-row-second">
            <div
              className="atlas-local-gallery atlas-local-gallery-second"
              role="group"
              aria-label="More photographs of Bentonville"
            >
              {pilotPhotos.slice(3).map((photo, index) => (
                <motion.figure
                  className={`atlas-local-photo atlas-local-photo-${index + 4}`}
                  key={photo.src}
                  {...reveal}
                  transition={{
                    ...reveal.transition,
                    delay: reduced ? 0 : index * 0.12,
                  }}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    <strong>{photo.title}</strong>
                    <span>{photo.detail}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
            <motion.div className="atlas-local-copy" {...reveal}>
              <p>
                By starting in Bentonville, we&apos;re building a foundation for
                smarter, more inclusive navigation that can eventually expand to
                communities everywhere.
              </p>
              <div className="atlas-local-detail">
                <MapPin />
                <div>
                  <strong>Bentonville, Arkansas → Our First Pilot City</strong>
                  <span>
                    Personalized accessible routes. Smarter navigation. Greater
                    independence.
                  </span>
                </div>
              </div>
              <button className="atlas-text-action" onClick={start}>
                Explore PathAble in Bentonville <ArrowUpRight size={19} />
              </button>
              <small>
                Images of Bentonville.{" "}
                <a href="/ar/ATTRIBUTION.md" target="_blank" rel="noreferrer">
                  Photo credits ↗
                </a>
              </small>
            </motion.div>
          </div>
        </section>
        <section id="questions" className="atlas-faq">
          <motion.div {...reveal}>
            <span className="atlas-kicker">03 / GOOD TO KNOW</span>
            <h2>A clearer picture.</h2>
            <p>What works today, and what comes next.</p>
          </motion.div>
          <div>
            {[
              [
                "Where can I use PathAble?",
                "This pilot supports a small downtown Bentonville network between the featured pickup point and City Square. It is not citywide navigation.",
              ],
              [
                "How are routes personalized?",
                "A local graph search excludes modeled stairs or missing ramps when required, and adds penalties for slopes and uneven surfaces. Your choices affect the recommended route.",
              ],
              [
                "Is Street View the same as augmented reality?",
                "No. Street View opens Google’s panoramic imagery in another tab. Live camera-aligned AR is a future feature, and the route preview does not track your GPS position.",
              ],
              [
                "What happens when I report a barrier?",
                "The report stays in your browser session. The affected segment is excluded and the route is recalculated from the starting point. Nothing is sent to a city agency.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <motion.section className="atlas-final" {...reveal}>
          <div>
            <span className="atlas-kicker">YOUR JOURNEY STARTS HERE</span>
            <h2>
              Make room for
              <br />
              <em>your way forward.</em>
            </h2>
          </div>
          <button className="atlas-primary light" onClick={start}>
            Find your route <ArrowUpRight size={23} />
          </button>
        </motion.section>
      </main>
      <footer className="atlas-footer">
        <Brand
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduced ? "instant" : "smooth",
            })
          }
        />
        <span>Mobility-first navigation · Bentonville pilot</span>
        <a href="#questions">
          About this pilot <ArrowUpRight size={15} />
        </a>
      </footer>
    </div>
  );
}
