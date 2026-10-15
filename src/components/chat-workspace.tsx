import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Plus, MessagesSquare, Trash2, Copy, Pencil, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning";
import { WorkspaceShell } from "./workspace-shell";
import { useWorkspace } from "./workspace-context";
type Thread = { id: string; title: string };
export function ChatWorkspace({ threadId }: { threadId?: string }) {
  const { user, ready, openAuth } = useWorkspace();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<UIMessage[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    if (!user) {
      setThreads([]);
      setMessages(null);
      return;
    }
    let active = true;
    setMessages(null);
    setError("");
    supabase
      .from("conversations")
      .select("id,title")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setThreads(data ?? []);
      });
    if (threadId)
      supabase
        .from("conversations")
        .select("messages")
        .eq("id", threadId)
        .single()
        .then(({ data, error }) => {
          if (!active) return;
          if (error) setError("This conversation could not be found.");
          else setMessages((data?.messages ?? []) as unknown as UIMessage[]);
        });
    return () => {
      active = false;
    };
  }, [user, threadId]);
  async function create() {
    if (!user) {
      openAuth();
      return;
    }
    setCreating(true);
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: "New conversation" })
      .select("id,title")
      .single();
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setThreads((s) => [data, ...s]);
    navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
  }
  return (
    <WorkspaceShell title="AI Chat Assistant">
      <div className="chat-page-heading">
        <div>
          <div className="eyebrow">YOUR THINKING PARTNER</div>
          <h1>AI Chat Assistant</h1>
          <p>A fresh perspective for whatever’s on your mind.</p>
        </div>
        <Button onClick={create} disabled={creating}>
          <Plus />
          New conversation
        </Button>
      </div>
      <div className="chat-layout">
        <aside className="thread-list">
          <div className="nav-heading">CONVERSATIONS</div>
          {threads.map((t) => (
            <div className={`thread-row ${t.id === threadId ? "selected" : ""}`} key={t.id}>
              <Button variant="ghost" asChild className="thread-select">
                <Link to="/chat/$threadId" params={{ threadId: t.id }}>
                  <MessagesSquare />
                  {t.title}
                </Link>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Delete ${t.title}`}
                onClick={async () => {
                  if (!window.confirm("Delete this conversation?")) return;
                  const { error } = await supabase.from("conversations").delete().eq("id", t.id);
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  setThreads((s) => s.filter((x) => x.id !== t.id));
                  if (t.id === threadId) navigate({ to: "/chat" });
                }}
              >
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
          {!threads.length && (
            <p className="thread-empty">
              A fresh start.
              <br />
              Your conversations live here.
            </p>
          )}
        </aside>
        <section className="chat-main">
          {error ? (
            <p role="alert" className="p-6 text-destructive">
              {error}
            </p>
          ) : user && threadId && messages ? (
            <ChatWindow
              key={threadId}
              id={threadId}
              initial={messages}
              onTitle={(title) =>
                setThreads((s) => s.map((t) => (t.id === threadId ? { ...t, title } : t)))
              }
            />
          ) : user && threadId ? (
            <div className="chat-empty">
              <Loader2 className="animate-spin" />
              <p>Opening your conversation…</p>
            </div>
          ) : (
            <div className="chat-empty">
              <img src="/favicon.svg" width={56} height={56} alt="Workplace assistant" />
              <h2>A good conversation changes things.</h2>
              <p>Bring your ideas, questions, or that task you’re stuck on.</p>
              <Button onClick={user ? create : openAuth}>
                {!ready ? "Loading…" : user ? "Start a conversation" : "Sign in to start chatting"}
                <Plus />
              </Button>
            </div>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}
function ChatWindow({
  id,
  initial,
  onTitle,
}: {
  id: string;
  initial: UIMessage[];
  onTitle: (title: string) => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string>();
  const [edit, setEdit] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { conversationId: id },
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
        },
      }),
    [id],
  );
  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id,
    messages: initial,
    transport,
    onError: (e) => toast.error(e.message),
    onFinish: () => inputRef.current?.focus(),
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);
  async function send(value: string) {
    if (!value.trim() || busy) return;
    if (messages.length === 0) {
      const title = value.slice(0, 44);
      const { error } = await supabase.from("conversations").update({ title }).eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      onTitle(title);
    }
    setText("");
    sendMessage({ text: value });
    inputRef.current?.focus();
  }
  return (
    <>
      <Conversation className="chat-conversation">
        <ConversationContent>
          {!messages.length && (
            <div className="chat-empty">
              <img src="/favicon.svg" width={48} height={48} alt="Workplace assistant" />
              <h2>Let’s make some headway.</h2>
              <div className="chat-suggestions">
                {[
                  "Help me prepare for a difficult conversation",
                  "Brainstorm ideas for a team workshop",
                  "How can I prioritize my work today?",
                ].map((s) => (
                  <Button key={s} variant="outline" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent
                className={
                  m.role === "user"
                    ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                    : ""
                }
              >
                {m.parts.map((part, i) =>
                  part.type === "text" ? (
                    <div key={i}>
                      {editing === m.id ? (
                        <div className="space-y-2">
                          <Textarea
                            aria-label="Edit assistant response"
                            value={edit}
                            onChange={(e) => setEdit(e.target.value)}
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              const next = messages.map((x) =>
                                x.id === m.id
                                  ? {
                                      ...x,
                                      parts: x.parts.map((p) =>
                                        p.type === "text" ? { ...p, text: edit } : p,
                                      ),
                                    }
                                  : x,
                              );
                              const { error } = await supabase
                                .from("conversations")
                                .update({ messages: next as unknown as Json })
                                .eq("id", id);
                              if (error) toast.error(error.message);
                              else {
                                setMessages(next);
                                setEditing(undefined);
                                toast.success("Response edited");
                              }
                            }}
                          >
                            <Check />
                            Save edits
                          </Button>
                        </div>
                      ) : (
                        <MessageResponse>{part.text}</MessageResponse>
                      )}
                      {m.role === "assistant" && !busy && (
                        <div className="flex gap-1 mt-3">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Copy response"
                            title="Copy response"
                            onClick={() => {
                              navigator.clipboard.writeText(part.text);
                              toast.success("Copied");
                            }}
                          >
                            <Copy />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Edit response"
                            title="Edit response"
                            onClick={() => {
                              setEditing(m.id);
                              setEdit(part.text);
                            }}
                          >
                            <Pencil />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : part.type === "reasoning" ? (
                    <Reasoning
                      key={i}
                      defaultOpen={false}
                      isStreaming={busy && m.id === messages.at(-1)?.id}
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{part.text}</ReasoningContent>
                    </Reasoning>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Thinking through your request…</Shimmer>}
          {error && (
            <div role="alert" className="text-destructive text-sm">
              {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="chat-composer">
        <PromptInput onSubmit={({ text: submitted }) => send(submitted)}>
          <PromptInputTextarea
            ref={inputRef}
            aria-label="Message your assistant"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What’s on your mind?"
            autoFocus
          />
          <PromptInputFooter className="justify-between">
            <span className="text-xs text-muted-foreground">Your everyday thinking partner</span>
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </>
  );
}
