import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/tool-workspace";
import { pageHead } from "@/lib/workplace";
export const Route = createFileRoute("/email")({
  head: () =>
    pageHead(
      "Smart Email Generator",
      "Smart Email Generator for your professional workday, with editable AI-powered results.",
    ),
  component: () => <ToolWorkspace tool="email" />,
});
