import { Mail, NotebookPen, ListTodo, Search, MessagesSquare } from "lucide-react";
export const tools = [
  {
    id: "email",
    path: "/email",
    title: "Smart Email Generator",
    short: "Email Generator",
    description: "The right words, every time. Draft clear, professional emails in seconds.",
    action: "Write an email",
    icon: Mail,
    color: "email",
    tag: "COMMUNICATION",
  },
  {
    id: "meetings",
    path: "/meetings",
    title: "Meeting Notes Summarizer",
    short: "Meeting Summarizer",
    description: "Turn long conversations into clear summaries and actionable next steps.",
    action: "Summarize notes",
    icon: NotebookPen,
    color: "meeting",
    tag: "MEETINGS",
  },
  {
    id: "planner",
    path: "/planner",
    title: "AI Task Planner",
    short: "Task Planner",
    description: "From big goals to small steps. Build a plan that works for you.",
    action: "Plan your tasks",
    icon: ListTodo,
    color: "planner",
    tag: "ORGANIZATION",
  },
  {
    id: "research",
    path: "/research",
    title: "AI Research Assistant",
    short: "Research Assistant",
    description: "Explore ideas, connect the dots, and find clarity on any topic.",
    action: "Start researching",
    icon: Search,
    color: "research",
    tag: "KNOWLEDGE",
  },
  {
    id: "chat",
    path: "/chat",
    title: "AI Chat Assistant",
    short: "AI Chat Assistant",
    description: "Your thinking partner for questions, ideas, and everyday work.",
    action: "Start a conversation",
    icon: MessagesSquare,
    color: "chat",
    tag: "YOUR AI PARTNER",
  },
] as const;
export type ToolId = "email" | "meetings" | "planner" | "research";
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | AI Workplace` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | AI Workplace` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
