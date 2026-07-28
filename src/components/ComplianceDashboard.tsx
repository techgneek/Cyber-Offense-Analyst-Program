import { useMemo, useState, useEffect } from "react";
import { ComplianceRecord } from "../types";
import {
  ShieldCheck, XCircle, CheckCircle2, AlertTriangle,
  Download, EyeOff, Siren, ShieldAlert, Play, ChevronDown, ChevronUp,
  History, FileDown, TrendingDown,
} from "lucide-react";
import { agentService } from "../services/api";

interface ComplianceDashboardProps {
  isOpen: boolean;
  records: ComplianceRecord[];
  isLoading: boolean;
  onClose: () => void;
  onRefreshEvidence?: () => void;
}

type FilterTab = "all" | "redteam" | "soc2" | "shadow";
type HistoryEntry = {
  auditId: string;
  timestamp: string;
  passed: number;
  failed: number;
  total: number;
  results: Array<{ owasp: string; title: string; result: "PASS" | "FAIL"; severity?: string; cwe?: string }>;
};

const SHADOW_PREFIX = "shadow_";
const DOS_TYPE = "dos_protection_triggered";
const AUDIT_RESULT_TYPE = "redteam_audit_result";
const AUDIT_DONE_TYPE = "redteam_audit_completed";

const isShadowRecord = (r: ComplianceRecord) =>
  typeof r.eventType === "string" && r.eventType.startsWith(SHADOW_PREFIX);
const isDosRecord = (r: ComplianceRecord) => r.eventType === DOS_TYPE;
const isAuditRecord = (r: ComplianceRecord) =>
  r.eventType === AUDIT_RESULT_TYPE || r.eventType === AUDIT_DONE_TYPE;
const isRedTeamRecord = (r: ComplianceRecord) =>
  isShadowRecord(r) || isDosRecord(r) || isAuditRecord(r);

const humanize = (s?: string) => s ? s.replace(/_/g, " ") : "compliance event";

const etAccent = (et?: string) => {
  if (!et) return "text-slate-300";
  if (et === AUDIT_RESULT_TYPE || et === AUDIT_DONE_TYPE) return "text-violet-300";
  if (et === DOS_TYPE) return "text-orange-300";
  if (et === "shadow_containment_engaged") return "text-red-300";
  if (et === "shadow_engagement_escalated") return "text-rose-400";
  if (et === "shadow_decoy_api_probed") return "text-orange-300";
  if (et === "shadow_memory_anchor_hit" || et === "shadow_honeyprompt_referenced") return "text-amber-300";
  if (et === "shadow_tester_bypass" || et === "shadow_tester_exit") return "text-cyan-300";
  if (et === "shadow_engagement_summary") return "text-emerald-300";
  return "text-slate-300";
};

const severityColor = (sev?: string) => {
  if (sev === "Critical") return "bg-red-950/60 text-red-300 border-red-700";
  if (sev === "High")     return "bg-orange-950/60 text-orange-300 border-orange-700";
  if (sev === "Medium")   return "bg-amber-950/60 text-amber-300 border-amber-700";
  if (sev === "Low")      return "bg-slate-900 text-slate-300 border-slate-700";
  return "bg-slate-900 text-slate-400 border-slate-700";
};

const AUDIT_STEP_LABELS = [
  "LLM-01 Prompt Injection",
  "LLM-02 Insecure Output Handling",
  "LLM-03 Training Data Poisoning",
  "LLM-04 Model Denial of Service",
  "LLM-05 Supply Chain",
  "LLM-06 Sensitive Info Disclosure",
  "LLM-07 Insecure Plugin/Tool",
  "LLM-08 Excessive Agency",
  "LLM-09 Overreliance on LLM",
  "LLM-10 Model Theft/Extraction",
];

const LOCAL_AUDIT_HISTORY_KEY = "aetos_redteam_audit_history";

const readLocalAuditHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
};

