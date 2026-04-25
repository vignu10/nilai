import { listHistory } from "../state/history.js";

export async function handleFocusRecent(cwd: string): Promise<{
  content: { type: "text"; text: string }[];
}> {
  const history = await listHistory(cwd);

  if (history.length === 0) {
    return {
      content: [
        { type: "text", text: "No session history yet." },
      ],
    };
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recent = history.filter((s) => {
    const ts = new Date(s.started_at).getTime();
    return ts >= sevenDaysAgo;
  });

  if (recent.length === 0) {
    return {
      content: [
        { type: "text", text: `No sessions in the last 7 days. (${history.length} older sessions in history.)` },
      ],
    };
  }

  const ended = recent.filter((s) => s.status === "ended");
  const abandoned = recent.filter((s) => s.status === "abandoned");

  const totalMinutes = recent.reduce((sum, s) => {
    const start = new Date(s.started_at).getTime();
    const end = new Date(s.ended_at ?? s.abandoned_at ?? s.started_at).getTime();
    return sum + Math.round((end - start) / 60_000);
  }, 0);

  const lines: string[] = [
    `Last 7 days: ${recent.length} sessions (${totalMinutes}min total)`,
    `Completed: ${ended.length} | Abandoned: ${abandoned.length}`,
    "",
  ];

  for (const s of recent.slice(0, 10)) {
    const icon = s.status === "ended" ? "[done]" : "[left]";
    const start = s.started_at.slice(0, 16).replace("T", " ");
    const criteriaDone = s.done_criteria.length > 0
      ? `${s.milestones.length} milestones`
      : "";
    lines.push(`${icon} ${start} — ${s.task} (${criteriaDone})`);
  }

  if (recent.length > 10) {
    lines.push(`... and ${recent.length - 10} more`);
  }

  return {
    content: [
      {
        type: "text",
        text: lines.join("\n"),
      },
    ],
  };
}
