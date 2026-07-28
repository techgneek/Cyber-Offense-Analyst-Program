import React, { useRef, useEffect } from "react";
import { MessageSquare, RefreshCw, Send, Mic, Radio, MicOff } from "lucide-react";
import { Message, Scenario } from "../types";

interface ChatPanelProps {
  messages: Message[];
  inputText: string;
  isGenerating: boolean;
  activeScenario: Scenario | null;
  isVoiceConnected: boolean;
  isDictating: boolean;
  voiceStatus: "Idle" | "Connecting" | "Active" | "Error";
  isVoiceAvailable: boolean;
  voiceLogs: { sender: "user" | "mentor"; text: string; timestamp: Date }[];
  starterQuestions: string[];
  showStarterPrompts: boolean;
  onInputChange: (val: string) => void;
  onSubmitMessage: (e: React.FormEvent) => void;
  onToggleVoice: () => void;
  onToggleDictation: () => void;
  onStarterQuestionSelect: (question: string) => void;
}

export default function ChatPanel({
  messages,
  inputText,
  isGenerating,
  activeScenario,
  isVoiceConnected,
  isDictating,
  voiceStatus,
  isVoiceAvailable,
  voiceLogs,
  starterQuestions,
  showStarterPrompts,
  onInputChange,
  onSubmitMessage,
  onToggleVoice,
  onToggleDictation,
  onStarterQuestionSelect,
}: ChatPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Formatter for mentor response blocks
  const renderMessageContent = (text: string) => {
    const parts = text.split("```");
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        // Code Block
        const lines = part.split("\n");
        const language = lines[0] || "bash";
        const code = lines.slice(1).join("\n").trim();
        return (
          <div key={idx} className="my-3 bg-black border border-slate-900 rounded-lg overflow-hidden font-mono text-[11px] text-slate-300">
            <div className="bg-slate-950 px-3 py-1 text-[9px] text-slate-500 flex justify-between items-center select-none uppercase font-bold tracking-widest border-b border-slate-900">
              <span>{language}</span>
              <span className="text-[9px] text-blue-500">Trace Logs</span>
            </div>
            <pre className="p-3 overflow-x-auto leading-relaxed select-text"><code>{code}</code></pre>
          </div>
        );
      }

      // Plain paragraphs and list items
      return (
        <div key={idx} className="space-y-2.5 whitespace-pre-wrap text-xs md:text-[13px] leading-relaxed text-slate-300">
          {part.split("\n").map((line, lIdx) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-blue-500 mt-1.5 shrink-0">•</span>
                  <span className="text-slate-300">{line.replace(/^[-*]\s+/, "")}</span>
                </div>
              );
            }
            if (trimmed.startsWith("### ")) {
              return (
                <h4 key={lIdx} className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mt-3 mb-1 font-display">
                  {trimmed.replace(/^###\s+/, "")}
                </h4>
              );
            }
            if (trimmed.startsWith("## ")) {
              return (
                <h3 key={lIdx} className="text-xs font-semibold text-indigo-400 mt-4 mb-1.5 font-display border-b border-slate-900 pb-1">
                  {trimmed.replace(/^##\s+/, "")}
                </h3>
              );
            }
            return <p key={lIdx} className="text-slate-300">{line}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col h-[calc(100dvh-8.5rem)] min-h-[520px] md:h-[760px] [@media(max-height:700px)]:h-[calc(100dvh-6.5rem)] [@media(max-height:700px)]:min-h-0 shadow-lg relative min-w-0 neon-glow-blue">
      {/* Panel Header */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display">
              Chat Prompt Demo and Session Transcript
            </h3>
            {activeScenario && (
              <span className="text-[9px] text-slate-500 font-mono block tracking-wide uppercase mt-0.5">
                Prompt path: {activeScenario.title}
              </span>
            )}
          </div>
        </div>
        {isGenerating && (
          <span className="text-[9px] text-blue-400 flex items-center gap-1.5 bg-blue-950/50 border border-blue-900/40 px-2.5 py-1 rounded font-mono font-bold animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            EVALUATING PROPOSAL...
          </span>
        )}
      </div>

      <div className="px-5 py-2.5 bg-slate-950/90 border-b border-slate-900/60 flex items-center justify-between gap-3">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Sarah: Use text or voice to explore the selected security prompt. Talk-to-text keeps the chat in sync with the voice mentor path.
        </p>
        <span
          className={`text-[9px] font-mono font-bold px-2 py-1 rounded border uppercase shrink-0 ${
            isVoiceConnected
              ? "text-emerald-300 bg-emerald-950/40 border-emerald-900/50"
              : !isVoiceAvailable
              ? "text-amber-300 bg-amber-950/40 border-amber-900/50"
              : voiceStatus === "Error"
              ? "text-red-300 bg-red-950/40 border-red-900/50"
              : "text-slate-400 bg-slate-900 border-slate-800"
          }`}
        >
          Voice: {isVoiceAvailable ? voiceStatus : "Unavailable"}
        </span>
      </div>

      {/* Messages List Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 md:space-y-5 custom-scrollbar bg-slate-950/20"
      >
        {showStarterPrompts && starterQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Try asking ASARA</p>
            <div className="flex flex-wrap gap-2">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onStarterQuestionSelect(question)}
                  className="text-left px-3 py-2 rounded-full border border-slate-700 bg-slate-900/80 text-[11px] text-slate-200 hover:border-blue-500/70 hover:bg-slate-800 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {voiceLogs.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold">Voice Transcript</div>
            {voiceLogs.slice(-4).map((log, idx) => (
              <div key={`${log.timestamp.getTime()}-${idx}`} className="text-[11px] leading-relaxed">
                <span className={`mr-1.5 font-mono text-[9px] uppercase ${log.sender === "mentor" ? "text-indigo-400" : "text-blue-400"}`}>
                  {log.sender === "mentor" ? "[SARAH]" : "[YOU]"}
                </span>
                <span className="text-slate-300">{log.text}</span>
              </div>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} w-full`}
          >
            {msg.role === "user" ? (
              <div className="p-3.5 rounded-2xl border border-blue-900/70 bg-blue-950/40 max-w-[88%] shadow-md rounded-tr-sm">
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-blue-300">[YOU]</span>
                  <span className="text-[9px] font-mono text-blue-300/80">{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap select-text text-slate-100 text-[13px] leading-relaxed">{msg.text}</p>
              </div>
            ) : (
              <div className="w-full max-w-none px-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-sky-300">ASARA</span>
                  <span className="text-[9px] font-mono text-slate-500">{msg.timestamp}</span>
                </div>
                <div className="text-xs md:text-sm leading-relaxed text-slate-200">
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input controls form */}
      <form onSubmit={onSubmitMessage} className="p-3 bg-slate-950 border-t border-slate-900 flex items-center gap-2 sticky bottom-0 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isGenerating}
            placeholder={activeScenario ? "Ask a follow-up about this prompt or use talk-to-text..." : "Ask ASARA"}
            className="w-full bg-slate-900/70 border border-slate-700 rounded-xl pl-4 pr-24 py-3 text-[13px] md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:bg-slate-900 transition-all disabled:opacity-40"
          />

          <button
            type="button"
            onClick={onToggleDictation}
            disabled={isGenerating}
            className={`absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${
              isDictating ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
            } disabled:opacity-40`}
            title={isDictating ? "Stop talk-to-text" : "Start talk-to-text"}
            aria-label={isDictating ? "Stop talk-to-text" : "Start talk-to-text"}
          >
            {isDictating ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onToggleVoice}
            disabled={voiceStatus === "Connecting" || !isVoiceAvailable}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${
              !isVoiceAvailable
                ? "text-slate-600"
                : isVoiceConnected
                ? "bg-blue-600 text-white"
                : "text-blue-400 hover:bg-slate-800"
            } disabled:opacity-40`}
            title={!isVoiceAvailable ? "Voice chat unavailable in this deployment" : isVoiceConnected ? "Stop voice chat" : "Start voice chat"}
            aria-label={!isVoiceAvailable ? "Voice chat unavailable" : isVoiceConnected ? "Stop voice chat" : "Start voice chat"}
          >
            <Radio className="w-5 h-5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !inputText.trim()}
          className="bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-30 text-white font-bold px-5 rounded-lg text-xs md:text-sm font-sans uppercase tracking-wider transition-all shrink-0 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4 mr-1.5" />
          Send
        </button>
      </form>
    </div>
  );
}
