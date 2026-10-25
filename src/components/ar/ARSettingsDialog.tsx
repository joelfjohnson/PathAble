import { useEffect, useRef } from "react";
import { X, Settings2, Accessibility, Image } from "lucide-react";
import { groups, profiles } from "../../data/journey";
import type { NavigationState } from "../../types/journey";
import type { ARScene } from "../../types/ar";
export default function ARSettingsDialog({
  state,
  scene,
  voiceSupported,
  showMiniMap,
  onVoice,
  onMiniMap,
  onClose,
}: {
  state: NavigationState;
  scene: ARScene;
  voiceSupported: boolean;
  showMiniMap: boolean;
  onVoice: (enabled: boolean) => void;
  onMiniMap: (enabled: boolean) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null,
      dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  const profile = profiles.find((p) => p.id === state.profile)!;
  return (
    <dialog
      ref={ref}
      className="ar-settings report-dialog"
      aria-labelledby="ar-settings-title"
      onCancel={onClose}
    >
      <button
        className="icon-button dialog-close"
        aria-label="Close navigation settings"
        onClick={onClose}
      >
        <X />
      </button>
      <span className="round-icon">
        <Settings2 size={22} />
      </span>
      <h2 id="ar-settings-title">Make the view yours.</h2>
      <div className="ar-settings-profile">
        <Accessibility size={20} />
        <strong>{profile.name}</strong>
      </div>
      <div className="preference-tags">
        {groups
          .flatMap((g) => g.items)
          .filter((p) => state.preferences.includes(p.id))
          .map((p) => (
            <span key={p.id}>{p.label}</span>
          ))}
      </div>
      <label className="switch-row">
        <span>
          Voice guidance
          {!voiceSupported && <small>Unavailable in this browser</small>}
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={state.ar.voiceEnabled}
          disabled={!voiceSupported}
          onChange={(e) => onVoice(e.target.checked)}
        />
        <span className="switch" />
      </label>
      <label className="switch-row">
        <span>Show mini-map</span>
        <input
          type="checkbox"
          role="switch"
          checked={showMiniMap}
          onChange={(e) => onMiniMap(e.target.checked)}
        />
        <span className="switch" />
      </label>
      <div className="ar-media-credit">
        <Image size={20} />
        <div>
          <h3>About this view</h3>
          <p>
            Scripted visual navigation. No GPS, camera access, or live AR
            tracking. Accessibility conditions and approximate distances are
            illustrative.
          </p>
          {!scene.media.isReference && (
            <p>
              Original, location-neutral illustrations represent different
              stages of the demonstration. These views are not photographs of
              Bentonville.
            </p>
          )}
          {scene.media.credit && (
            <>
              <a
                href={scene.media.credit.source}
                target="_blank"
                rel="noreferrer"
              >
                Bentonville photograph · {scene.media.credit.author}
              </a>
              <a
                href={scene.media.credit.licenseUrl}
                target="_blank"
                rel="noreferrer"
              >
                {scene.media.credit.license} · adapted reference
              </a>
              <small>
                {scene.media.credit.changes} These historical views show
                landmarks around the square, not a continuous first-person
                recording of Route B or C. Camera movement is simulated.
              </small>
            </>
          )}
          <a href="/ar/ATTRIBUTION.md" target="_blank" rel="noreferrer">
            Full media credits
          </a>
        </div>
      </div>
      <button className="button full" onClick={onClose}>
        Return to journey
      </button>
    </dialog>
  );
}
