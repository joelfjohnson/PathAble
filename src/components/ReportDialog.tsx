import { useEffect, useRef, useState } from "react";
import { X, Upload, MapPin, Flag } from "lucide-react";
import type { Obstacle } from "../types/journey";
import { hazard } from "../data/journey";
export default function ReportDialog({
  close,
  submit,
}: {
  close: () => void;
  submit: (o: Obstacle) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [type, setType] = useState("Blocked curb ramp"),
    [description, setDescription] = useState(""),
    [image, setImage] = useState<string>(),
    [error, setError] = useState("");
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const modal = dialog.current;
    modal?.showModal();
    return () => {
      modal?.close();
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="report-dialog"
      aria-labelledby="report-title"
      onCancel={close}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit({ type, description, image, coordinates: hazard });
        }}
      >
        <button
          type="button"
          className="icon-button dialog-close"
          aria-label="Close report"
          onClick={close}
        >
          <X />
        </button>
        <span className="round-icon">
          <Flag />
        </span>
        <h2 id="report-title">Help clear the way.</h2>
        <p>
          Report a barrier to update this route. Your report stays in this
          session.
        </p>
        <label>
          Barrier type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {[
              "Broken sidewalk",
              "Uneven pavement",
              "Blocked curb ramp",
              "Construction",
              "Missing curb ramp",
              "Inaccessible entrance",
              "Other obstacle",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          What should we know?
          <textarea
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the barrier (optional)"
          />
        </label>
        <label className="upload">
          <Upload size={19} />{" "}
          {image ? "Change photo" : "Add a photo (optional)"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  setError("Choose an image under 5 MB.");
                  return;
                }
                if (!file.type.startsWith("image/")) {
                  setError("Choose an image file.");
                  return;
                }
                setError("");
                const reader = new FileReader();
                reader.onload = () => setImage(String(reader.result));
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        {image && (
          <img
            className="upload-preview"
            src={image}
            alt="Selected obstacle report"
          />
        )}
        <div className="info">
          <MapPin size={17} /> Bentonville pickup to City Square
        </div>
        <button className="button full">
          Add report & find alternative <span>↗</span>
        </button>
      </form>
    </dialog>
  );
}
