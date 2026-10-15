import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/workplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceShell } from "@/components/workspace-shell";
import { toast } from "sonner";
export const Route = createFileRoute("/reset-password")({
  head: () => pageHead("Reset password", "Securely reset your AI Workplace account password."),
  component: Reset,
});
function Reset() {
  const [password, setPassword] = useState("");
  return (
    <WorkspaceShell title="Reset password">
      <form
        className="max-w-md mx-auto space-y-5 py-16"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.updateUser({ password });
          if (error) toast.error(error.message);
          else {
            toast.success("Password updated");
            window.location.assign("/");
          }
        }}
      >
        <h1>Set a new password</h1>
        <Input
          aria-label="New password"
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button>Update password</Button>
      </form>
    </WorkspaceShell>
  );
}
