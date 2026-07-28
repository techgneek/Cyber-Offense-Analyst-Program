import { useMemo, useState } from "react";
import {
  OWASP_LLM_TOP_10,
  OWASP_AGENTIC_AI_RISKS,
  MENTOR_RULES,
  AI_SECURITY_FRAMEWORKS,
  ReferenceItem,
} from "../referenceData";
import { Shield, AlertTriangle, Cpu, Terminal, Search, CheckCircle2, ChevronDown, BookOpen } from "lucide-react";

export default function ReferenceSheet() {
  const [openSection, setOpenSection] = useState<"owasp-llm" | "owasp-agentic" | "mentor-rules" | "mitre-atlas" | "frameworks" | null>(null);
  const [expandedLLM, setExpandedLLM] = useState<Record<string, boolean>>({});
  const [expandedAgentic, setExpandedAgentic] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const filterItems = (items: ReferenceItem[]) => {
    if (!searchTerm) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(lower) ||
        item.name.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower)
    );
  };

  const filteredLLM = useMemo(() => filterItems(OWASP_LLM_TOP_10), [searchTerm]);
  const filteredAgentic = useMemo(() => filterItems(OWASP_AGENTIC_AI_RISKS), [searchTerm]);

  const filteredRules = searchTerm
    ? MENTOR_RULES.filter(
        (rule) =>
          rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : MENTOR_RULES;

  const filteredFrameworks = searchTerm
    ? AI_SECURITY_FRAMEWORKS.filter(
        (framework) =>
          framework.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          framework.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          framework.focus.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : AI_SECURITY_FRAMEWORKS;

  const mitreAtlas = filteredFrameworks.find((framework) => framework.code === "MITRE");
  const filteredFrameworksWithoutMitre = filteredFrameworks.filter((framework) => framework.code !== "MITRE");

  const toggleSection = (section: "owasp-llm" | "owasp-agentic" | "mentor-rules" | "mitre-atlas" | "frameworks") => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const toggleItem = (
    code: string,
    section: "owasp-llm" | "owasp-agentic"
  ) => {
    if (section === "owasp-llm") {
      setExpandedLLM((prev) => ({ ...prev, [code]: !prev[code] }));
      return;
    }
    setExpandedAgentic((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const renderAccordionHeader = (
    title: string,
    section: "owasp-llm" | "owasp-agentic" | "mentor-rules" | "mitre-atlas" | "frameworks",
    count: number
  ) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full px-4 py-3 border-b border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-300 text-slate-500 bg-white">
          {count}
        </span>
      </div>
      <ChevronDown
        className={`w-4 h-4 text-slate-500 transition-transform ${openSection === section ? "rotate-180" : ""}`}
      />
    </button>
  );

  const panelHeightClass = openSection ? "max-h-[780px]" : "max-h-[360px]";

  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col w-full transition-all duration-300 ${panelHeightClass}`}>
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              AI Security Reference Library
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Map each walkthrough back to the risks, controls, and frameworks it exercises.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search controls, risks, and mitigations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Reference content (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
        {renderAccordionHeader("OWASP LLM Top 10", "owasp-llm", filteredLLM.length)}
        {openSection === "owasp-llm" && (
          <div className="p-4 space-y-3 border-b border-slate-200">
            <div className="text-[11px] text-slate-500 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              Expand each row to view full details and mitigations for all 10 OWASP LLM risks.
            </div>
            {filteredLLM.map((item: ReferenceItem) => {
              const isExpanded = !!expandedLLM[item.code];
              return (
                <div key={item.code} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.code, "owasp-llm")}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                        {item.code}
                      </span>
                      <h3 className="text-xs font-bold text-slate-800">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <p className="text-xs text-slate-600 mt-2.5 mb-3 leading-relaxed">{item.description}</p>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
                          Core Mitigations:
                        </span>
                        {item.mitigations.map((mit, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-[11px] text-slate-600 leading-relaxed">{mit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {renderAccordionHeader("OWASP Agentic AI", "owasp-agentic", filteredAgentic.length)}
        {openSection === "owasp-agentic" && (
          <div className="p-4 space-y-3 border-b border-slate-200">
            <div className="text-[11px] text-slate-500 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              Expand each row to inspect risks tied to autonomous tools, memory, and orchestration boundaries.
            </div>
            {filteredAgentic.map((item: ReferenceItem) => {
              const isExpanded = !!expandedAgentic[item.code];
              return (
                <div key={item.code} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.code, "owasp-agentic")}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                        {item.code}
                      </span>
                      <h3 className="text-xs font-bold text-slate-800">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <p className="text-xs text-slate-600 mt-2.5 mb-3 leading-relaxed">{item.description}</p>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
                          Core Mitigations:
                        </span>
                        {item.mitigations.map((mit, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-[11px] text-slate-600 leading-relaxed">{mit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {renderAccordionHeader("Mentor Core Rules", "mentor-rules", filteredRules.length)}
        {openSection === "mentor-rules" && (
          <div className="p-4 space-y-3 border-b border-slate-200">
            {filteredRules.map((rule) => (
              <div key={rule.id} className="bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 shadow-sm transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800">{rule.title}</h3>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    {rule.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
              </div>
            ))}
          </div>
        )}

        {renderAccordionHeader("MITRE ATLAS", "mitre-atlas", mitreAtlas ? 1 : 0)}
        {openSection === "mitre-atlas" && mitreAtlas && (
          <div className="p-4 space-y-3 border-b border-slate-200">
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">{mitreAtlas.name}</h3>
                </div>
                <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  {mitreAtlas.code}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{mitreAtlas.description}</p>
              <p className="text-[11px] text-blue-700 mt-2 font-medium">Focus: {mitreAtlas.focus}</p>
              {mitreAtlas.url && (
                <a
                  href={mitreAtlas.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-[11px] text-blue-700 underline mt-2 hover:text-blue-800"
                >
                  Open MITRE ATLAS website
                </a>
              )}
            </div>
          </div>
        )}

        {renderAccordionHeader("Top AI Frameworks", "frameworks", filteredFrameworksWithoutMitre.length)}
        {openSection === "frameworks" && (
          <div className="p-4 space-y-3">
            {filteredFrameworksWithoutMitre.map((framework) => (
              <div key={framework.code} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800">{framework.name}</h3>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                    {framework.code}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{framework.description}</p>
                <p className="text-[11px] text-blue-700 mt-2 font-medium">Focus: {framework.focus}</p>
                {framework.url && (
                  <a
                    href={framework.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[11px] text-blue-700 underline mt-2 hover:text-blue-800"
                  >
                    Open framework source
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Next Version Ideas</h3>
            <ul className="space-y-1 text-[11px] text-slate-600 leading-relaxed list-disc list-inside">
              <li>Add a small architecture map for the frontend, API routes, and voice bridge.</li>
              <li>Link each scenario directly to the relevant controls and audit evidence.</li>
              <li>Provide downloadable walkthrough summaries for each core feature.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
