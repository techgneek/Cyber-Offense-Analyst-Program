import React from "react";
import { Shield, Sparkles, Menu } from "lucide-react";
import aetosLogo from "../assets/images/aetos_logo.jpg";

interface HeaderProps {
  isVoiceConnected: boolean;
  voiceAvailable: boolean;
  onToggleCompliance: () => void;
  complianceCount: number;
  onOpenMobileMenu: () => void;
}

export default function Header({
  isVoiceConnected,
  voiceAvailable,
  onToggleCompliance,
  complianceCount,
  onOpenMobileMenu,
}: HeaderProps) {
  return (
    <header className="backdrop-blur-md bg-slate-950/80 border-b border-slate-900 px-6 py-3.5 flex items-center justify-between shadow-lg shrink-0 z-10 sticky top-0 relative">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMobileMenu}
          className="xl:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        {/* Aetos Logo */}
        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-inner border border-slate-800">
          <img src={aetosLogo} alt="Aetos Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold tracking-tight text-white font-display">Aetos AI Security Mentor</h1>
            <span className="text-[9px] bg-blue-950/80 border border-blue-900/60 text-blue-400 font-mono font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-wide">
            Agentic AI Security &amp; Research Coaching
          </p>
        </div>
      </div>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
        <button
          onClick={onToggleCompliance}
          className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 hover:border-emerald-700/60 rounded-full px-3.5 py-1.5 text-xs transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">Compliance</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 bg-slate-950/70">
            {complianceCount}
          </span>
        </button>
      </div>

      {/* Connection & Responder States */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/40 border border-slate-800/60 rounded-full px-3.5 py-1 text-xs">
          <span className={`w-2 h-2 rounded-full ${isVoiceConnected ? "bg-emerald-400 animate-ping" : voiceAvailable ? "bg-blue-400 animate-pulse" : "bg-amber-400"}`} />
          <span className="font-semibold text-slate-300">
            {isVoiceConnected
              ? "Voice Intercept Active"
              : voiceAvailable
              ? "Dual Chat/Audio Mode Ready"
              : "Voice Bridge Unavailable"}
          </span>
        </div>

        <div className="hidden sm:flex flex-col items-end text-right text-xs">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">RECON_AGENT</span>
          <span className="font-semibold text-blue-400 font-mono truncate max-w-[180px]">
            james.mtfjourney@gmail.com
          </span>
        </div>
      </div>
    </header>
  );
}
