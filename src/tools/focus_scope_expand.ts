import { readSession, writeSession } from "../state/session.js";

export async function handleFocusScopeExpand(
  cwd: string,
  args: { addition: string; extra_minutes?: number },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const session = await readSession(cwd);
  if (!session || session.status !== "active") {
    return {
      isError: true,
      content: [
        { type: "text", text: "No active focus session to expand." },
      ],
    };
  }

  const updatedTask = `${session.task} + ${args.addition}`;
  const extraMinutes = args.extra_minutes ?? 0;
  const updatedTimeBox = session.time_box_minutes + extraMinutes;

  const newCriterion = `Addressed: ${args.addition}`;

  session.task = updatedTask;
  session.time_box_minutes = updatedTimeBox;
  if (session.done_criteria.length < 5) {
    session.done_criteria.push(newCriterion);
  }

  await writeSession(cwd, session);

  return {
    content: [
      {
        type: "text",
        text: [
          `Scope expanded: "${updatedTask}"`,
          extraMinutes > 0 ? `Time box extended: ${updatedTimeBox}min (+${extraMinutes}min)` : `Time box unchanged: ${updatedTimeBox}min`,
          session.done_criteria.length <= 5 ? `Added criterion: "${newCriterion}"` : "Criteria list full — scope noted but no new criterion added.",
        ].join("\n"),
      },
    ],
  };
}
