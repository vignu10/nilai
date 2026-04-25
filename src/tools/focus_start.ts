import type { Session } from "../state/session.js";
import { readSession, writeSession } from "../state/session.js";
import { isVagueTask } from "../validation/vague.js";
import { getTemplate, incrementTemplateUsage } from "../state/templates.js";

export async function handleFocusStart(
  cwd: string,
  args: {
    task: string;
    done_criteria: string[];
    time_box_minutes: number;
    intensity?: "low" | "medium" | "high";
    template_id?: string;
    energy_start?: number;
    estimated_minutes?: number;
    enable_breaks?: boolean;
    break_type?: "pomodoro_25" | "pomodoro_45";
  },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const existing = await readSession(cwd);
  if (existing && existing.status === "active") {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Session already active: "${existing.task}" (started ${existing.started_at}). Call focus_end first.`,
        },
      ],
    };
  }

  // Load template if provided
  let sessionArgs = { ...args };
  if (args.template_id) {
    const template = await getTemplate(cwd, args.template_id);
    if (template) {
      sessionArgs = {
        ...args,
        time_box_minutes: args.time_box_minutes || template.default_time_box_minutes,
        intensity: args.intensity || template.default_intensity,
        done_criteria: args.done_criteria.length > 0 ? args.done_criteria : template.default_done_criteria,
        enable_breaks: args.enable_breaks ?? template.enable_break_reminders,
        break_type: args.break_type || (template.break_interval_minutes === 25 ? "pomodoro_25" : "pomodoro_45"),
      };
      await incrementTemplateUsage(cwd, args.template_id);
    }
  }

  const vague = isVagueTask(sessionArgs.task);
  if (vague.vague) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Task too vague: ${vague.reasons.join(" ")}\n\n${vague.hint}`,
        },
      ],
    };
  }

  // Validate done_criteria specificity
  for (const c of sessionArgs.done_criteria) {
    if (c.trim().split(/\s+/).length < 3) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Done criterion "${c}" is too vague. Each criterion should be at least 3 words describing an observable outcome.`,
          },
        ],
      };
    }
  }

  const now = new Date();
  const id = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);

  // Calculate next break time if breaks are enabled
  let nextBreakAt: string | undefined;
  if (sessionArgs.enable_breaks && sessionArgs.break_type) {
    const interval = sessionArgs.break_type === "pomodoro_25" ? 25 : 45;
    nextBreakAt = new Date(now.getTime() + interval * 60_000).toISOString();
  }

  const session: Session = {
    id,
    task: sessionArgs.task,
    done_criteria: sessionArgs.done_criteria,
    time_box_minutes: sessionArgs.time_box_minutes,
    intensity: sessionArgs.intensity ?? "medium",
    started_at: now.toISOString(),
    milestones: [],
    parked_count: 0,
    status: "active",
    // New fields
    energy_start: sessionArgs.energy_start,
    estimated_minutes: sessionArgs.estimated_minutes,
    template_id: sessionArgs.template_id,
    last_milestone_at: now.toISOString(), // Initialize for stuck detection
    next_break_at: nextBreakAt,
    break_type: sessionArgs.break_type,
  };

  await writeSession(cwd, session);

  const extras: string[] = [];
  if (session.template_id) extras.push(`Template: ${session.template_id}`);
  if (session.energy_start) extras.push(`Energy: ${session.energy_start}/5`);
  if (session.next_break_at) extras.push(`Break at: ${new Date(session.next_break_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  if (session.estimated_minutes && session.estimated_minutes !== session.time_box_minutes) {
    extras.push(`Estimate: ${session.estimated_minutes}min`);
  }

  return {
    content: [
      {
        type: "text",
        text: `Session started: "${sessionArgs.task}"` +
          `\nIntensity: ${session.intensity}` +
          `\nTime box: ${sessionArgs.time_box_minutes} minutes` +
          `\nDone criteria: ${sessionArgs.done_criteria.length}` +
          `${extras.length > 0 ? "\n" + extras.join("\n") : ""}` +
          `\n\n  ${sessionArgs.done_criteria.map((c) => `- ${c}`).join("\n  ")}`,
      },
    ],
  };
}
