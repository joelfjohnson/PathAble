import { flushSync } from "react-dom";
let active: ViewTransition | undefined;
/** Snapshot transitions are progressive enhancement; state changes are never dependent on animation support. */
export function transitionJourney(update: () => void) {
  if (
    typeof document.startViewTransition !== "function" ||
    matchMedia("(prefers-reduced-motion:reduce)").matches
  ) {
    update();
    return;
  }
  active?.skipTransition();
  let committed = false;
  const commit = () => {
    if (committed) return;
    committed = true;
    flushSync(update);
  };
  try {
    const transition = document.startViewTransition(commit);
    active = transition;
    void transition.ready.catch(() => {});
    void transition.updateCallbackDone.catch(() => {
      if (!committed) commit();
    });
    void transition.finished
      .finally(() => {
        if (active === transition) active = undefined;
      })
      .catch(() => {});
  } catch {
    commit();
  }
}
