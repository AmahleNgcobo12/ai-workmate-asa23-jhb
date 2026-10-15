import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/tool-workspace";
import { pageHead } from "@/lib/workplace";
export const Route = createFileRoute("/research")({
  head: () =>
    pageHead(
      "AI Research Assistant",
      "AI Research Assistant for your professional workday, with editable AI-powered results.",
    ),
  component: () => <ToolWorkspace tool="research" />,
});
