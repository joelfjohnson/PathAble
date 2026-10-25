import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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
} from "lucide-react";
import Brand from "../components/Brand";
import { routes } from "../data/journey";
import { routeDistance } from "../lib/routing";
import type { ProfileId } from "../types/journey";

const project = (p: [number, number]) => [
  76 + (p[0] + 94.21125) * 190000,
  410 - (p[1] - 36.37148) * 180000,
];
function RoutePreview({ accessible }: { accessible: boolean }) {
  const reduce = useReducedMotion();
  const r = routes[accessible ? 1 : 0];
  const points = r.coordinates.map(project);
  return (
    <svg
      className="atlas-map"
      viewBox="0 0 640 520"
      role="img"
      aria-label={
        accessible
          ? "Step-free route around the modeled stairs"
          : "Shorter route through the modeled stair segment"
      }
    >
      <rect width="640" height="520" fill="#eeeee7" />
      <g fill="#e3e3da" stroke="#d8d9ce" strokeWidth="1">
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
        key={r.id}
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="#7355d5"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduce ? 0 : 0.8, ease: "easeInOut" }}
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
  const reduced = useReducedMotion();
  const reveal = {
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.55 },
  };
  const previewRoute = routes[accessible ? 1 : 0];
  return (
    <div className="atlas-home" id="top">
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
        <button className="atlas-link-button" onClick={start}>
          Open PathAble <ArrowUpRight size={18} />
        </button>
      </header>
      <main id="main">
        <section className="atlas-hero">
          <motion.div className="atlas-hero-copy" {...reveal}>
            <div className="atlas-kicker">
              <span /> BENTONVILLE, ARKANSAS
            </div>
            <h1>
              More freedom.
              <br />
              Fewer <em>barriers.</em>
            </h1>
            <p>
              A route should fit the person taking it. Explore pathways around
              your mobility needs, one city block at a time.
            </p>
            <button className="atlas-primary" onClick={start}>
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
          <motion.div
            className="atlas-preview"
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
              <RoutePreview accessible={accessible} />
              <div className="atlas-map-tag">
                <span /> BENTONVILLE PILOT
              </div>
            </div>
            <div className="atlas-preview-bottom">
              <div
                className="atlas-segment"
                role="group"
                aria-label="Compare example routes"
              >
                <button
                  aria-pressed={!accessible}
                  onClick={() => setAccessible(false)}
                >
                  Shortest route
                </button>
                <button
                  aria-pressed={accessible}
                  onClick={() => setAccessible(true)}
                >
                  <Accessibility size={16} /> Step-free route
                </button>
              </div>
              <div className="atlas-preview-readout" aria-live="polite">
                <div>
                  <strong>
                    {routeDistance(previewRoute)}
                    <small> m</small>
                  </strong>
                  <span>
                    {accessible
                      ? "Around the stairs"
                      : "Includes modeled stairs"}
                  </span>
                </div>
                <span
                  className={
                    accessible ? "atlas-status" : "atlas-status warning"
                  }
                >
                  {accessible ? <Check size={15} /> : <Flag size={15} />}{" "}
                  {accessible
                    ? "Matches step-free needs"
                    : "Review this barrier"}
                </span>
              </div>
              <small className="atlas-caption">
                Interactive route study · modeled accessibility conditions
              </small>
            </div>
          </motion.div>
        </section>
        <div className="atlas-principles">
          <span>
            <Accessibility size={18} /> Mobility comes first
          </span>
          <span>
            <Navigation size={18} /> Directions with context
          </span>
          <span>
            <Flag size={18} /> A way around obstacles
          </span>
        </div>
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
            <motion.article {...reveal}>
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
                    onClick={() => onProfile?.(id)}
                  >
                    <span>{profile === id && <Check size={12} />}</span>
                    {label}
                  </button>
                ))}
              </div>
            </motion.article>
            <motion.article {...reveal}>
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
            <motion.article {...reveal}>
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
        <section id="local" className="atlas-local">
          <motion.div className="atlas-local-photo" {...reveal}>
            <img
              src="/ar/scenes/bentonville-square.webp"
              alt="Historic view of downtown Bentonville's brick storefronts and streets"
              loading="lazy"
            />
            <span>BENTONVILLE, AR · HISTORICAL REFERENCE</span>
          </motion.div>
          <motion.div className="atlas-local-copy" {...reveal}>
            <span className="atlas-kicker">02 / OUR STARTING POINT</span>
            <h2>
              A familiar place.
              <br />
              <em>A different perspective.</em>
            </h2>
            <p>
              We’re starting with one downtown journey: a pickup point to City
              Square. A small network lets us show exactly how personal
              preferences and reported barriers change a route.
            </p>
            <div className="atlas-local-detail">
              <MapPin />
              <div>
                <strong>Downtown pickup → City Square</strong>
                <span>Three route alternatives. One connected experience.</span>
              </div>
            </div>
            <button className="atlas-text-action" onClick={start}>
              Explore the Bentonville journey <ArrowUpRight size={19} />
            </button>
            <small>
              Accessibility attributes are modeled, not field-verified. Photo:
              Brandonrush, CC BY-SA 3.0.{" "}
              <a href="/ar/ATTRIBUTION.md" target="_blank" rel="noreferrer">
                Image credits ↗
              </a>
            </small>
          </motion.div>
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
