import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Map,
  Flag,
  Volume2,
  VolumeX,
} from "lucide-react";
export default function ARControls({
  playing,
  busy = false,
  first,
  last,
  elapsed,
  duration,
  voiceEnabled,
  voiceSupported,
  mapOpen,
  onPlay,
  onPrevious,
  onNext,
  onRestart,
  onMap,
  onReport,
  onVoice,
  onSeek,
}: {
  playing: boolean;
  busy?: boolean;
  first: boolean;
  last: boolean;
  elapsed: number;
  duration: number;
  voiceEnabled: boolean;
  voiceSupported: boolean;
  mapOpen: boolean;
  onPlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  onMap: () => void;
  onReport: () => void;
  onVoice: () => void;
  onSeek: (time: number) => void;
}) {
  return (
    <fieldset
      className="ar-controls"
      disabled={busy}
      aria-label="Navigation playback controls"
    >
      <div className="ar-scene-scrubber">
        <label htmlFor="ar-seek">Scene progress</label>
        <input
          id="ar-seek"
          type="range"
          min="0"
          max={duration}
          step=".1"
          value={Math.min(duration, elapsed)}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-valuetext={`${Math.round(elapsed)} of ${duration} seconds`}
        />
        <span>
          {Math.floor(elapsed).toString().padStart(2, "0")} /{" "}
          {duration.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="ar-control-row">
        <button
          aria-label="Previous step"
          disabled={first}
          onClick={onPrevious}
        >
          <SkipBack size={19} />
        </button>
        <button
          className="ar-play"
          aria-label={playing ? "Pause journey" : "Resume journey"}
          onClick={onPlay}
        >
          {playing ? <Pause size={21} /> : <Play size={21} />}
        </button>
        <button
          aria-label={last ? "Complete journey" : "Next instruction"}
          onClick={onNext}
        >
          <SkipForward size={19} />
        </button>
        <i />
        <button aria-label="Restart navigation" onClick={onRestart}>
          <RotateCcw size={18} />
        </button>
        <button
          aria-label={mapOpen ? "Return to AR view" : "Open map view"}
          aria-pressed={mapOpen}
          onClick={onMap}
        >
          <Map size={19} />
          <span>{mapOpen ? "AR view" : "Map"}</span>
        </button>
        <button aria-label="Report obstacle" onClick={onReport}>
          <Flag size={18} />
          <span>Report</span>
        </button>
        <button
          className="ar-voice-control"
          aria-label={
            !voiceSupported
              ? "Voice guidance unavailable"
              : voiceEnabled
                ? "Mute voice guidance"
                : "Enable voice guidance"
          }
          aria-pressed={voiceEnabled}
          disabled={!voiceSupported}
          title={
            !voiceSupported
              ? "Speech synthesis is unavailable in this browser"
              : "Optional voice guidance"
          }
          onClick={onVoice}
        >
          {voiceEnabled && voiceSupported ? (
            <Volume2 size={19} />
          ) : (
            <VolumeX size={19} />
          )}
        </button>
      </div>
    </fieldset>
  );
}
