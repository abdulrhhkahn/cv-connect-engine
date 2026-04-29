import { useEffect, useRef, useState, useCallback } from "react";

// Minimal browser SpeechRecognition typing
type SR = any;

const getRecognition = (): SR | null => {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
};

export const isSpeechRecognitionSupported = () => {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
};

interface Options {
  onResult: (text: string, isFinal: boolean) => void;
  lang?: string;
}

export const useSpeechToText = ({ onResult, lang = "en-US" }: Options) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SR | null>(null);
  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!supported) return;
    const recognition = getRecognition();
    if (!recognition) return;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      if (final) onResult(final, true);
      else if (interim) onResult(interim, false);
    };

    recognition.onerror = (e: any) => {
      setError(e?.error || "speech-error");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      try { recognition.stop(); } catch {}
      recognitionRef.current = null;
    };
  }, [lang, onResult, supported]);

  const start = useCallback(() => {
    setError(null);
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (e: any) {
      setError(e?.message || "Failed to start");
    }
  }, []);

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  return { isListening, error, supported, start, stop, toggle };
};
