import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { handleFocusStart } from "./focus_start.js";
import { handleFocusStatus } from "./focus_status.js";
import { handleFocusCheck } from "./focus_check.js";
import { handleFocusPark } from "./focus_park.js";
import { handleFocusLog } from "./focus_log.js";
import { handleFocusProgress } from "./focus_progress.js";
import { handleFocusPulse } from "./focus_pulse.js";
import { handleFocusEnd } from "./focus_end.js";
import { handleFocusResume } from "./focus_resume.js";
import { handleFocusListParked } from "./focus_list_parked.js";

const cwd = process.cwd();

export function registerAllTools(server: McpServer): void {
  server.tool(
    "focus_start",
    "Start a focused work session. Call this before any work begins — if no session is active, ask the user for a concrete task, 1-5 done criteria, and a time box in minutes. Rejects vague tasks (e.g. 'improve X', 'look into Y'). Push back and ask for specificity.",
    {
      task: z.string().describe("One concrete task. Must be specific — not 'improve X' or 'explore Y'."),
      done_criteria: z.array(z.string()).min(1).max(5).describe("1-5 verifiable conditions. Each must describe an observable outcome."),
      time_box_minutes: z.number().int().min(5).max(480).describe("Time budget in minutes. 5-480."),
      intensity: z.enum(["low", "medium", "high"]).optional().describe("ADHD guardrail strength. low=permissive, medium=default, high=strict blocks. Defaults to medium."),
    },
    async (args) => handleFocusStart(cwd, args),
  );

  server.tool(
    "focus_status",
    "Returns the current session state: task, elapsed time, milestones, parked count, done criteria. Call this before any state-changing action to check if a session is active.",
    {},
    async () => handleFocusStatus(cwd),
  );

  server.tool(
    "focus_check",
    "Check whether an intended action is in scope. Returns the current task and done criteria alongside the intended action so you can judge alignment. If off-scope, propose focus_park rather than acting. Call before any non-continuation action.",
    {
      intended_action: z.string().describe("What the user is about to do."),
    },
    async (args) => handleFocusCheck(cwd, args),
  );

  server.tool(
    "focus_park",
    "Park a tangential idea to LATER.md. Use this when the user mentions something interesting but off-task ('while we're at it', 'also', 'oh and'). Say 'I'll park that' and call this. Captures the impulse without acting on it.",
    {
      idea: z.string().describe("The tangential idea to park."),
      why_interesting: z.string().optional().describe("Why it's interesting — optional context for later."),
    },
    async (args) => handleFocusPark(cwd, args),
  );

  server.tool(
    "focus_log",
    "Log a verifiable milestone. Only call at observable state changes — file created, test passing, function implemented. Not for felt-progress moments. Milestones should be past-tense and specific.",
    {
      milestone: z.string().describe("Past-tense description of an observable state change. At least 3 words."),
    },
    async (args) => handleFocusLog(cwd, args),
  );

  server.tool(
    "focus_progress",
    "Returns a checklist of done criteria (with matched milestones checked off) and all logged milestones. Use to assess progress toward the session goal.",
    {},
    async () => handleFocusProgress(cwd),
  );

  server.tool(
    "focus_pulse",
    "Check time usage: elapsed vs budget, with a nudge if over time, near the limit, or stalling. Surface warnings matter-of-factly.",
    {},
    async () => handleFocusPulse(cwd),
  );

  server.tool(
    "focus_end",
    "End the current session and generate a retrospective. Call when the user is done or criteria are met. Presents the retro without editorializing — no celebration, no coaching.",
    {},
    async () => handleFocusEnd(cwd),
  );

  server.tool(
    "focus_resume",
    "Reactivate an archived session. Creates a new session with the same task and criteria, carries over milestones, restarts the timer. Use when the user wants to continue previous work.",
    {
      session_id: z.string().describe("ID of the archived session to resume (YYYYMMDD-HHMMSS format)."),
    },
    async (args) => handleFocusResume(cwd, args),
  );

  server.tool(
    "focus_list_parked",
    "Returns all parked ideas from LATER.md. Use when the user wants to review parked items.",
    {},
    async () => handleFocusListParked(cwd),
  );
}
