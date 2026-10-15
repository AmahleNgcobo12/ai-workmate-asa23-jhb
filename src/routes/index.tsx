import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard";
import { pageHead } from "@/lib/workplace";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Your workspace",
      "AI Workplace Productivity Assistant — emails, meeting notes, task planning, research, and chat in one focused workspace.",
    ),
  component: Dashboard,
});
