import { useEffect, useState } from "react";
import { Route, CheckCircle2 } from "lucide-react";
export default function ARRerouteTransition({
  onReady,
  onPause,
}: {
  onReady: () => void;
  onPause: () => void;
}) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1400),
      setTimeout(onReady, 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onReady]);
  return (
    <div className="ar-reroute-transition" role="status">
      <span className="ar-reroute-orbit">
        {step === 2 ? <CheckCircle2 size={34} /> : <Route size={34} />}
      </span>
      <div className="eyebrow">A NEW WAY FORWARD</div>
      <h2>
        {
          [
            "Updating journey…",
            "Applying route change…",
            "Alternative route ready.",
          ][step]
        }
      </h2>
      <p>
        Your report is saved in this session. Route C uses the predefined
        alternative.
      </p>
      <div className="progress-track">
        <span style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>
      <button autoFocus className="text-link" onClick={onPause}>
        Keep journey paused
      </button>
    </div>
  );
}
