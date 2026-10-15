import { describe, it, expect } from "vitest";
import { toolPrompts, responsiblePrompt } from "@/lib/ai/prompts";
import { tools } from "@/lib/workplace";

describe("Workplace task contracts", () => {
  it("provides all five requested tools", () => {
    expect(tools.map((t) => t.id)).toEqual(["email", "meetings", "planner", "research", "chat"]);
  });
  it("provides a distinct structured prompt for each generation task", () => {
    expect(Object.keys(toolPrompts)).toEqual(["email", "meetings", "planner", "research"]);
    expect(new Set(Object.values(toolPrompts)).size).toBe(4);
  });
});
