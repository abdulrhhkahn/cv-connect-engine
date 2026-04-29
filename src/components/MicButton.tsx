import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { toast } from "sonner";
import { useRef } from "react";

interface MicButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

/**
 * Mic button that uses the browser Web Speech API to dictate into a text field.
 * Calls onTranscript with the latest combined text (replaces interim, appends final).
 */
const MicButton = ({ onTranscript, disabled }: MicButtonProps) => {
  const baseRef = useRef<string>("");

  const { isListening, supported, toggle, start } = useSpeechToText({
    onResult: (text, isFinal) => {
      const sep = baseRef.current && !baseRef.current.endsWith(" ") ? " " : "";
      const combined = baseRef.current + sep + text;
      onTranscript(combined.trim());
      if (isFinal) {
        baseRef.current = combined.trim();
      }
    },
  });

  const handleClick = () => {
    if (!supported) {
      toast.error("Speech recognition isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (!isListening) {
      // Snapshot whatever is currently in the field as the base
      // (parent should pass current value via onTranscript baseline if needed)
      baseRef.current = "";
      start();
    } else {
      toggle();
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? "default" : "outline"}
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      aria-label={isListening ? "Stop dictation" : "Start dictation"}
      title={supported ? (isListening ? "Stop dictation" : "Dictate") : "Speech recognition not supported"}
      className={isListening ? "animate-pulse" : ""}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default MicButton;
