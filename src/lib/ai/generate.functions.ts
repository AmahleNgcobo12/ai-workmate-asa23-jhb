import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
export const generateWork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      tool: z.enum(["email", "meetings", "planner", "research"]),
      input: z.string().min(1).max(40000),
      tone: z.string(),
      length: z.string(),
      context: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { createResponsesCall } = await import("./responses.server");
    const { responsiblePrompt, toolPrompts } = await import("./prompts");
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured. Please contact the workspace owner.");
    const { result } = createResponsesCall(
      getRequest(),
      { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key, model: "openai/gpt-6-astra" },
      [
        {
          role: "user",
          content: `Task input:\n${data.input}\nAdditional context: ${data.context}\nTone: ${data.tone}\nLength: ${data.length}`,
        },
      ],
      `${responsiblePrompt}\n${toolPrompts[data.tool]}`,
    );
    const content = await result.text;
    if (!content.trim())
      throw new Error("AI did not return an answer. Please start a new request.");
    const { error, data: saved } = await context.supabase
      .from("workplace_outputs")
      .insert({ user_id: context.userId, tool: data.tool, title: data.input.slice(0, 75), content })
      .select("id")
      .single();
    if (error) throw new Error("Your answer could not be saved: " + error.message);
    return { content, id: saved.id };
  });
