import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/chat-workspace";
import { pageHead } from "@/lib/workplace";
export const Route = createFileRoute("/chat/")({
  head: () =>
    pageHead(
      "AI Chat Assistant",
      "A private thinking partner for your workplace questions, with account-saved conversations.",
    ),
  component: () => <ChatWorkspace />,
});
