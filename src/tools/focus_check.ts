import { readSession } from "../state/session.js";

const INSTRUCTIONS: Record<string, string> = {
  low: "Soft check: This may be tangential. Park it if it's not closely related, but no pressure.",
  medium:
    "Judge whether this action advances the task toward the criteria. If not, propose focus_park instead of acting.",
  high:
    "STRICT MODE: Do NOT act unless this directly advances a done criterion. If tangential, you MUST call focus_park and not proceed. No exceptions.",
};

export async function handleFocusCheck(
  cwd: string,
  args: { intended_action: string },
): Promise<{ content: { type: "text"; text: string }[] }> {
  const session = await readSession(cwd);
  if (!session || session.status !== "active") {
    return {
      content: [
        {
          type: "text",
          text: "No active focus session. Start one with focus_start.",
        },
      ],
    };
  }

  const intensity = session.intensity ?? "medium";

  return {
    content: [
      {
        type: "text",
        text: [
          `Current task: ${session.task}`,
          "",
          "Done criteria:",
          ...session.done_criteria.map((c) => `  - ${c}`),
          "",
          `User intends to: ${args.intended_action}`,
          "",
          INSTRUCTIONS[intensity],
        ].join("\n"),
      },
    ],
  };
}
