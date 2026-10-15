import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
const Context = createContext<{ user: User | null; ready: boolean; openAuth: () => void }>({
  user: null,
  ready: false,
  openAuth: () => {},
});
export const useWorkspace = () => useContext(Context);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
      if (session) setOpen(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = signup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) toast.error(result.error.message);
    else if (signup && !result.data.session)
      toast.success("Check your email to confirm your account.");
    else setOpen(false);
  }
  return (
    <Context.Provider value={{ user, ready, openAuth: () => setOpen(true) }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{signup ? "Create your workspace" : "Welcome back"}</DialogTitle>
            <DialogDescription>
              Keep your work and conversations securely in your account.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="outline"
            onClick={async () => {
              const r = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (r.error) toast.error(String(r.error.message));
            }}
          >
            Continue with Google
          </Button>
          <div className="text-center text-xs text-muted-foreground">or continue with email</div>
          <form onSubmit={submit} className="space-y-4">
            <label className="field-label">
              Email
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </label>
            <label className="field-label">
              Password
              <Input
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Button className="w-full" disabled={busy}>
              {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
            </Button>
          </form>
          <div className="flex justify-between">
            <Button variant="link" size="sm" onClick={() => setSignup(!signup)}>
              {signup ? "Already have an account?" : "Create an account"}
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={async () => {
                if (!email) {
                  toast.error("Enter your email first.");
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: window.location.origin + "/reset-password",
                });
                if (error) toast.error(error.message);
                else toast.success("Password reset email sent.");
              }}
            >
              Forgot password?
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Context.Provider>
  );
}
