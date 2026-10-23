import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, MicOff, Square, Play, Pause, RotateCcw, 
  Upload, Sparkles, Copy, Check, FileAudio, AlertCircle, Loader2 
} from "lucide-react";
import { showToast } from "../lib/notifications";

interface AudioTranscriberProps {
  onTranscribeComplete?: (text: string) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  compact?: boolean;
}

export default function AudioTranscriber({
  onTranscribeComplete,
  title = "Transcrição de Áudio com IA",
  description = "Grave com o microfone ou carregue um ficheiro áudio para transcrever automaticamente usando o modelo gemini-3.5-transcribe.",
  placeholder = "O texto transcrito aparecerá aqui...",
  compact = false,
}: AudioTranscriberProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string>("audio/webm");
  const [transcribedText, setTranscribedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setMicError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];
    setRecordDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("O seu navegador não suporta gravação de áudio pelo microfone.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mime type
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
        "audio/wav",
      ];
      let selectedMime = "audio/webm";
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }
      setAudioMime(selectedMime);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: selectedMime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks to release hardware microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // slices every 250ms
      setIsRecording(true);
      setIsPaused(false);

      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      const msg = err.name === "NotAllowedError"
        ? "Permissão de microfone recusada. Permita o acesso ao microfone nas definições do navegador."
        : err.message || "Não foi possível aceder ao microfone.";
      setMicError(msg);
      showToast(msg, "error");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];
    setRecordDuration(0);
    setTranscribedText("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast("O ficheiro é demasiado grande (máximo 25MB).", "warning");
      return;
    }

    setAudioBlob(file);
    setAudioMime(file.type || "audio/mp3");
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setRecordDuration(0);
    showToast(`Ficheiro carregado: ${file.name}`, "success");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      showToast("Por favor, grave áudio ou carregue um ficheiro primeiro.", "warning");
      return;
    }

    setIsLoading(true);
    setTranscribedText("");

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      const response = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioMime,
          prompt: customPrompt.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao processar a transcrição.");
      }

      const text = data.text || "";
      setTranscribedText(text);
      showToast("Áudio transcrito com sucesso via gemini-3.5-transcribe!", "success");

      if (onTranscribeComplete && text) {
        onTranscribeComplete(text);
      }
    } catch (err: any) {
      console.error("Transcription error:", err);
      showToast(err.message || "Erro ao transcrever áudio.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!transcribedText) return;
    navigator.clipboard.writeText(transcribedText);
    setHasCopied(true);
    showToast("Texto copiado para a área de transferência!", "success");
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition ${compact ? "p-4 space-y-3" : "p-6 space-y-5"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-100 text-[#C8102E]">
              <Mic className="w-4 h-4" />
            </span>
            <h3 className="font-display font-black text-slate-900 text-sm tracking-tight">
              {title}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              gemini-3.5-transcribe
            </span>
          </div>
          {!compact && <p className="text-xs text-slate-500">{description}</p>}
        </div>

        {audioBlob && (
          <button
            type="button"
            onClick={resetRecording}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-mono transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpar
          </button>
        )}
      </div>

      {micError && (
        <div className="p-3 bg-red-50 rounded-xl text-red-700 text-xs flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{micError}</span>
        </div>
      )}

      {/* Recording & Input Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2.5 bg-[#C8102E] hover:bg-[#A50D24] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm shadow-red-500/20"
            >
              <Mic className="w-4 h-4" />
              <span>Gravar com Microfone</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Square className="w-4 h-4 text-red-400 fill-red-400" />
                <span>Parar Gravação ({formatDuration(recordDuration)})</span>
              </button>

              {!isPaused ? (
                <button
                  type="button"
                  onClick={pauseRecording}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  title="Pausar"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeRecording}
                  className="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition cursor-pointer"
                  title="Retomar"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Carregar Áudio</span>
          </button>
        </div>

        {/* Live Recording Sound Wave Visualizer */}
        {isRecording && (
          <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-mono font-bold text-red-700">
                {isPaused ? "Gravação em Pausa" : "A Gravar Áudio do Microfone..."}
              </span>
            </div>

            {/* Sound Wave Bars */}
            <div className="flex items-center gap-1">
              {[40, 70, 30, 90, 60, 100, 45, 80, 50, 65, 85, 35].map((height, i) => (
                <span
                  key={i}
                  className={`w-1 bg-[#C8102E] rounded-full transition-all duration-150 ${
                    isPaused ? "h-2 opacity-40" : "animate-pulse"
                  }`}
                  style={{
                    height: isPaused ? "8px" : `${Math.max(8, (height * (i % 2 === 0 ? 1 : 0.7)) / 3.5)}px`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ))}
            </div>

            <span className="font-mono font-bold text-xs text-red-800">
              {formatDuration(recordDuration)}
            </span>
          </div>
        )}

        {/* Audio Player Preview */}
        {audioUrl && !isRecording && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-700 flex items-center gap-1.5">
                <FileAudio className="w-4 h-4 text-[#C8102E]" />
                Áudio Pronto para Transcrição
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {audioBlob ? `${Math.round(audioBlob.size / 1024)} KB` : ""}
              </span>
            </div>
            <audio src={audioUrl} controls className="w-full h-9 rounded-lg" />
          </div>
        )}

        {/* Action button to execute Gemini Transcription */}
        {audioBlob && !isRecording && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTranscribe}
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-blue-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A Transcrever com gemini-3.5-transcribe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Transcrever com IA</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Transcribed Output Result */}
      {(transcribedText || isLoading) && (
        <div className="pt-3 border-t border-slate-100 space-y-2 animate-fade-in">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Resultado da Transcrição:
            </span>
            {transcribedText && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copiar Texto
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap min-h-[60px]">
            {isLoading ? (
              <div className="flex items-center gap-2 text-slate-400 py-3 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>O modelo gemini-3.5-transcribe está a decodificar as palavras do áudio...</span>
              </div>
            ) : (
              transcribedText || placeholder
            )}
          </div>

          {transcribedText && onTranscribeComplete && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => onTranscribeComplete(transcribedText)}
                className="px-3 py-1.5 bg-[#C8102E] hover:bg-[#A50D24] text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Usar Este Texto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
