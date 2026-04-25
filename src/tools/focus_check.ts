import { readSession, assertActive } from "../state/session.js";

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
          "Judge whether this action advances the task toward the criteria. If not, propose focus_park instead of acting.",
        ].join("\n"),
      },
    ],
  };
}
