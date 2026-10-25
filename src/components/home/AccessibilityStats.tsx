import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";

const statistics = [
  {
    value: 1.3,
    suffix: "B",
    label: "people worldwide experience significant disability",
    source: "WHO · 2023",
    url: "https://www.who.int/news-room/fact-sheets/detail/disability-and-health",
  },
  {
    value: 18.2,
    suffix: "%",
    label: "of U.S. adults report any difficulty walking or climbing steps",
    source: "CDC · 2024 data",
    url: "https://www.cdc.gov/nchs/fastats/disability.htm",
  },
] as const;

function Statistic({
  stat,
  paused,
}: {
  stat: (typeof statistics)[number];
  paused: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const display = useTransform(count, (value) => value.toFixed(1));
  useEffect(() => {
    if (paused) {
      count.set(stat.value);
      return;
    }
    if (!visible) return;
    const animation = animate(count, stat.value, {
      duration: 1.7,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => animation.stop();
  }, [count, paused, stat.value, visible]);
  return (
    <div className="cinema-stat" ref={ref}>
      <span
        className="cinema-stat-number"
        aria-label={`${stat.value} ${stat.suffix === "B" ? "billion" : "percent"}`}
      >
        <span aria-hidden="true">
          <motion.span>{display}</motion.span>
          <em>{stat.suffix}</em>
        </span>
      </span>
      <p>{stat.label}</p>
      <a href={stat.url} target="_blank" rel="noreferrer">
        {stat.source}
        <ArrowUpRight size={13} />
      </a>
    </div>
  );
}

export default function AccessibilityStats({ paused }: { paused: boolean }) {
  return (
    <section className="cinema-impact" aria-labelledby="impact-title">
      <div className="cinema-impact-intro">
        <span className="atlas-kicker">WHY EVERY PATH MATTERS</span>
        <h2 id="impact-title">
          Access changes
          <br />
          <em>what’s possible.</em>
        </h2>
      </div>
      {statistics.map((stat) => (
        <Statistic key={stat.source} stat={stat} paused={paused} />
      ))}
    </section>
  );
}
