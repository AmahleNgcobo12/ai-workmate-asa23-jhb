import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/tool-workspace";
import { pageHead } from "@/lib/workplace";
export const Route = createFileRoute("/planner")({
  head: () =>
    pageHead(
      "AI Task Planner",
      "AI Task Planner for your professional workday, with editable AI-powered results.",
    ),
  component: () => <ToolWorkspace tool="planner" />,
});
