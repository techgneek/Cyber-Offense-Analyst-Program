import React, { useEffect, useMemo, useState } from "react";
import { Code, RefreshCw, ShieldAlert, Send } from "lucide-react";
import { agentService } from "../services/api";
import { TrainingXssNote } from "../types";

export default function XssWorkbench() {
  const [notes, setNotes] = useState<TrainingXssNote[]>([]);
  const [author, setAuthor] = useState("lab-tester-01");
  const [body, setBody] = useState("<strong>Training note:</strong> review the note board.");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const sortedNotes = useMemo(() => [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [notes]);

  const refreshNotes = async () => {
    setLoading(true);
    try {
      const items = await agentService.getTrainingXssNotes();
      setNotes(items);
      setErrorText(null);
    } catch {
      setErrorText("Training notes are unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshNotes();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    try {
      const note = await agentService.submitTrainingXssNote({ author: author.trim() || "lab-tester-01", body });
      if (note) {
        setNotes((prev) => [note, ...prev]);
        setBody("<img src=x onerror=alert('xss')>");
        setErrorText(null);
      } else {
        setErrorText("The training note could not be stored.");
      }
    } catch {
      setErrorText("The training note could not be stored.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4 shadow-lg text-slate-100 min-h-[250px] flex-1 neon-glow-blue">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-widest font-display">
            Stored XSS Training Board
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void refreshNotes()}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase text-slate-400 hover:text-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Reload
        </button>
      </div>

      <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
        <p>
          This training-only board intentionally renders note content without sanitization so the lab can demonstrate a realistic stored XSS issue.
        </p>
        <p className="text-[11px] text-amber-300/90">
          Use a payload such as <span className="font-mono">&lt;img src=x onerror=alert(1)&gt;</span> to capture the before state, then fix the sink and retest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Author</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500/70"
          />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Training note</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500/70 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
        >
          <Send className="w-3.5 h-3.5" />
          Store Note
        </button>
      </form>

      {errorText && (
        <div className="text-[11px] text-red-300 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
          {errorText}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono pt-1 flex items-center gap-2">
          <Code className="w-3.5 h-3.5" />
          Notes Feed
        </div>

        {sortedNotes.map((note) => (
          <article
            key={note.id}
            className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 relative hover:border-amber-900/50 transition-all duration-300 text-xs flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase text-slate-500">
              <span>{note.author}</span>
              <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
            <div
              className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-[13px] leading-relaxed text-slate-100 whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: note.body }}
            />
          </article>
        ))}

        {!sortedNotes.length && !loading && (
          <div className="text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl px-4 py-8 text-center">
            No notes captured yet. Add one to create the XSS evidence trail.
          </div>
        )}
      </div>
    </div>
  );
}