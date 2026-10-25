import { useEffect, useRef, useState } from "react";
export default function InteractiveCursor({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const node = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const fine = matchMedia("(hover:hover) and (pointer:fine)"),
      reduced = matchMedia("(prefers-reduced-motion:reduce)");
    const sync = () => setEnabled(fine.matches && !reduced.matches);
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);
  useEffect(() => {
    if (!enabled || disabled || !node.current) return;
    const el = node.current;
    let x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      frame = 0,
      visible = false;
    const draw = () => {
      cx += (x - cx) * 0.32;
      cy += (y - cy) * 0.32;
      el.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      if (Math.abs(x - cx) + Math.abs(y - cy) > 0.15)
        frame = requestAnimationFrame(draw);
      else frame = 0;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = event.target as Element;
      const editing = !!target.closest(
        "input,textarea,select,[contenteditable=true]",
      );
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        cx = x;
        cy = y;
      }
      visible = !editing;
      el.dataset.visible = String(visible);
      el.dataset.active = String(
        !!target.closest("button:not(:disabled),a,summary"),
      );
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const leave = () => {
      visible = false;
      el.dataset.visible = "false";
    };
    const down = () => {
        el.dataset.pressed = "true";
      },
      up = () => {
        el.dataset.pressed = "false";
      };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, disabled]);
  return enabled && !disabled ? (
    <div ref={node} className="interactive-cursor" aria-hidden="true">
      <i />
    </div>
  ) : null;
}
