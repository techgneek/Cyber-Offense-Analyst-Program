import React from "react";
import { Award, RotateCcw, BookOpen } from "lucide-react";
import { Correction } from "../types";

interface LearningCornerProps {
  corrections: Correction[];
  onResetCorrections: () => void;
}

export default function LearningCorner({ corrections, onResetCorrections }: LearningCornerProps) {
  return (
    <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4 shadow-lg text-slate-100 min-h-[250px] flex-1 neon-glow-blue">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-widest font-display">
            Honeypot Protection
          </h2>
        </div>
        {corrections.length > 0 && (
          <button
            onClick={onResetCorrections}
            title="Wipe Logs"
            className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-900/60 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
        <p>
          The shadow containment layer acts like a defensive honeypot inside the application flow. Suspicious prompts, memory probes, and tool-abuse attempts are diverted into decoy paths so the real model and real systems stay isolated.
        </p>
        <div className="space-y-1 text-[11px] text-slate-400">
          <p>• Decoy responses capture hostile intent without exposing production state.</p>
          <p>• Memory anchors and honeyprompt markers help detect repeated probing.</p>
          <p>• The resulting records feed compliance review and red-team follow-up.</p>
        </div>
      </div>

      {/* Corrections List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono pt-1">
          Observed Mentor Corrections
        </div>
        {corrections.map((corr, index) => (
          <div
            key={index}
            className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 relative hover:border-blue-900/50 transition-all duration-300 text-xs flex flex-col gap-2.5"
          >
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
              Control Fix #{corrections.length - index}
            </div>
            <div className="space-y-2 text-[11px] leading-relaxed">
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-500 block">Vulnerable Logic:</span>
                <p className="line-through text-slate-400 italic bg-slate-950/60 border border-slate-900/50 px-2.5 py-1.5 rounded mt-1">
                  "{corr.original}"
                </p>
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono text-emerald-400 block">Secured Practice:</span>
                <p className="text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-900/40 px-2.5 py-1.5 rounded mt-1">
                  ✓ {corr.corrected}
                </p>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed pt-1 select-text">
                {corr.why}
              </p>
            </div>
          </div>
        ))}

        {corrections.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10 px-4">
            <BookOpen className="w-8 h-8 text-slate-800 mb-2" />
            <p className="text-xs font-semibold text-slate-400 font-display">No Corrections Yet</p>
            <p className="text-[10px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
              When the mentor surfaces a weak control, the correction log will capture the before and after guidance here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