export default function ComplianceDashboard({
  isOpen, records, isLoading, onClose, onRefreshEvidence,
}: ComplianceDashboardProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAuditRunning, setIsAuditRunning] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [lastAudit, setLastAudit] = useState<HistoryEntry | null>(null);
  const [prevAudit, setPrevAudit] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [regressions, setRegressions] = useState<string[]>([]);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [showMobileOverview, setShowMobileOverview] = useState(false);
  const [showMobileActivity, setShowMobileActivity] = useState(false);

  // Load history when dashboard opens
  useEffect(() => {
    if (!isOpen) return;
    const local = readLocalAuditHistory();
    if (local.length > 0) {
      setHistory(local);
      setLastAudit(local[0] || null);
      setPrevAudit(local[1] || null);
    }

    agentService.getRedTeamAuditHistory()
      .then((data) => {
        const audits = (Array.isArray(data.audits) && data.audits.length > 0 ? data.audits : local) as HistoryEntry[];
        setHistory(audits);
        if (audits.length > 0) setLastAudit(audits[0] as HistoryEntry);
        if (audits.length > 1) setPrevAudit(audits[1] as HistoryEntry);
      })
      .catch((err) => console.error("history load error:", err));
  }, [isOpen]);

  // Progress step animation during audit
  useEffect(() => {
    if (!isAuditRunning) { setProgressStep(0); return; }
    const t = setInterval(() => {
      setProgressStep((s) => (s < AUDIT_STEP_LABELS.length - 1 ? s + 1 : s));
    }, 220);
    return () => clearInterval(t);
  }, [isAuditRunning]);

  const redteamRecords = useMemo(() => records.filter(isRedTeamRecord), [records]);
  const shadowRecords  = useMemo(() => records.filter(isShadowRecord), [records]);
  const dosRecords     = useMemo(() => records.filter(isDosRecord), [records]);
  const auditRecords   = useMemo(() => records.filter(isAuditRecord), [records]);
  const soc2Records    = useMemo(() => records.filter((r) => !isRedTeamRecord(r)), [records]);

  const visible = useMemo(() => {
    if (filter === "redteam") return redteamRecords;
    if (filter === "shadow")  return shadowRecords;
    if (filter === "soc2")    return soc2Records;
    return records;
  }, [filter, records, redteamRecords, shadowRecords, soc2Records]);

  const rtStats = useMemo(() => {
    const m = new Map<string, number>();
    redteamRecords.forEach((r) => m.set(r.eventType||"unknown", (m.get(r.eventType||"unknown")||0)+1));
    return m;
  }, [redteamRecords]);

  if (!isOpen) return null;

  const total      = visible.length;
  const allowCount = visible.filter((r) => r.decision === "ALLOW").length;
  const denyCount  = visible.filter((r) => r.decision === "DENY").length;
  const highRisk   = visible.filter((r) => r.riskLevel === "High").length;

  const toCell = (v: string|number|boolean|undefined) => `"${String(v??"").replace(/"/g,'""')}"`;

  const handleExportCsv = () => {
    if (!visible.length) return;
    const headers = [
      "timestamp","source","eventType","decision","riskLevel","action","model","controls",
      "justification","evidenceRef","incidentId","policyVersion",
      "hits","suspicionScore","eventsCount","shadowSessionKey","route","method",
      "testerBypass","anchor","activeSessions","containedSessions","escalatedSessions",
      "totalSuspicion","before",
      "dosControl","requestsInWindow","limitRpm","payloadChars","limitChars","dosActorId",
      "auditId","owaspRisk","auditResult","testLayer","testNotes","auditPassed","auditFailed","auditTotal",
      "severity","cwe","vectorsBlocked","vectorsTotal",
    ];
    const lines = visible.map((r) =>
      [
        r.timestamp,r.source,r.eventType,r.decision,r.riskLevel,r.action,r.model||"n/a",
        r.controlIds.join(" | "),r.justification,r.evidenceRef,r.incidentId,r.policyVersion,
        r.hits?r.hits.join(" | "):"",r.suspicionScore,r.eventsCount,r.shadowSessionKey,
        r.route,r.method,r.testerBypass,r.anchor,r.activeSessions,r.containedSessions,
        r.escalatedSessions,r.totalSuspicion,r.before?JSON.stringify(r.before):"",
        r.dosControl,r.requestsInWindow,r.limitRpm,r.payloadChars,r.limitChars,r.dosActorId,
        r.auditId,r.owaspRisk,r.auditResult,r.testLayer,r.testNotes,r.auditPassed,r.auditFailed,r.auditTotal,
        r.severity,r.cwe,
        r.vectors ? r.vectors.filter(v=>v.blocked).length : "",
        r.vectors ? r.vectors.length : "",
      ].map((f)=>toCell(f as string|number|boolean|undefined)).join(",")
    );
    const csv = [headers.map(toCell).join(","),...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    const ts = new Date().toISOString().replace(/[:.]/g,"-");
    const a = document.createElement("a");
    a.href=url; a.download=`soc2-${filter}-${ts}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunAudit = async () => {
    setShowConfirm(false);
    setIsAuditRunning(true);
    setProgressStep(0);
    setAuditError(null);
    try {
      const result = await agentService.runRedTeamAudit();
      const entry: HistoryEntry = {
        auditId: result.auditId, timestamp: result.timestamp,
        passed: result.passed, failed: result.failed, total: result.total,
        results: result.results.map((r) => ({
          owasp: r.owasp, title: r.title, result: r.result as "PASS"|"FAIL",
          severity: r.severity, cwe: r.cwe,
        })),
      };
      // Regression detection vs. previous audit (lastAudit becomes previous)
      const previous = lastAudit;
      if (previous) {
        const regressed: string[] = [];
        for (const r of entry.results) {
          const prevMatch = previous.results.find((p) => p.owasp === r.owasp);
          if (prevMatch && prevMatch.result === "PASS" && r.result === "FAIL") {
            regressed.push(`${r.owasp} (${r.title})`);
          }
        }
        setRegressions(regressed);
        setPrevAudit(previous);
      }
      setLastAudit(entry);
      setHistory((h) => [entry, ...h].slice(0, 20));
      onRefreshEvidence?.();
    } catch (err) {
      console.error("Red team audit error:", err);
      setAuditError("Red team audit failed to run. Verify backend availability and retry.");
    } finally {
      setIsAuditRunning(false);
    }
  };

  const handleDownloadReport = () => {
    if (!lastAudit) return;
    const lines: string[] = [];
    lines.push(`# Red Team Audit Report`);
    lines.push(``);
    lines.push(`- **Audit ID:** \`${lastAudit.auditId}\``);
    lines.push(`- **Timestamp:** ${lastAudit.timestamp}`);
    lines.push(`- **Result:** ${lastAudit.passed}/${lastAudit.total} tests PASS · ${lastAudit.failed} FAIL`);
    lines.push(``);
    lines.push(`## Executive Summary`);
    lines.push(``);
    lines.push(`This report captures the outcome of an automated OWASP LLM Top 10 red team audit against the live application. Each test executes multiple attack vectors. A test PASSES only if every vector is blocked.`);
    lines.push(``);

    // Pull latest full results from evidence records
    const auditRows = records.filter((r) => r.eventType === AUDIT_RESULT_TYPE && r.auditId === lastAudit.auditId);
    lines.push(`## Findings`);
    lines.push(``);
    lines.push(`| OWASP | Title | Result | Severity | CWE | Layer |`);
    lines.push(`|-------|-------|--------|----------|-----|-------|`);
    lastAudit.results.forEach((r) => {
      lines.push(`| ${r.owasp} | ${r.title} | ${r.result === "PASS" ? "✅ PASS" : "❌ FAIL"} | ${r.severity ?? "-"} | ${r.cwe ?? "-"} | ${auditRows.find(a=>a.owaspRisk===r.owasp)?.testLayer ?? "-"} |`);
    });
    lines.push(``);

    lines.push(`## Vector Detail`);
    lines.push(``);
    lastAudit.results.forEach((r) => {
      const row = auditRows.find((a) => a.owaspRisk === r.owasp);
      lines.push(`### ${r.owasp} — ${r.title}`);
      lines.push(``);
      lines.push(`- Result: **${r.result}**`);
      lines.push(`- Severity: ${r.severity ?? "-"}`);
      lines.push(`- CWE: ${r.cwe ?? "-"}`);
      lines.push(`- Layer: ${row?.testLayer ?? "-"}`);
      lines.push(`- Evidence: \`${row?.evidenceRef ?? "-"}\``);
      lines.push(``);
      if (row?.vectors && row.vectors.length) {
        lines.push(`| Vector | Attempted | Blocked | Mechanism |`);
        lines.push(`|--------|-----------|---------|-----------|`);
        row.vectors.forEach((v) => {
          lines.push(`| ${v.id} | ${v.attempted.replace(/\|/g, "\\|")} | ${v.blocked ? "✅" : "❌"} | ${v.mechanism} |`);
        });
      }
      if (row?.testNotes) {
        lines.push(``);
        lines.push(`> ${row.testNotes}`);
      }
      lines.push(``);
    });

    lines.push(`## Signed Evidence Chain`);
    lines.push(``);
    lines.push(`All results are appended to the tamper-evident SOC 2 hash chain and retrievable via \`GET /api/compliance/evidence?auditId=${lastAudit.auditId}\`.`);
    lines.push(``);
    lines.push(`Chain integrity can be verified independently via \`GET /api/compliance/chain/verify\`.`);

    const md = lines.join("\n");
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8;" }));
    const ts = lastAudit.timestamp.replace(/[:.]/g, "-");
    const a = document.createElement("a");
    a.href = url;
    a.download = `redteam-audit-report-${ts}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const tabs: Array<{ id: FilterTab; label: string; count: number; activeClass?: string }> = [
    { id: "all",     label: "All",      count: records.length },
    { id: "redteam", label: "Red Team", count: redteamRecords.length,
      activeClass: "bg-orange-500/15 text-orange-200 border-orange-500/40" },
    { id: "soc2",    label: "SOC 2",    count: soc2Records.length },
    { id: "shadow",  label: "Shadow",   count: shadowRecords.length },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-start justify-center md:pt-20 md:px-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <section className="relative w-full max-w-4xl h-[100dvh] md:h-auto md:max-h-[calc(100dvh-5.5rem)] bg-slate-950 border border-slate-700 rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Confirmation overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm rounded-2xl">
            <div className="w-full max-w-sm mx-6 bg-slate-900 border border-orange-700/60 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Siren className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Run Live Red Team Audit?</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                This fires all 10 OWASP LLM security tests (30+ attack vectors) against the live application
                and writes signed evidence to the compliance hash chain. Results appear in the Red Team tab.
              </p>
              <p className="text-[11px] text-slate-500 mb-5">Audit takes ~3–5 seconds. No real model calls are made.</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-md border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >Cancel</button>
                <button
                  onClick={handleRunAudit}
                  className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500 border border-orange-500 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Yes, Run Audit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="px-3 py-2.5 md:px-5 md:py-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between gap-2 md:gap-3 flex-wrap sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-100">SOC 2 Compliance Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-700/70 bg-blue-950/30 text-[11px] font-semibold text-blue-200 hover:bg-blue-900/40 transition-colors"
          >
            Back To Chat
          </button>
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            {lastAudit && (
              <span className={`text-[10px] md:text-[11px] font-mono px-1.5 py-1 md:px-2 rounded border ${
                lastAudit.failed === 0
                  ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                  : "border-red-700 bg-red-950/40 text-red-300"
              }`}>
                Last audit: {lastAudit.passed}/{lastAudit.total} PASS
              </span>
            )}
            {history.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setHistoryOpen((s) => !s)}
                  className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-slate-700 text-[10px] md:text-[11px] font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  title="Audit history"
                >
                  <History className="w-3.5 h-3.5" />
                  History ({history.length})
                </button>
                {historyOpen && (
                  <div className="absolute right-0 top-full mt-1 w-[min(20rem,calc(100vw-2rem))] max-h-72 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 px-2 py-1">Recent audits</p>
                    {history.slice(0, 5).map((h) => {
                      const isFail = h.failed > 0;
                      return (
                        <div key={h.auditId} className="px-2 py-1.5 flex items-center justify-between text-[11px] rounded hover:bg-slate-800">
                          <span className="font-mono text-slate-400">{new Date(h.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          <span className={`font-bold ${isFail ? "text-red-300" : "text-emerald-300"}`}>{h.passed}/{h.total}</span>
                        </div>
                      );
                    })}
                    {history.length === 0 && <p className="text-[11px] text-slate-500 px-2 py-1">No prior audits.</p>}
                  </div>
                )}
              </div>
            )}
            {lastAudit && (
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 text-[10px] md:text-xs font-semibold tracking-wide hover:bg-slate-800 transition-colors"
                title="Download the latest audit as a markdown report"
              >
                <FileDown className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-sky-400">Download Report</span>
              </button>
            )}
            <button
              onClick={() => !isAuditRunning && setShowConfirm(true)}
              disabled={isAuditRunning}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-orange-700/60 bg-orange-950/30 text-[10px] md:text-xs font-semibold tracking-wide text-orange-200 hover:bg-orange-900/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              title="Run all 10 OWASP LLM red team tests against the live application"
            >
              {isAuditRunning ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-orange-300 border-t-transparent animate-spin" />
                  Testing {AUDIT_STEP_LABELS[progressStep]}…
                </>
              ) : (
                <>
                  <Siren className="w-3.5 h-3.5" />
                  Run Live Red Team Audit
                </>
              )}
            </button>
            <button
              onClick={handleExportCsv}
              disabled={!visible.length}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 text-[10px] md:text-xs font-semibold tracking-wide hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!visible.length ? "No records" : "Export current view to CSV"}
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-sky-400">Export CSV</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors" aria-label="Close">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Regression banner */}
        {auditError && (
          <div className="px-4 py-2 border-b border-red-800 bg-red-950/40 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-200">{auditError}</p>
          </div>
        )}

        {regressions.length > 0 && (
          <div className="px-4 py-2 border-b border-red-800 bg-red-950/40 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-200">
              <span className="font-bold uppercase tracking-wider">Regression detected:</span>{" "}
              {regressions.length} test{regressions.length > 1 ? "s" : ""} regressed from PASS to FAIL — {regressions.join(", ")}
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="px-3 md:px-4 pt-2.5 md:pt-3 border-b border-slate-800 bg-slate-900/40 flex items-center gap-1.5 md:gap-2 flex-wrap">
          {tabs.map((tab) => {
            const active = filter === tab.id;
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className={`px-2.5 md:px-3 py-1.5 rounded-md text-[10px] md:text-[11px] font-semibold uppercase tracking-wider border transition-colors ${
                  active ? (tab.activeClass ?? "bg-emerald-500/15 text-emerald-200 border-emerald-500/40")
                         : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                {tab.label}<span className="ml-2 text-slate-400">{tab.count}</span>
              </button>
            );
          })}
          {auditRecords.length > 0 && (
            <span className="text-[10px] font-mono px-2 py-1 rounded border border-violet-800 bg-violet-950/30 text-violet-300">
              {auditRecords.filter(r=>r.eventType===AUDIT_RESULT_TYPE).length} audit results
            </span>
          )}
          <span className="ml-auto text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider py-1">
            {isLoading ? "syncing evidence…" : "live evidence"}
          </span>
        </div>

        <div className="md:hidden px-3 py-2 border-b border-slate-800 bg-slate-900/30">
          <button
            type="button"
            onClick={() => setShowMobileOverview((v) => !v)}
            className="w-full inline-flex items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-300"
          >
            <span>Overview Stats</span>
            {showMobileOverview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Stats */}
        <div className={`${showMobileOverview ? "grid" : "hidden"} md:grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4 border-b border-slate-800 bg-slate-900/30`}>
          {([["Events",total,"text-slate-100"],["Allowed",allowCount,"text-emerald-400"],
             ["Denied",denyCount,"text-red-400"],["High Risk",highRisk,"text-amber-400"]] as const).map(([label,value,color])=>(
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 md:p-3">
              <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
              <p className={`text-base md:text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {(filter==="all"||filter==="redteam"||filter==="shadow") && redteamRecords.length>0 && (
          <div className="md:hidden px-3 py-2 border-b border-slate-800 bg-slate-950/50">
            <button
              type="button"
              onClick={() => setShowMobileActivity((v) => !v)}
              className="w-full inline-flex items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-300"
            >
              <span>Red Team Activity</span>
              {showMobileActivity ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Red Team activity strip */}
        {(filter==="all"||filter==="redteam"||filter==="shadow") && redteamRecords.length>0 && (
          <div className={`${showMobileActivity ? "block" : "hidden"} md:block px-3 md:px-4 py-2.5 md:py-3 border-b border-slate-800 bg-slate-950/60`}>
            <div className="flex items-center gap-2 mb-2">
              <Siren className="w-3.5 h-3.5 text-orange-400" />
              <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-orange-300 font-semibold">
                Red Team Activity — {redteamRecords.length} events
                <span className="ml-2 text-slate-400">
                  ({dosRecords.length} DoS · {shadowRecords.length} shadow · {auditRecords.length} audit)
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...rtStats.entries()].sort((a,b)=>b[1]-a[1]).map(([et,count])=>(
                <span key={et} className={`text-[9px] md:text-[10px] font-mono px-2 py-1 rounded border border-slate-800 bg-slate-950 ${etAccent(et)}`} title={et}>
                  {humanize(et)} · {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Record list */}
        <div className="compliance-scrollbar flex-1 min-h-0 overflow-y-auto p-4 space-y-3 overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
          {isLoading && !visible.length && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-slate-400">Loading compliance evidence…</div>
          )}
          {!isLoading && !visible.length && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-slate-400">No records for this filter yet.</div>
          )}

          {visible.map((record) => {
            const shadow = isShadowRecord(record);
            const dos = isDosRecord(record);
            const audit = isAuditRecord(record);
            const isDone = record.eventType === AUDIT_DONE_TYPE;
            const isExpanded = expandedRows.has(record.id);
            const hasVectors = audit && !isDone && record.vectors && record.vectors.length > 0;

            return (
              <article key={record.id} className={`bg-slate-900 rounded-lg p-3 border ${
                dos ? "border-orange-800/50" : audit ? "border-violet-800/50" : shadow ? "border-slate-700" : "border-slate-800"
              }`}>
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {record.decision==="ALLOW" ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/>
                    : record.decision==="DENY" ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0"/>
                    : <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0"/>}
                    <span className={`text-xs font-bold ${record.decision==="ALLOW"?"text-emerald-400":record.decision==="DENY"?"text-red-400":"text-blue-400"}`}>
                      {record.decision}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{record.source}</span>
                    {record.eventType && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-800 bg-slate-950 ${etAccent(record.eventType)}`}>
                        {humanize(record.eventType)}
                      </span>
                    )}
                    {dos && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-orange-800 bg-orange-950/40 text-orange-300 inline-flex items-center gap-1"><ShieldAlert className="w-3 h-3"/>DoS blocked</span>}
                    {shadow && !dos && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-800 bg-emerald-950/40 text-emerald-300 inline-flex items-center gap-1"><EyeOff className="w-3 h-3"/>shadow</span>}
                    {audit && record.auditResult && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${record.auditResult==="PASS"?"bg-emerald-950/60 text-emerald-300 border border-emerald-700":"bg-red-950/60 text-red-300 border border-red-700"}`}>
                        {record.auditResult}
                      </span>
                    )}
                    {audit && record.owaspRisk && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-violet-800 bg-violet-950/40 text-violet-300">{record.owaspRisk}</span>
                    )}
                    {audit && record.severity && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityColor(record.severity)}`}>
                        {record.severity}
                      </span>
                    )}
                    {audit && record.cwe && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700 bg-slate-950 text-slate-400">{record.cwe}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{record.timestamp}</span>
                </div>

                <p className="text-xs text-slate-300 mb-2">{record.justification}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <p className="text-slate-400">Action: <span className="text-slate-200">{record.action}</span></p>
                  <p className="text-slate-400">Risk: <span className="text-slate-200">{record.riskLevel}</span></p>
                  <p className="text-slate-400">Evidence: <span className="text-slate-200 font-mono">{record.evidenceRef}</span></p>
                  {!audit && <p className="text-slate-400">Model: <span className="text-slate-200">{record.model||"n/a"}</span></p>}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Controls: <span className="text-slate-200">{record.controlIds.join(", ")}</span></p>

                {/* Audit result detail */}
                {audit && !isDone && (
                  <div className="mt-3 pt-3 border-t border-violet-900/40 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    {record.testLayer && <p className="text-slate-400">Layer: <span className="text-slate-200 font-mono">{record.testLayer}</span></p>}
                    {record.auditId && <p className="text-slate-400">Audit ID: <span className="text-slate-200 font-mono">{record.auditId.slice(-8)}</span></p>}
                    {record.testNotes && <p className="text-slate-400 md:col-span-2">Notes: <span className="text-slate-200">{record.testNotes}</span></p>}
                    {hasVectors && (
                      <button
                        onClick={() => toggleRow(record.id)}
                        className="md:col-span-2 mt-2 inline-flex items-center gap-1.5 self-start text-[11px] text-violet-300 hover:text-violet-200 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? "Hide" : "Show"} {record.vectors!.length} attack vectors
                        <span className="text-slate-500">({record.vectors!.filter(v=>v.blocked).length} blocked / {record.vectors!.length} total)</span>
                      </button>
                    )}
                    {hasVectors && isExpanded && (
                      <div className="md:col-span-2 mt-2 space-y-2">
                        {record.vectors!.map((v) => (
                          <div key={v.id} className={`border rounded p-2 ${v.blocked ? "border-emerald-800/50 bg-emerald-950/20" : "border-red-800/50 bg-red-950/20"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {v.blocked ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
                              <span className="text-[11px] font-mono text-slate-200">{v.id}</span>
                              <span className={`text-[10px] font-bold ${v.blocked ? "text-emerald-300" : "text-red-300"}`}>{v.blocked ? "BLOCKED" : "NOT BLOCKED"}</span>
                            </div>
                            <p className="text-[11px] text-slate-300"><span className="text-slate-500">Description:</span> {v.description}</p>
                            <p className="text-[11px] text-slate-300"><span className="text-slate-500">Attempted:</span> <span className="font-mono">{v.attempted}</span></p>
                            <p className="text-[11px] text-slate-300"><span className="text-slate-500">Mechanism:</span> <span className="font-mono text-violet-300">{v.mechanism}</span></p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Audit completed summary */}
                {isDone && (
                  <div className="mt-3 pt-3 border-t border-violet-900/40 grid grid-cols-3 gap-3 text-[11px]">
                    {typeof record.auditPassed === "number" && <p className="text-slate-400 text-center">Passed<br/><span className="text-emerald-300 text-sm font-bold">{record.auditPassed}</span></p>}
                    {typeof record.auditFailed === "number" && <p className="text-slate-400 text-center">Failed<br/><span className={`text-sm font-bold ${record.auditFailed>0?"text-red-300":"text-emerald-300"}`}>{record.auditFailed}</span></p>}
                    {typeof record.auditTotal === "number" && <p className="text-slate-400 text-center">Total<br/><span className="text-slate-200 text-sm font-bold">{record.auditTotal}</span></p>}
                  </div>
                )}

                {/* DoS detail */}
                {dos && (
                  <div className="mt-3 pt-3 border-t border-orange-900/40 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    {record.dosControl && <p className="text-slate-400">Control: <span className="text-orange-200 font-mono">{record.dosControl.replace("_"," ")}</span></p>}
                    {record.dosActorId && <p className="text-slate-400">Actor: <span className="text-slate-200 font-mono">{record.dosActorId}</span></p>}
                    {typeof record.requestsInWindow==="number" && (
                      <p className="text-slate-400">Requests: <span className="text-orange-200">{record.requestsInWindow}</span>
                        {typeof record.limitRpm==="number" && <span className="text-slate-500"> / {record.limitRpm} limit</span>}
                      </p>
                    )}
                    {typeof record.payloadChars==="number" && (
                      <p className="text-slate-400">Payload: <span className="text-orange-200">{record.payloadChars.toLocaleString()} chars</span>
                        {typeof record.limitChars==="number" && <span className="text-slate-500"> / {record.limitChars.toLocaleString()} limit</span>}
                      </p>
                    )}
                  </div>
                )}

                {/* Shadow detail */}
                {shadow && (
                  <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    {record.hits?.length && <p className="text-slate-400 md:col-span-2">Hits: <span className="text-slate-200 font-mono">{record.hits.join(", ")}</span></p>}
                    {typeof record.suspicionScore==="number" && <p className="text-slate-400">Suspicion: <span className="text-slate-200">{record.suspicionScore}</span></p>}
                    {typeof record.eventsCount==="number" && <p className="text-slate-400">Session events: <span className="text-slate-200">{record.eventsCount}</span></p>}
                    {record.shadowSessionKey && <p className="text-slate-400">Session key: <span className="text-slate-200 font-mono">{record.shadowSessionKey}</span></p>}
                    {record.anchor && <p className="text-slate-400">Anchor: <span className="text-slate-200 font-mono">{record.anchor}</span></p>}
                    {record.route && <p className="text-slate-400">Route: <span className="text-slate-200 font-mono">{record.route}</span></p>}
                    {typeof record.testerBypass==="boolean" && <p className="text-slate-400">Tester bypass: <span className={record.testerBypass?"text-cyan-300":"text-slate-200"}>{String(record.testerBypass)}</span></p>}
                    {typeof record.activeSessions==="number" && <p className="text-slate-400">Active sessions: <span className="text-slate-200">{record.activeSessions}</span></p>}
                    {typeof record.containedSessions==="number" && <p className="text-slate-400">Contained: <span className="text-slate-200">{record.containedSessions}</span></p>}
                    {typeof record.escalatedSessions==="number" && <p className="text-slate-400">Escalated: <span className="text-slate-200">{record.escalatedSessions}</span></p>}
                    {record.before && (
                      <p className="text-slate-400 md:col-span-2">Before exit: <span className="text-slate-200 font-mono">score={record.before.suspicionScore??"?"}, contained={String(record.before.contained??"?")}, events={record.before.events??"?"}</span></p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
