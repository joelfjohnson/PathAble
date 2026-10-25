import { Route } from "lucide-react";
export default function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="PathAble home">
      <span className="brand-icon">
        <Route size={22} />
      </span>
      PathAble<span className="brand-dot">.</span>
    </button>
  );
}
