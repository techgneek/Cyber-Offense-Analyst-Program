import React from "react";
import { Volume2, Mic, MicOff } from "lucide-react";

interface VoicePanelProps {
  isVoiceConnected: boolean;
  voiceStatus: "Idle" | "Connecting" | "Active" | "Error";
  voiceLogs: { sender: "user" | "mentor"; text: string; timestamp: Date }[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onToggleVoice: () => void;
}

export default function VoicePanel({
  isVoiceConnected,
  voiceStatus,
  voiceLogs,
  canvasRef,
  onToggleVoice,
}: VoicePanelProps) {
  return (
    <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4 shadow-lg text-white neon-glow-blue">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-widest font-display">
            Voice Mentor Demo
          </h2>
        </div>
        <span
          className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 border ${
            isVoiceConnected
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60 animate-pulse"
              : "bg-slate-900/40 text-slate-500 border-slate-800/80"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isVoiceConnected ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
          {voiceStatus}
        </span>
      </div>

      {/* Oscilloscope Panel */}
      <div className="relative h-[120px] bg-black border border-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={360}
          height={120}
          className="absolute inset-0 w-full h-full opacity-80"
        />
        {/* Subtle Cyber scanline effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/5 to-transparent pointer-events-none" />

        {!isVoiceConnected && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-center p-4 select-none">
            <MicOff className="w-5 h-5 text-slate-600 mb-1.5 animate-pulse" />
            <p className="text-[11px] font-semibold text-slate-300 font-display">Voice Mentor Disconnected</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] leading-relaxed">
              Connect the voice path to use hands-free mentoring with live talk-to-text and audio responses.
            </p>
          </div>
        )}
      </div>

      {/* Connection Switch & Logs */}
      <div className="space-y-3.5">
        <button
          onClick={onToggleVoice}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
            isVoiceConnected
              ? "bg-red-600 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] text-white shadow-md"
              : "bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white shadow-md"
          }`}
        >
          {isVoiceConnected ? (
            <>
              <MicOff className="w-4 h-4 shrink-0" />
              Stop Voice Mentor
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 shrink-0" />
              Start Voice Mentor
            </>
          )}
        </button>

        {/* Streaming Real-Time Vocoder Log */}
        {isVoiceConnected && (
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 max-h-[140px] overflow-y-auto custom-scrollbar flex flex-col gap-2.5">
            <div className="text-[9px] font-mono text-slate-500 border-b border-slate-900 pb-1.5 uppercase tracking-wider font-bold">
              // LIVE VOICE TRANSCRIPT
            </div>
            {voiceLogs.map((log, idx) => (
              <div key={idx} className="text-[11px] leading-relaxed">
                <span
                  className={`font-semibold mr-1.5 uppercase font-mono text-[9px] ${
                    log.sender === "user" ? "text-slate-500" : "text-blue-400"
                  }`}
                >
                  {log.sender === "user" ? "[RECON_ME]" : "[AETOS_ARIS]"}:
                </span>
                <span className="text-slate-300 select-text font-mono text-[11px]">{log.text}</span>
              </div>
            ))}
            {voiceLogs.length === 0 && (
              <div className="text-[10px] text-slate-600 text-center py-2.5 italic font-mono">
                Awaiting input intercept stream...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
