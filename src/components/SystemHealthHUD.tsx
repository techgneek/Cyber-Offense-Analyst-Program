import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, Cpu, HardDrive, Wifi, FlaskConical } from "lucide-react";
import { agentService, SystemHealth } from "../services/api";

interface SystemHealthHUDProps {
  isVoiceConnected: boolean;
}

export default function SystemHealthHUD({ isVoiceConnected }: SystemHealthHUDProps) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = performance.now();
      try {
        const data = await agentService.getSystemHealth();
        const endTime = performance.now();
        setHealth(data);
        setLatency(Math.round(endTime - startTime));
        setError(false);
      } catch (err) {
        console.error("Health check failed:", err);
        setError(true);
      }
    };

    // Initial check
    checkHealth();

    // Poll every 10 seconds
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3.5 shadow-lg neon-glow-blue">
      <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
            System Diagnostics HUD
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${error ? "bg-red-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
          <span className="text-[10px] font-mono uppercase text-slate-400">
            {error ? "Degraded" : "Nominal"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Core Gateway State */}
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-2.5 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono text-slate-500 block">AI Firewall</span>
            <span className="text-xs font-mono font-bold text-slate-200 truncate block">
              {health?.gemini === "ready" ? "SECURE" : "UNCONFIGURED"}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-2.5 flex items-center gap-2.5">
          <FlaskConical className={`w-4 h-4 shrink-0 ${health?.trainingMode ? "text-amber-400" : "text-emerald-400"}`} />
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono text-slate-500 block">Lab Mode</span>
            <span className="text-xs font-mono font-bold text-slate-200 truncate block">
              {health?.trainingMode ? "TRAINING" : "SAFE STAGING"}
            </span>
          </div>
        </div>

        {/* Live Audio Sync */}
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-2.5 flex items-center gap-2.5">
          <Wifi className={`w-4 h-4 shrink-0 ${isVoiceConnected ? "text-emerald-400" : "text-slate-500"}`} />
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono text-slate-500 block">Live WebRTC</span>
            <span className="text-xs font-mono font-bold text-slate-200 truncate block">
              {isVoiceConnected ? "ESTABLISHED" : "STANDBY"}
            </span>
          </div>
        </div>

        {/* Latency metric */}
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-2.5 flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono text-slate-500 block">Gateway Ping</span>
            <span className="text-xs font-mono font-bold text-slate-200 block">
              {latency !== null ? `${latency} ms` : "--- ms"}
            </span>
          </div>
        </div>

        {/* Uptime metric */}
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-2.5 flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono text-slate-500 block">Broker Uptime</span>
            <span className="text-xs font-mono font-bold text-slate-200 block truncate">
              {health?.uptime ? formatUptime(health.uptime) : "---"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
