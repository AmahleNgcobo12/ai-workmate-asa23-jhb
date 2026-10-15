import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/chat-workspace";
import { pageHead } from "@/lib/workplace";
export const Route = createFileRoute("/chat/$threadId")({
  head: () =>
    pageHead(
      "Your conversation",
      "Continue a private conversation with your AI Workplace assistant.",
    ),
  component: Thread,
});
function Thread() {
  const { threadId } = Route.useParams();
  return <ChatWorkspace threadId={threadId} />;
}
