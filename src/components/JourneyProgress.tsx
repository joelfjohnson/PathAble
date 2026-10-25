import type { NavigationState } from "../types/journey";
const steps = ["Mobility", "Preferences", "Route", "Navigate"];
export default function JourneyProgress({
  stage,
}: {
  stage: NavigationState["stage"];
}) {
  const index =
    stage === "profile"
      ? 0
      : stage === "preferences"
        ? 1
        : ["dashboard", "processing", "routes"].includes(stage)
          ? 2
          : stage === "arrived"
            ? 4
            : 3;
  return (
    <ol className="journey-progress" aria-label="Journey progress">
      {steps.map((label, i) => (
        <li
          key={label}
          className={i < index ? "complete" : i === index ? "current" : ""}
          aria-current={i === index ? "step" : undefined}
        >
          <span className="progress-number" aria-hidden="true">
            {i < index ? "✓" : String(i + 1).padStart(2, "0")}
          </span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}
