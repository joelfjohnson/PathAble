import { useState } from "react";
import {
  Accessibility,
  PersonStanding,
  Zap,
  Check,
  ArrowUpRight,
  Flag,
  CornerUpRight,
  MapPin,
  Route as RouteIcon,
} from "lucide-react";
import type { ProfileId } from "../../types/journey";
export function ProblemStory() {
  return (
    <section className="barrier-story section reveal">
      <div className="story-kicker">
        <span>01</span> THE SHORTEST WAY ISN'T ALWAYS THE RIGHT WAY
      </div>
      <div className="barrier-editorial">
        <h2>
          A few meters.
          <br />
          <span>A big difference.</span>
        </h2>
        <p>
          A steep incline. A missing curb ramp.
          <br />
          Small details can change an entire journey.
        </p>
      </div>
      <div
        className="barrier-diagram"
        role="img"
        aria-label="Illustrative shorter route encounters a barrier; an accessibility-focused route goes around"
      >
        <svg viewBox="0 0 1200 230">
          <path className="problem-direct" d="M40 150H1160" />
          <path
            className="problem-detour"
            d="M40 150H390Q420 150 420 120V70Q420 35 455 35H700Q735 35 735 70V120Q735 150 770 150H1160"
          />
          <circle cx="40" cy="150" r="8" fill="#8b5cf6" />
          <circle
            cx="1160"
            cy="150"
            r="8"
            fill="#fff"
            stroke="#8b5cf6"
            strokeWidth="4"
          />
        </svg>
        <div className="barrier-token">
          <Flag size={19} />
          <span>EXAMPLE BARRIER</span>
          <strong>
            A different route.
            <br />
            The same independence.
          </strong>
        </div>
        <span className="diagram-start">YOUR START</span>
        <span className="diagram-end">YOUR POSSIBILITIES</span>
      </div>
    </section>
  );
}
export function PersonalStory({
  profile,
  onProfile,
}: {
  profile: ProfileId;
  onProfile: (id: ProfileId) => void;
}) {
  const cards = [
    {
      id: "manual" as const,
      icon: Accessibility,
      title: "Manual wheelchair",
      detail: "Step-free paths. Gentler inclines.",
    },
    {
      id: "walker" as const,
      icon: PersonStanding,
      title: "Walker or cane",
      detail: "Steadier surfaces. Room to pause.",
    },
    {
      id: "powered" as const,
      icon: Zap,
      title: "Powered wheelchair",
      detail: "Your preferences, in focus.",
    },
  ];
  return (
    <section className="personal-story section reveal">
      <div className="personal-heading">
        <div className="story-kicker">
          <span>02</span> THE ROUTE BEGINS WITH YOU
        </div>
        <h2>
          Different ways to move.
          <br />
          <span>One world to explore.</span>
        </h2>
        <p>
          Choose what fits you. We'll carry your selection into your journey.
        </p>
      </div>
      <div className="personal-preview">
        {cards.map((c, i) => (
          <button
            className={
              "preview-profile " + (profile === c.id ? "selected" : "")
            }
            aria-pressed={profile === c.id}
            key={c.id}
            onClick={() => onProfile(c.id)}
            style={{ "--card-order": i } as React.CSSProperties}
          >
            <span className="preview-profile-top">
              <c.icon size={27} />
              <span className="radio-dot">
                {profile === c.id && <Check size={11} />}
              </span>
            </span>
            <strong>{c.title}</strong>
            <span>{c.detail}</span>
            <div>
              {profile === c.id
                ? "SELECTED FOR YOUR JOURNEY"
                : "CHOOSE THIS PROFILE"}
              <ArrowUpRight size={16} />
            </div>
          </button>
        ))}
      </div>
      <div className="personal-caption">
        <span className="live-dot" /> Your mobility. Your comfort. Your pace.
      </div>
    </section>
  );
}
export function VisualStory({ start }: { start: () => void }) {
  const [active, setActive] = useState(0);
  const labels = [
    "See the pathway",
    "Find the connection",
    "Know the next turn",
  ];
  return (
    <section className="visual-story" id="visual-navigation">
      <div className="visual-story-inner">
        <div className="visual-story-copy reveal">
          <div className="story-kicker">
            <span>04</span> A CLEARER PERSPECTIVE
          </div>
          <h2>
            Your next turn.
            <br />
            <span>Clearly ahead.</span>
          </h2>
          <p>
            A purple pathway. The detail that matters.
            <br />A more intuitive way to find your way.
          </p>
          <div
            className="visual-story-tabs"
            role="group"
            aria-label="Explore visual guidance"
          >
            {labels.map((label, i) => (
              <button
                key={label}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                <span>0{i + 1}</span>
                {label}
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
          <button className="button" data-magnetic onClick={start}>
            Try visual navigation <ArrowUpRight size={18} />
          </button>
          <small>Scripted visual walkthrough · No live location tracking</small>
        </div>
        <div className="visual-story-stage reveal" data-preview-step={active}>
          <div className="visual-preview-halo" />
          <div className="visual-preview-frame">
            <img
              src={`/ar/scenes/${active === 0 ? "transit" : active === 1 ? "crossing" : "avenue"}.svg`}
              alt="Original illustrative navigation viewpoint"
            />
            <svg
              className="visual-preview-path"
              viewBox="0 0 800 900"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d={
                  active === 2
                    ? "M370 910C370 740 400 670 470 600S540 520 530 450"
                    : "M400 910C400 760 420 620 420 480"
                }
                stroke="#a78bfa"
                strokeWidth="48"
                strokeOpacity=".4"
                fill="none"
              />
              <path
                d={
                  active === 2
                    ? "M370 910C370 740 400 670 470 600S540 520 530 450"
                    : "M400 910C400 760 420 620 420 480"
                }
                stroke="#dccbff"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="m370 720 30-22 30 22m-60-85 30-20 30 20m-55-78 25-18 25 18"
                fill="none"
                stroke="white"
                strokeWidth="7"
              />
            </svg>
            <div className="visual-preview-hud">
              <CornerUpRight size={26} />
              <div>
                <span>ROUTE B · YOUR WAY FORWARD</span>
                <strong>{labels[active]}</strong>
              </div>
            </div>
            <div className="visual-preview-label">
              <Accessibility size={17} />{" "}
              {active === 1
                ? "Sample curb-ramp connection"
                : "Preferences at every turn"}
              <span>ILLUSTRATIVE VIEW</span>
            </div>
            <div className="visual-preview-footer">
              <span>
                <i />
                VISUAL NAVIGATION
              </span>
              <MapPin size={16} />
            </div>
          </div>
          <div className="visual-float-card story-glass">
            <RouteIcon size={23} />
            <span>
              Clearer cues.<strong>More confidence.</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
export function CommunityDemo() {
  const [rerouted, setRerouted] = useState(false);
  return (
    <div className={"community-route-demo " + (rerouted ? "rerouted" : "")}>
      <svg viewBox="0 0 450 330" aria-hidden="true">
        <path d="M50 260H170V80H390" className="community-original" />
        <path d="M50 260H95V40H390V80" className="community-alternative" />
        <circle cx="50" cy="260" r="9" fill="#8b5cf6" />
        <circle
          cx="390"
          cy="80"
          r="9"
          fill="white"
          stroke="#8b5cf6"
          strokeWidth="4"
        />
      </svg>
      <span className="community-hazard">
        <Flag size={20} />
      </span>
      <div className="community-demo-card">
        <span className="pill">ILLUSTRATIVE ROUTE UPDATE</span>
        <strong>{rerouted ? "A new way forward." : "Plans can change."}</strong>
        <p>
          {rerouted
            ? "The alternative avoids the sample barrier."
            : "A reported barrier changes the journey."}
        </p>
        <button className="text-link" onClick={() => setRerouted(!rerouted)}>
          {rerouted ? "Replay original route" : "Preview alternative route"}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
