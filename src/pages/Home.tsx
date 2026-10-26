import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
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
import type { ProfileId } from "../types/journey";

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
    alt: "Bentonville City Square with its brick crossing and surrounding buildings.",
    title: "City Square",
    detail: "Bentonville, Arkansas",
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
export default function Home({
  start,
  profile = "manual",
  onProfile,
}: {
  start: () => void;
  profile?: ProfileId;
  onProfile?: (profile: ProfileId) => void;
}) {
  const reduced = useReducedMotion();
  const [effectsPaused, setEffectsPaused] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const visibleHeadline =
    reduced || typingComplete
      ? heroHeadline
      : heroHeadline.slice(0, typedLength);
  const heroRef = useRef<HTMLElement>(null);
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
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
  useEffect(() => {
    const video = phoneVideoRef.current;
    if (!video) return;
    if (heroVisible && !motionOff) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [heroVisible, motionOff]);
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
  const changePreviewProfile = (next: ProfileId) => {
    onProfile?.(next);
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
                <strong>Starting in Bentonville, Arkansas.</strong>
              </span>
            </div>
          </motion.div>
          <motion.div
            className="atlas-phone-stage"
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
                (0.5 - (event.clientY - bounds.top) / bounds.height) * 7,
              );
              rotateY.set(
                ((event.clientX - bounds.left) / bounds.width - 0.5) * 7,
              );
            }}
            onPointerLeave={() => {
              rotateX.set(0);
              rotateY.set(0);
            }}
            {...reveal}
            transition={{ duration: 0.75, delay: 0.15 }}
          >
            <span className="atlas-phone-kicker">
              <i /> PATHABLE · BENTONVILLE ROUTES
            </span>
            <div className="atlas-phone-halo" aria-hidden="true" />
            <div
              className="atlas-phone-orbit atlas-phone-orbit-one"
              aria-hidden="true"
            />
            <div
              className="atlas-phone-orbit atlas-phone-orbit-two"
              aria-hidden="true"
            />
            <div className="atlas-phone-sparks" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <i key={index} />
              ))}
            </div>
            <video
              ref={phoneVideoRef}
              className="atlas-phone-video"
              src="/animations/pathable-phone.mp4"
              poster="/animations/phone-poster.webp"
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
            <span className="atlas-sr-only">
              Animated 3D PathAble smartphone showing an accessible Bentonville
              route.
            </span>
            <div className="atlas-phone-badge atlas-phone-badge-top">
              <span className="atlas-phone-badge-icon">
                <Accessibility size={17} />
              </span>
              <span>
                <strong>Made around you</strong>
                <small>Mobility first</small>
              </span>
              <i />
            </div>
            <div className="atlas-phone-badge atlas-phone-badge-bottom">
              <Navigation size={18} />
              <span>
                <strong>Accessibility, built in</strong>
                <small>Routes around your needs</small>
              </span>
            </div>
            <div className="atlas-phone-base-label">
              <span>01</span>
              <i />
              <span>YOUR NEXT PATH, MADE PERSONAL</span>
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
                aria-label="Choose mobility profile"
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
                02 / ACCESSIBLE ROUTES IN BENTONVILLE
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
                PathAble brings accessibility-first route planning to
                Bentonville, Arkansas. Route choices account for sidewalk
                access, reported barriers, and individual mobility preferences.
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
                  <strong>Bentonville, Arkansas → Where PathAble Begins</strong>
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
          <div className="atlas-faq-list">
            {[
              [
                "Where can I use PathAble?",
                "PathAble brings accessible route planning to Bentonville, with route options shaped around your mobility preferences.",
              ],
              [
                "How are routes personalized?",
                "PathAble considers stairs, curb ramps, slopes, and uneven surfaces when recommending routes. Your mobility preferences shape which option fits best.",
              ],
              [
                "Is Street View the same as augmented reality?",
                "No. Street View opens Google’s panoramic imagery in another tab. This navigation view does not track your GPS position or align guidance to the live camera.",
              ],
              [
                "What happens when I report a barrier?",
                "The report stays in your browser session. The affected segment is excluded and the route is recalculated from the starting point. Nothing is sent to a city agency.",
              ],
            ].map(([q, a], index) => (
              <motion.article
                className={
                  "atlas-faq-item " + (openFaq === index ? "is-open" : "")
                }
                key={q}
                layout={!reduced}
                transition={{
                  duration: reduced ? 0 : 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <button
                  className="atlas-faq-question"
                  id={`faq-question-${index}`}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {q}
                  <Plus size={18} aria-hidden="true" />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      className="atlas-faq-answer"
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      initial={
                        reduced ? false : { height: 0, opacity: 0, y: -5 }
                      }
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -4 }}
                      transition={{
                        duration: reduced ? 0 : 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <p>{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
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
        <span>Mobility-first navigation · Bentonville, Arkansas</span>
        <a href="#questions">
          Explore PathAble <ArrowUpRight size={15} />
        </a>
      </footer>
    </div>
  );
}
