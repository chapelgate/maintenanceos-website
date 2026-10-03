"use client";
import { useEffect, useRef, useState } from "react";

export function VoiceInteractionPreview() {
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const voices = synth.getVoices();
      setVoiceList(voices);
      if (!selectedVoice && voices.length) {
        setSelectedVoice(voices[0].voiceURI);
      }
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, [selectedVoice]);

  const speak = (text: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voiceList.find((v) => v.voiceURI === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
          if (audioRef.current) {
            audioRef.current.src = URL.createObjectURL(blob);
          }
        };
        mediaRecorderRef.current.start();
        setRecording(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  return (
    <section className="voice-preview border-t border-border mt-12 pt-8">
      <h3 className="text-xl font-semibold mb-4">Voice preview</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">
          Choose voice
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border px-3 py-2"
          >
            {voiceList.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Typed input (fallback)
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border px-3 py-2"
            rows={4}
          />
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => speak(inputText)}
            className="px-4 py-2 bg-accent text-white rounded"
          >
            Speak
          </button>
          <button
            onClick={toggleRecording}
            className="px-4 py-2 bg-accent text-white rounded"
          >
            {recording ? "Stop recording" : "Start recording"}
          </button>
        </div>
        <audio ref={audioRef} controls />
      </div>
    </section>
  );
}
