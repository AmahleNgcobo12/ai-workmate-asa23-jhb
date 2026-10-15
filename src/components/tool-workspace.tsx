import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Copy, Download, FileText, Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkspaceShell } from "./workspace-shell";
import { useWorkspace } from "./workspace-context";
import { tools, type ToolId } from "@/lib/workplace";
import { generateWork } from "@/lib/ai/generate.functions";
import { supabase } from "@/integrations/supabase/client";
const configs = {
  email: {
    label: "What would you like to say?",
    placeholder:
      "Follow up with a client about our proposal. Ask if they have any questions and suggest a call next week.",
    context: "Recipient and context",
    example:
      "Write a friendly follow-up email to a client after sending a project proposal. Ask for feedback and suggest a 20-minute call next week.",
  },
  meetings: {
    label: "Meeting notes or transcript",
    placeholder: "Paste your meeting notes here…",
    context: "Meeting title and context",
    example:
      "Product team sync. Maya: the design review is complete. Sam will send the prototype by Friday. We agreed to test with five customers before launch. Launch date is not yet decided.",
  },
  planner: {
    label: "What is your goal?",
    placeholder: "Describe your goal, tasks, or project…",
    context: "Timeline and constraints",
    example:
      "Plan a small customer feedback workshop for next month. We have three team members and need to invite customers, prepare questions, run the workshop, and summarize findings.",
  },
  research: {
    label: "What would you like to explore?",
    placeholder: "Enter a topic or question…",
    context: "Audience and focus areas",
    example:
      "Compare asynchronous and real-time communication for a distributed team. Focus on productivity, collaboration, and practical trade-offs.",
  },
};
export function ToolWorkspace({ tool }: { tool: ToolId }) {
  const info = tools.find((t) => t.id === tool);
  const cfg = configs[tool];
  const { user, openAuth } = useWorkspace();
  const generate = useServerFn(generateWork);
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Balanced");
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("");
  const [id, setId] = useState<string>();
  const [error, setError] = useState("");
  if (!info) return null;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      openAuth();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await generate({ data: { tool, input, tone, length, context } });
      setOutput(r.content);
      setId(r.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceShell title={info.short}>
      <div className="tool-page-heading">
        <span className={`tool-icon ${info.color}`}>
          <info.icon />
        </span>
        <div className="eyebrow">{info.tag}</div>
        <h1>{info.title}</h1>
        <p>{info.description}</p>
      </div>
      <div className="tool-workspace">
        <form onSubmit={submit} className="tool-input-panel">
          <div className="panel-heading">
            <h2>Your starting point</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setInput(cfg.example)}>
              Try an example <ArrowRight size={14} />
            </Button>
          </div>
          <label className="field-label">
            {cfg.label}
            <Textarea
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={cfg.placeholder}
              className="min-h-56 mt-2"
              maxLength={40000}
            />
          </label>
          <label className="field-label mt-5">
            {cfg.context}
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add any details that matter"
              className="mt-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-4 my-5">
            <label className="field-label">
              Tone
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Professional", "Friendly", "Formal", "Direct"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="field-label">
              Length
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Brief", "Balanced", "Detailed"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          {tool === "research" && (
            <p className="research-note">
              Knowledge-based research, not live web search. Verify current facts and sources
              independently.
            </p>
          )}
          <Button disabled={busy || !input.trim()} className="w-full h-11">
            {busy ? (
              <>
                <Loader2 className="animate-spin" />
                Working on it…
              </>
            ) : (
              <>
                {info.action}
                <ArrowRight />
              </>
            )}
          </Button>
          {error && (
            <div role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </form>
        <section className="tool-output-panel">
          <div className="panel-heading">
            <h2>Your result</h2>
            <div className="flex gap-1">
              <Button
                disabled={!output}
                size="icon"
                variant="ghost"
                title="Copy output"
                aria-label="Copy output"
                onClick={async () => {
                  await navigator.clipboard.writeText(output);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy />
              </Button>
              <Button
                disabled={!output}
                size="icon"
                variant="ghost"
                title="Download output"
                aria-label="Download output"
                onClick={() => {
                  const url = URL.createObjectURL(new Blob([output], { type: "text/plain" }));
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${tool}-output.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download />
              </Button>
              <Button
                disabled={!id || busy}
                size="icon"
                variant="ghost"
                title="Save edits"
                aria-label="Save edits"
                onClick={async () => {
                  if (!id) return;
                  const { error } = await supabase
                    .from("workplace_outputs")
                    .update({ content: output })
                    .eq("id", id);
                  if (error) toast.error(error.message);
                  else toast.success("Edits saved");
                }}
              >
                <Save />
              </Button>
            </div>
          </div>
          {output ? (
            <Textarea
              aria-label="Editable AI output"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="output-editor"
            />
          ) : (
            <div className="output-empty">
              <FileText size={32} />
              <h3>
                {busy
                  ? "A little thinking, a better result."
                  : "A blank page, full of possibility."}
              </h3>
              <p>
                {busy
                  ? "Your assistant is working on your request."
                  : "Your result will appear here."}
              </p>
            </div>
          )}
          {output && (
            <div className="output-bottom">
              <span>Saved to your workspace</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOutput("");
                  setId(undefined);
                }}
              >
                <RotateCcw />
                Clear result
              </Button>
            </div>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}
