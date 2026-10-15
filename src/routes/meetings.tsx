import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/tool-workspace";
import { pageHead } from "@/lib/workplace";
export const Route = createFileRoute("/meetings")({
  head: () =>
    pageHead(
      "Meeting Notes Summarizer",
      "Meeting Notes Summarizer for your professional workday, with editable AI-powered results.",
    ),
  component: () => <ToolWorkspace tool="meetings" />,
});
