import { useEffect, useRef } from "react";
export default function NavigationEnvironment() {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = node.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.dataset.paused = String(!entry.isIntersecting);
        const hero = el.closest<HTMLElement>(".hero");
        if (hero) hero.dataset.offscreen = String(!entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={node} className="navigation-environment" aria-hidden="true">
      <div className="ambient-light light-a" />
      <div className="ambient-light light-b" />
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="environment-path">
            <stop stopColor="#cab9f1" stopOpacity="0" />
            <stop offset=".5" stopColor="#a37bdd" stopOpacity=".5" />
            <stop offset="1" stopColor="#cab9f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#environment-path)" strokeWidth="1">
          <path d="M-100 660H700Q770 660 770 590V280Q770 230 820 230H1500" />
          <path d="M500 1000V700Q500 630 570 630H1130Q1180 630 1180 580V-100" />
          <path d="M-50 480H900Q960 480 960 420V380Q960 330 1010 330H1550" />
        </g>
        {[
          [770, 340],
          [1180, 570],
          [960, 400],
          [1030, 230],
          [680, 630],
        ].map(([x, y], i) => (
          <g
            key={i}
            className={`environment-pin pin-${i}`}
            transform={`translate(${x} ${y})`}
          >
            <circle r="18" fill="#fff" fillOpacity=".65" stroke="#d8c9ee" />
            <circle r="4" fill="#a276dd" />
            <circle r="28" fill="none" stroke="#d8c9ee" strokeOpacity=".4" />
          </g>
        ))}
      </svg>
      <i className="route-particle particle-a" />
      <i className="route-particle particle-b" />
      <span className="floating-shape shape-ring" />
      <span className="floating-shape shape-diamond" />
    </div>
  );
}
