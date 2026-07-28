import React from "react";
import { Terminal, Play } from "lucide-react";
import { Scenario } from "../types";

interface ScenarioPanelProps {
  scenarios: Scenario[];
  activeScenario: Scenario | null;
  onSelectScenario: (scen: Scenario) => void;
  onLoadInitialPrompt: () => void;
}

export default function ScenarioPanel({
  scenarios,
  activeScenario,
  onSelectScenario,
  onLoadInitialPrompt,
}: ScenarioPanelProps) {
  return (
    <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4 shadow-lg text-slate-100 neon-glow-blue">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-widest font-display">
            Prompt Coaching Paths
          </h2>
        </div>
        <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded">
          {scenarios.length} PATHS
        </span>
      </div>

      {/* Scenarios Scroll list */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
        {scenarios.map((scen) => {
          const isActive = activeScenario?.id === scen.id;
          return (
            <button
              key={scen.id}
              onClick={() => onSelectScenario(scen)}
              className={`group relative w-full text-left p-3 rounded-xl border text-xs transition-all duration-300 flex flex-col gap-2 cursor-pointer ${
                isActive
                  ? "bg-blue-950/40 border-blue-500/80 text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                  : "bg-slate-900/20 border-slate-900 text-slate-400 hover:bg-slate-900/40 hover:text-slate-100 hover:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 w-full">
                <span className={`font-semibold truncate ${isActive ? "text-blue-300" : ""}`}>
                  {scen.title}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0 ${
                    scen.difficulty === "Easy"
                      ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/60"
                      : scen.difficulty === "Medium"
                      ? "bg-blue-950/50 text-blue-400 border border-blue-900/60"
                      : scen.difficulty === "High"
                      ? "bg-amber-950/50 text-amber-400 border border-amber-900/60"
                      : "bg-red-950/50 text-red-400 border border-red-900/60"
                  }`}
                >
                  {scen.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono w-full">
                <span>CAT: {scen.category}</span>
                <span>ID: {scen.id.toUpperCase()}</span>
              </div>

              <div className="pointer-events-none absolute left-2 right-2 top-2 z-30 rounded-lg border border-slate-700 bg-slate-950/95 p-2 text-[11px] leading-relaxed text-slate-100 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                {scen.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Briefing Box */}
      {activeScenario && (
        <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl text-xs leading-relaxed text-slate-300 transition-all duration-300">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1.5 font-mono">
            // PATH CONTEXT
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {activeScenario.description}
          </p>
          <button
            onClick={onLoadInitialPrompt}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all duration-300 font-sans flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current text-white shrink-0" />
            Open Coaching Prompt
          </button>
        </div>
      )}
    </div>
  );
}
