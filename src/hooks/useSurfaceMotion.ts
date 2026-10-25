import { useEffect } from "react";
export function useSurfaceMotion(stage: string) {
  useEffect(() => {
    const fine = matchMedia("(hover:hover) and (pointer:fine)"),
      reduced = matchMedia("(prefers-reduced-motion:reduce)");
    let card: HTMLElement | null = null,
      magnetic: HTMLElement | null = null;
    const reset = () => {
      card?.style.setProperty("--tilt-x", "0deg");
      card?.style.setProperty("--tilt-y", "0deg");
      magnetic?.style.setProperty("--mag-x", "0px");
      magnetic?.style.setProperty("--mag-y", "0px");
      card = null;
      magnetic = null;
    };
    const move = (e: PointerEvent) => {
      if (!fine.matches || reduced.matches || e.pointerType === "touch") return;
      const target = e.target as HTMLElement;
      const next = target.closest<HTMLElement>(
        ".profile-card,.route-card,.preview-profile,.story-glass",
      );
      if (card !== next) {
        card?.style.setProperty("--tilt-x", "0deg");
        card?.style.setProperty("--tilt-y", "0deg");
        card = next;
      }
      if (card) {
        const box = card.getBoundingClientRect(),
          x = (e.clientX - box.left) / box.width,
          y = (e.clientY - box.top) / box.height;
        card.style.setProperty("--tilt-x", `${(y - 0.5) * -3}deg`);
        card.style.setProperty("--tilt-y", `${(x - 0.5) * 4}deg`);
        card.style.setProperty("--light-x", `${x * 100}%`);
        card.style.setProperty("--light-y", `${y * 100}%`);
      }
      const button = target.closest<HTMLElement>(".home [data-magnetic]");
      if (magnetic !== button) {
        magnetic?.style.setProperty("--mag-x", "0px");
        magnetic?.style.setProperty("--mag-y", "0px");
        magnetic = button;
      }
      if (button) {
        const r = button.getBoundingClientRect();
        button.style.setProperty(
          "--mag-x",
          `${(e.clientX - r.left - r.width / 2) * 0.055}px`,
        );
        button.style.setProperty(
          "--mag-y",
          `${(e.clientY - r.top - r.height / 2) * 0.1}px`,
        );
      }
    };
    document.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("pointerout", out);
    function out(e: PointerEvent) {
      if (!e.relatedTarget) reset();
    }
    return () => {
      reset();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", out);
      window.removeEventListener("blur", reset);
    };
  }, [stage]);
}
