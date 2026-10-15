import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  FileText,
  Check,
  Plus,
  Mail,
  MessagesSquare,
  NotebookPen,
  ListTodo,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/workplace";
import { useWorkspace } from "./workspace-context";
import { WorkspaceShell } from "./workspace-shell";
import { supabase } from "@/integrations/supabase/client";
import banner from "@/assets/workspace-banner.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export function Dashboard() {
  const { user } = useWorkspace();
  const [recent, setRecent] = useState<
    { id: string; title: string; tool: string; content: string; created_at: string }[]
  >([]);
  const [selected, setSelected] = useState<(typeof recent)[number] | null>(null);
  useEffect(() => {
    if (!user) {
      setRecent([]);
      return;
    }
    supabase
      .from("workplace_outputs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecent(data ?? []));
  }, [user]);
  return (
    <WorkspaceShell>
      <div className="page-heading">
        <div className="eyebrow">YOUR WORKDAY, SIMPLIFIED</div>
        <h1>
          Good things start with a little focus<span className="heading-dot">.</span>
        </h1>
        <p>Less busywork. More meaningful work. What will you create today?</p>
      </div>
      <section className="welcome-banner">
        <img
          src={banner}
          alt="Glass productivity sculpture and floating documents"
          width={1536}
          height={768}
        />
        <div className="banner-copy">
          <span className="banner-eyebrow">
            <span /> YOUR EVERYDAY ADVANTAGE
          </span>
          <h2>Your work. Just a little smarter.</h2>
          <p>
            A helping hand for your inbox, meetings,
            <br className="desktop-panel" /> plans, and everything in between.
          </p>
          <Button asChild>
            <Link to="/email">
              Let’s get to work <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>
      <div className="stats-row">
        <div>
          <span className="stat-icon">
            <FileText />
          </span>
          <div>
            <span className="stat-label">AI tools at your fingertips</span>
            <strong>
              5 <small>ways to work smarter</small>
            </strong>
          </div>
        </div>
        <div>
          <span className="stat-icon">
            <Check />
          </span>
          <div>
            <span className="stat-label">Work created</span>
            <strong>
              {recent.length} <small>{recent.length ? "recent outputs" : "a fresh start"}</small>
            </strong>
          </div>
        </div>
        <div>
          <span className="stat-icon">
            <Clock3 />
          </span>
          <div>
            <span className="stat-label">More room for what matters</span>
            <strong>
              Your time <small>well spent</small>
            </strong>
          </div>
        </div>
      </div>
      <section className="tools-section">
        <div className="section-heading">
          <div>
            <h2>
              Your AI toolkit <span className="count-badge">5 tools</span>
            </h2>
            <p>A smarter starting point for every task.</p>
          </div>
          <span className="section-caption">BUILT FOR YOUR WORKDAY</span>
        </div>
        <div className="tool-grid">
          {tools.map((t) => (
            <article className={`tool-card ${t.color}`} key={t.id}>
              <div className="tool-card-top">
                <span className={`tool-icon ${t.color}`}>
                  <t.icon size={23} />
                </span>
                <ArrowUpRight size={18} className="card-arrow" />
              </div>
              <div className="tool-category">{t.tag}</div>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <Button asChild variant="ghost" className="tool-card-action">
                <Link to={t.path}>
                  {t.action}
                  <ArrowRight size={15} />
                </Link>
              </Button>
            </article>
          ))}
          <article className="tool-card next-card">
            <span className="next-icon">
              <Plus size={22} />
            </span>
            <h3>What’s your next big idea?</h3>
            <p>Think it through with your AI partner.</p>
            <Button variant="outline" asChild>
              <Link to="/chat">
                Let’s talk <ArrowUpRight size={15} />
              </Link>
            </Button>
          </article>
        </div>
      </section>
      <section className="recent-section">
        <div className="section-heading">
          <div>
            <h2>Recent activity</h2>
            <p>Pick up right where you left off.</p>
          </div>
          <span className="text-xs text-muted-foreground">{recent.length} items</span>
        </div>
        <div className="recent-table">
          <div className="table-header">
            <span>ACTIVITY</span>
            <span>TOOL</span>
            <span>CREATED</span>
            <span />
          </div>
          {recent.length ? (
            recent.map((r) => (
              <div className="table-row" key={r.id}>
                <span>
                  <FileText size={17} />
                  {r.title}
                </span>
                <span>{tools.find((t) => t.id === r.tool)?.short}</span>
                <span>
                  {new Date(r.created_at).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Button
                  aria-label={`Open ${r.title}`}
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelected(r)}
                >
                  <ArrowUpRight />
                </Button>
              </div>
            ))
          ) : (
            <div className="recent-empty">
              <span className="empty-activity-icon">
                <Clock3 size={19} />
              </span>
              <span>
                Your next great piece of work starts here.
                <small>Create something with an AI tool and find it here.</small>
              </span>
              <Button variant="ghost" asChild>
                <Link to="/email">
                  Create your first email <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap max-h-[65vh] overflow-auto text-sm">
            {selected?.content}
          </div>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}
