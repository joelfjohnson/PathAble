import { useEffect } from "react";
export function useARVoice(
  enabled: boolean,
  playing: boolean,
  instruction: string,
) {
  const supported =
    typeof window !== "undefined" &&
    typeof window.speechSynthesis?.speak === "function" &&
    typeof window.speechSynthesis?.cancel === "function" &&
    typeof window.SpeechSynthesisUtterance === "function";
  useEffect(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      return;
    }
    if (enabled && playing) {
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.onerror = () => {
        /* Visual instructions remain available. */
      };
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        /* Browser voice engine unavailable; visual directions continue. */
      }
    }
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* Native speech may be unavailable after page exit. */
      }
    };
  }, [enabled, playing, instruction, supported]);
  return supported;
}
