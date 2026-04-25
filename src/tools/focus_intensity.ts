import { readSession, writeSession } from "../state/session.js";

export async function handleFocusIntensity(
  cwd: string,
  args: { intensity: "low" | "medium" | "high" },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const session = await readSession(cwd);
  if (!session) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "No active session. Start one with focus_start.",
        },
      ],
    };
  }

  if (session.status !== "active" && session.status !== "downtime") {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Cannot change intensity: session is ${session.status}.`,
        },
      ],
    };
  }

  const previous = session.intensity;
  session.intensity = args.intensity;
  await writeSession(cwd, session);

  return {
    content: [
      {
        type: "text",
        text: `Intensity changed from ${previous} to ${args.intensity}.\n\nIntensity levels:\n- low: Soft suggestions, minimal time warnings\n- medium: Proposes parking, standard time nudges (default)\n- high: Strict scope enforcement, aggressive time warnings`,
      },
    ],
  };
}
