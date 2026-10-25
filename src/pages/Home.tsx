import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Accessibility,
  SlidersHorizontal,
  Route,
  MoveUpRight,
  ShieldCheck,
  MapPin,
  Check,
  Heart,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Brand from "../components/Brand";
import NavigationEnvironment from "../components/home/NavigationEnvironment";
import PhonePortal from "../components/home/PhonePortal";
import {
  ProblemStory,
  PersonalStory,
  VisualStory,
  CommunityDemo,
} from "../components/home/ScrollStories";
import type { ProfileId } from "../types/journey";
let introHasPlayed = false;
gsap.registerPlugin(ScrollTrigger);
export default function Home({
  start,
  profile = "manual",
  onProfile,
}: {
  start: () => void;
  profile?: ProfileId;
  onProfile?: (id: ProfileId) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLVideoElement>(null);
  const [portal, setPortal] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const enter = () => {
    if (portal) return;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
      start();
      return;
    }
    const bounds = root.current
      ?.querySelector(".phone-render")
      ?.getBoundingClientRect();
    const visible = bounds && bounds.top < innerHeight && bounds.bottom > 0;
    setPortal(
      visible
        ? {
            left: bounds.left + bounds.width * 0.35,
            top: bounds.top + bounds.height * 0.2,
            width: bounds.width * 0.34,
            height: bounds.height * 0.59,
          }
        : {
            left: innerWidth * 0.5 - 100,
            top: innerHeight * 0.5 - 200,
            width: 200,
            height: 400,
          },
    );
  };
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const video = phone.current;
    if (!video) return;
    let inView = true,
      active = true;
    const sync = () => {
      if (!active) return;
      if (inView && playing && !document.hidden)
        void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [playing, reduced]);
  useEffect(() => {
    if (reduced) return;
    let introFrame = 0;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        }),
      );
      gsap.from(".mini-route", {
        strokeDasharray: 1000,
        strokeDashoffset: 1000,
        ease: "none",
        scrollTrigger: {
          trigger: ".feature-visual",
          start: "top 85%",
          end: "center center",
          scrub: 1,
        },
      });
      gsap.from(".problem-detour", {
        strokeDasharray: 1800,
        strokeDashoffset: 1800,
        ease: "none",
        scrollTrigger: {
          trigger: ".barrier-diagram",
          start: "top 85%",
          end: "center center",
          scrub: 0.6,
        },
      });
      gsap.to(".phone-scroll", {
        rotationY: 16,
        rotationZ: -5,
        scale: 1.1,
        y: 80,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });
      gsap.fromTo(
        ".visual-preview-frame",
        { rotationY: -7, rotationZ: 3, y: 25 },
        {
          rotationY: 5,
          rotationZ: -2,
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: ".visual-story",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9,
          },
        },
      );
      introFrame = requestAnimationFrame(() => {
        if (introHasPlayed) return;
        introHasPlayed = true;
        ctx.add(() => {
          gsap
            .timeline({ defaults: { ease: "power4.out" } })
            .from(
              ".headline-word",
              {
                yPercent: 112,
                rotateX: 18,
                opacity: 0,
                duration: 1.1,
                stagger: 0.13,
              },
              0,
            )
            .from(
              ".hero-copy>.eyebrow",
              { opacity: 0, y: 12, duration: 0.65 },
              0.1,
            )
            .from(
              ".hero-copy>p,.hero-actions,.hero-caption",
              { opacity: 0, y: 18, duration: 0.8, stagger: 0.12 },
              0.4,
            )
            .from(
              ".phone-intro",
              { opacity: 0, y: 65, rotateZ: 8, scale: 0.86, duration: 1.35 },
              0.16,
            )
            .from(
              ".floating-badge",
              { opacity: 0, y: 22, duration: 0.8, stagger: 0.15 },
              0.85,
            );
        });
      });
    }, root);
    return () => {
      cancelAnimationFrame(introFrame);
      ctx.revert();
    };
  }, [reduced]);
  return (
    <div
      ref={root}
      className={"home premium-home " + (portal ? "is-entering" : "")}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <Brand
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <nav aria-label="Main navigation">
          <a href="#how">How it works</a>
          <a href="#features">Our approach</a>
          <a href="#community">Community</a>
        </nav>
        <button className="button small" onClick={enter} data-magnetic>
          Open PathAble <ArrowUpRight size={16} />
        </button>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="hero">
          <NavigationEnvironment />
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> A BETTER WAY FORWARD
            </div>
            <h1 aria-label="Navigation without barriers.">
              {["Navigation", "without", "barriers."].map((word, i) => (
                <span className="headline-line" aria-hidden="true" key={word}>
                  <span className="headline-word">
                    {word}
                    {i === 2 && <i className="intro-cursor" />}
                  </span>
                </span>
              ))}
            </h1>
            <p>
              Discover routes designed around your mobility needs. Navigate with
              greater confidence, clarity, and independence.
            </p>
            <div className="hero-actions">
              <button className="button" onClick={enter} data-magnetic>
                Start navigating <ArrowUpRight size={19} />
              </button>
              <a className="text-link" href="#features">
                Explore features <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-caption">
              <div className="people">
                <span>♡</span>
                <span>↗</span>
                <span>✳</span>
              </div>
              <span>
                Different journeys.
                <br />
                <strong>The same freedom to explore.</strong>
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            onPointerMove={(event) => {
              if (
                reduced ||
                event.pointerType === "touch" ||
                !matchMedia("(hover:hover) and (pointer:fine)").matches
              )
                return;
              const r = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty(
                "--phone-x",
                `${((event.clientY - r.top) / r.height - 0.5) * -8}deg`,
              );
              event.currentTarget.style.setProperty(
                "--phone-y",
                `${((event.clientX - r.left) / r.width - 0.5) * 12}deg`,
              );
            }}
            onPointerLeave={(event) => {
              event.currentTarget.style.setProperty("--phone-x", "0deg");
              event.currentTarget.style.setProperty("--phone-y", "0deg");
            }}
          >
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-grid" />
            <span className="art-coordinate">DESIGNED FOR YOUR EVERYDAY</span>
            <div className="phone-intro">
              <div className="phone-scroll">
                <div className="phone-tilt">
                  {reduced ? (
                    <img
                      className="phone-static"
                      src="/animations/phone-poster.webp"
                      alt="PathAble navigation interface on a titanium smartphone"
                    />
                  ) : (
                    <>
                      <video
                        ref={phone}
                        className="phone-render"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/animations/phone-poster.webp"
                        aria-label="PathAble navigation on a rotating smartphone"
                      >
                        <source
                          src="/animations/pathable-phone.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!reduced && (
              <button
                className="motion-toggle"
                onClick={() => {
                  if (playing) {
                    phone.current?.pause();
                  } else {
                    void phone.current?.play();
                  }
                  setPlaying(!playing);
                }}
                aria-label={
                  playing ? "Pause phone animation" : "Play phone animation"
                }
              >
                {playing ? "Ⅱ Pause motion" : "▷ Play motion"}
              </button>
            )}
            <div className="hero-phone-shadow" />
            <div className="floating-badge badge-top">
              <span className="round-icon">
                <ShieldCheck size={20} />
              </span>
              <div>
                A route that fits you<span>Thoughtfully personalized</span>
              </div>
              <Check size={15} />
            </div>
            <div className="floating-badge badge-bottom">
              <span className="round-icon teal">
                <Route size={21} />
              </span>
              <div>
                More possibility.<span>Fewer barriers.</span>
              </div>
            </div>
            <span className="art-index">01 / A NEW PERSPECTIVE</span>
          </div>
        </section>
        <div className="values-strip">
          <span>
            BUILT AROUND PEOPLE. <strong>NOT JUST PLACES.</strong>
          </span>
          <div>
            <Accessibility /> Mobility-first design
          </div>
          <div>
            <Route /> Thoughtful routes
          </div>
          <div>
            <Heart /> Greater independence
          </div>
        </div>
        <ProblemStory />
        <PersonalStory profile={profile} onProfile={(id) => onProfile?.(id)} />
        <section id="how" className="how-section section reveal">
          <div className="section-top">
            <div>
              <div className="eyebrow">YOUR WORLD. MORE ACCESSIBLE.</div>
              <h2>
                A small detour.
                <br />A world of difference.
              </h2>
            </div>
            <p>
              The shortest route isn't always the right one.
              <br />
              PathAble puts your needs at the center of every journey.
            </p>
          </div>
          <div className="steps-grid">
            {[
              {
                icon: Accessibility,
                n: "01",
                title: "Start with you.",
                text: "Choose a mobility profile that reflects how you move.",
              },
              {
                icon: SlidersHorizontal,
                n: "02",
                title: "Make it personal.",
                text: "Tell us what matters, from gentler slopes to smoother paths.",
              },
              {
                icon: MoveUpRight,
                n: "03",
                title: "Find your way.",
                text: "Compare the featured routes and choose what fits you.",
              },
            ].map((s) => (
              <article key={s.n}>
                <div className="step-top">
                  <s.icon size={25} />
                  <span>{s.n}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="features" className="feature-section section">
          <div className="feature-visual reveal">
            <div className="mini-map">
              <span className="street st1">SW A STREET</span>
              <span className="street st2">WEST CENTRAL AVENUE</span>
              <div className="park">
                CITY
                <br />
                SQUARE
              </div>
              <svg viewBox="0 0 500 380" aria-hidden="true">
                <path className="mini-other" d="M95 310V160H350V90" />
                <path className="mini-route" d="M95 310H180V90H350" />
                <circle cx="95" cy="310" r="10" fill="#7c3aed" />
                <circle
                  cx="350"
                  cy="90"
                  r="10"
                  fill="#fff"
                  stroke="#7c3aed"
                  strokeWidth="5"
                />
              </svg>
              <div className="map-card">
                <span className="pill">A LITTLE FARTHER. A BETTER FIT.</span>
                <strong>Accessibility-focused route</strong>
                <div>
                  410 m <span>·</span> 7 min estimate <ShieldCheck size={17} />
                </div>
              </div>
            </div>
          </div>
          <div className="feature-copy reveal">
            <div className="eyebrow">CONFIDENCE AT EVERY TURN</div>
            <h2>
              More than
              <br />
              getting there.
            </h2>
            <p>
              See the details that make a difference. Compare sample slopes,
              curb ramps, and pathway conditions in one clear view.
            </p>
            <ul>
              <li>
                <Check /> Routes shaped by your preferences
              </li>
              <li>
                <Check /> Clear, understandable route comparisons
              </li>
              <li>
                <Check /> An alternative when plans change
              </li>
            </ul>
            <button className="text-link" onClick={enter} data-magnetic>
              Explore the Bentonville journey <ArrowUpRight size={19} />
            </button>
            <small>
              Featured scenario · Illustrative accessibility conditions
            </small>
          </div>
        </section>
        <VisualStory start={enter} />
        <section id="community" className="community section reveal">
          <div>
            <div className="eyebrow">BETTER, TOGETHER</div>
            <h2>
              One shared detail.
              <br />A more open world.
            </h2>
            <p>
              A blocked curb ramp can change a journey. Try reporting an example
              barrier and see how PathAble prepares an alternative.
            </p>
            <button className="button white" onClick={enter} data-magnetic>
              Try the featured journey <ArrowUpRight size={18} />
            </button>
          </div>
          <CommunityDemo />
        </section>
        <section className="cta section reveal">
          <div className="eyebrow">THE WAY FORWARD IS YOURS</div>
          <h2>
            Your journey.
            <br />
            <span>Your way.</span>
          </h2>
          <button className="button" onClick={enter} data-magnetic>
            Start your journey <ChevronRight size={19} />
          </button>
          <p>
            <MapPin size={14} /> Discover our featured Bentonville, Arkansas
            journey.
          </p>
        </section>
      </main>
      <footer>
        <Brand
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <p>Navigation without barriers.</p>
        <span>2026 Congressional App Challenge · Arkansas District 3</span>
      </footer>
      {portal && <PhonePortal rect={portal} done={start} />}
    </div>
  );
}
