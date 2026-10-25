import { motion, type MotionValue } from "motion/react";

export default function HeroScenery({
  y,
  x,
  paused,
}: {
  y: MotionValue<number>;
  x: MotionValue<number>;
  paused: boolean;
}) {
  return (
    <div className="cinema-environment" aria-hidden="true">
      <motion.div
        className="cinema-scenery-parallax"
        style={{ y: paused ? 0 : y, x: paused ? 0 : x }}
      >
        <div className="cinema-scenery-pan">
          <img
            src="/ar/bentonville/pilot-trail.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <svg
          className="cinema-ground-path"
          viewBox="0 0 1400 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="hero-path-light" x1="0" y1="1" x2="1" y2="0">
              <stop stopColor="#6438e8" stopOpacity=".1" />
              <stop offset=".5" stopColor="#9d70ff" stopOpacity=".85" />
              <stop offset="1" stopColor="#ede4ff" />
            </linearGradient>
            <filter id="hero-route-glow">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          <path
            className="cinema-path-glow"
            d="M980 1020C950 850 640 790 720 650S865 505 745 445S680 365 710 310"
          />
          <path
            className="cinema-path-ribbon"
            d="M980 1020C950 850 640 790 720 650S865 505 745 445S680 365 710 310"
          />
          <path
            className="cinema-path-flow"
            d="M980 1020C950 850 640 790 720 650S865 505 745 445S680 365 710 310"
          />
          <g className="cinema-path-chevron">
            <path d="m714 651 17-26 23 17m-45 30 17-26 23 17" />
          </g>
          <circle className="cinema-path-beacon" cx="710" cy="310" r="17" />
          <circle cx="710" cy="310" r="5" fill="#f2eaff" />
        </svg>
      </motion.div>
      <div className="cinema-scene-wash" />
      <div className="cinema-aurora cinema-aurora-one" />
      <div className="cinema-aurora cinema-aurora-two" />
      <div className="cinema-orbit cinema-orbit-one" />
      <div className="cinema-orbit cinema-orbit-two" />
      <div className="cinema-scene-grain" />
    </div>
  );
}
