import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  ArrowRight,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/workplace";
import { useWorkspace } from "./workspace-context";
import { supabase } from "@/integrations/supabase/client";
export function Brand() {
  return (
    <div className="brand">
      <img src="/favicon.svg" alt="" width={34} height={34} />
      <div>
        workplace<span>YOUR AI PRODUCTIVITY PARTNER</span>
      </div>
    </div>
  );
}
export function WorkspaceShell({
  children,
  title = "Overview",
}: {
  children: ReactNode;
  title?: string;
}) {
  const [mobile, setMobile] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, openAuth } = useWorkspace();
  return (
    <div className="workspace">
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Link to="/">
            <Brand />
          </Link>
          <Button
            className="mobile-close"
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X />
          </Button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-letter">W</span>
          <div>
            My workspace<span>Personal workspace</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-heading">WORKSPACE</div>
        <nav>
          <Button asChild variant="ghost" className={`nav-link ${path === "/" ? "active" : ""}`}>
            <Link to="/" onClick={() => setMobile(false)}>
              <LayoutDashboard />
              Overview
            </Link>
          </Button>
          <div className="nav-heading tools-heading">
            AI TOOLS <span>5</span>
          </div>
          {tools.map((t) => (
            <Button
              key={t.id}
              variant="ghost"
              asChild
              className={`nav-link ${path.startsWith(t.path) ? "active" : ""}`}
            >
              <Link to={t.path} onClick={() => setMobile(false)}>
                <t.icon />
                {t.short}
                {t.id === "chat" && <span className="nav-new">NEW</span>}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-note">
            <span className="small-brand">✳</span>
            <h4>
              A little less busy.
              <br />A lot more done.
            </h4>
            <p>Make room for your best work.</p>
            <Button variant="link" asChild className="p-0 h-auto text-xs">
              <Link to="/planner">
                Find your focus <ArrowUpRight size={13} />
              </Link>
            </Button>
          </div>
          <div className="sidebar-user">
            <span className="user-avatar">
              {user ? user.email?.slice(0, 2).toUpperCase() : "W"}
            </span>
            <Button
              variant="ghost"
              className="user-action"
              onClick={user ? () => supabase.auth.signOut() : openAuth}
            >
              <span>
                {user ? user.email?.split("@")[0] : "Your workspace"}
                <small>{user ? "Personal account" : "Sign in to get started"}</small>
              </span>
              {user ? <LogOut /> : <ArrowRight />}
            </Button>
          </div>
        </div>
      </aside>
      {mobile && <div className="mobile-scrim" onClick={() => setMobile(false)} />}
      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              className="mobile-menu"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </Button>
            <PanelLeftClose className="desktop-panel" size={17} />
            <span className="breadcrumb-divider" />
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <span className="ai-status">
              <span />
              AI is ready
            </span>
            <Button variant="outline" size="sm" onClick={openAuth}>
              {user ? "My account" : "Sign in"}
              <ArrowUpRight size={14} />
            </Button>
          </div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="workspace-footer">
          <span>
            <ShieldCheck size={14} /> AI can make mistakes. Review outputs and avoid sharing
            sensitive information.
          </span>
          <span>Made for a more focused workday</span>
        </footer>
      </div>
    </div>
  );
}
