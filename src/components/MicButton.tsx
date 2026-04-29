import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { toast } from "sonner";

interface MicButtonProps {
  /** Called once per finalized utterance with just that segment of text. Append it to your field. */
  onTranscript: (finalSegment: string) => void;
  disabled?: boolean;
}

const MicButton = ({ onTranscript, disabled }: MicButtonProps) => {
  const { isListening, supported, start, stop } = useSpeechToText({
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) onTranscript(text.trim());
    },
  });

  const handleClick = () => {
    if (!supported) {
      toast.error("Speech recognition isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListening) stop();
    else start();
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
