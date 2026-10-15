import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, validateUIMessages } from "ai";
import type { Database, Json } from "@/integrations/supabase/types";
import { createResponsesCall } from "./responses.server";
import { withLovableAiGatewayRunIdHeader } from "./run-id";
import { responsiblePrompt } from "./prompts";
export async function handleChat(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  const url = process.env["SUPABASE_URL"];
  const publicKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const key = process.env["LOVABLE_API_KEY"];
  if (!token) return Response.json({ error: "Please sign in to chat." }, { status: 401 });
  if (!url || !publicKey || !key)
    return Response.json({ error: "AI service is not configured." }, { status: 503 });
  const db = createClient<Database>(url, publicKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user)
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body.conversationId !== "string")
      return Response.json({ error: "Select a conversation." }, { status: 400 });
    const { data: thread, error } = await db
      .from("conversations")
      .select("id")
      .eq("id", body.conversationId)
      .eq("user_id", auth.user.id)
      .single();
    if (error || !thread)
      return Response.json({ error: "Conversation not found." }, { status: 404 });
    const messages = await validateUIMessages({ messages: body.messages });
    const last = messages.at(-1);
    if (last?.role !== "user")
      return Response.json({ error: "A user message is required." }, { status: 400 });
    const { error: saveError } = await db
      .from("conversations")
      .update({ messages: messages as unknown as Json, updated_at: new Date().toISOString() })
      .eq("id", thread.id);
    if (saveError) throw new Error("Could not save your message.");
    const call = createResponsesCall(
      request,
      { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key, model: "openai/gpt-6-astra" },
      await convertToModelMessages(messages),
      responsiblePrompt,
    );
    return await withLovableAiGatewayRunIdHeader(
      call.result.toUIMessageStreamResponse({
        originalMessages: messages,
        sendReasoning: true,
        onError: (e) => (e instanceof Error ? e.message : "The AI request failed."),
        onFinish: async ({ messages: completed }) => {
          const { error } = await db
            .from("conversations")
            .update({
              messages: completed as unknown as Json,
              updated_at: new Date().toISOString(),
            })
            .eq("id", thread.id);
          if (error) throw new Error("Could not save the conversation: " + error.message);
        },
      }),
      call.gateway,
    );
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return new Response(null, { status: 499 });
    return Response.json(
      { error: e instanceof Error ? e.message : "The chat request failed." },
      { status: 400 },
    );
  }
}
