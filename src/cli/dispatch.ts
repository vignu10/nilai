import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runTool } from "./run-tool.js";
import { handleFocusStart } from "../tools/focus_start.js";
import { handleFocusStatus } from "../tools/focus_status.js";
import { handleFocusCheck } from "../tools/focus_check.js";
import { handleFocusPark } from "../tools/focus_park.js";
import { handleFocusLog } from "../tools/focus_log.js";
import { handleFocusProgress } from "../tools/focus_progress.js";
import { handleFocusPulse } from "../tools/focus_pulse.js";
import { handleFocusEnd } from "../tools/focus_end.js";
import { handleFocusResume } from "../tools/focus_resume.js";
import { handleFocusListParked } from "../tools/focus_list_parked.js";
import { handleFocusQuick } from "../tools/focus_quick.js";
import { handleFocusSessions } from "../tools/focus_sessions.js";
import { handleFocusScopeExpand } from "../tools/focus_scope_expand.js";
import { handleFocusRecent } from "../tools/focus_recent.js";
import { handleFocusDowntime } from "../tools/focus_downtime.js";
import { handleFocusDowntimeEnd } from "../tools/focus_downtime_end.js";
import { handleFocusDayStart } from "../tools/focus_day_start.js";
import { handleFocusDayEnd } from "../tools/focus_day_end.js";
import { handleFocusDayStatus } from "../tools/focus_day_status.js";
import { handleFocusIntensity } from "../tools/focus_intensity.js";
import { handleFocusUnpark } from "../tools/focus_unpark.js";
import { handleFocusBreak } from "../tools/focus_break.js";
import { handleFocusStuck } from "../tools/focus_stuck.js";
import { handleFocusTemplate } from "../tools/focus_template.js";
import { handleFocusEnergy } from "../tools/focus_energy.js";
import { handleFocusCapture } from "../tools/focus_capture.js";
import { handleFocusCalibration } from "../tools/focus_calibration.js";

const cwd = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

function positional(): string {
  return process.argv
    .slice(3)
    .filter((a) => !a.startsWith("--"))
    .join(" ");
}

function flag(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function flagMulti(name: string): string[] {
  const values: string[] = [];
  let i = process.argv.indexOf(`--${name}`);
  while (i !== -1) {
    i++;
    while (i < process.argv.length && !process.argv[i].startsWith("--")) {
      values.push(process.argv[i]);
      i++;
    }
    i = process.argv.indexOf(`--${name}`, i);
  }
  return values;
}

export async function dispatch(cmd: string): Promise<void> {
  switch (cmd) {
    case "start": {
      const task = positional();
      const criteria = flagMulti("criteria");
      const time = flag("time");
      const intensity = flag("intensity");
      if (!task) {
        console.log("Usage: nilai start <task> --criteria <c1> <c2> ... --time <min> [--intensity low|medium|high]");
        process.exit(1);
      }
      await runTool(
        handleFocusStart(cwd, {
          task,
          done_criteria: criteria.length > 0 ? criteria : ["Task completed"],
          time_box_minutes: time ? parseInt(time, 10) : 25,
          ...(intensity ? { intensity: intensity as "low" | "medium" | "high" } : {}),
        }),
      );
      break;
    }
    case "quick": {
      const task = positional();
      const time = flag("time");
      if (!task) {
        console.log("Usage: nilai quick <task> [--time <min>]");
        process.exit(1);
      }
      await runTool(handleFocusQuick(cwd, { task, ...(time ? { time_box_minutes: parseInt(time, 10) } : {}) }));
      break;
    }
    case "status":
      await runTool(handleFocusStatus(cwd));
      break;
    case "end":
      await runTool(handleFocusEnd(cwd));
      break;
    case "resume": {
      const id = positional();
      if (!id) {
        console.log("Usage: nilai resume <session-id>");
        process.exit(1);
      }
      await runTool(handleFocusResume(cwd, { session_id: id }));
      break;
    }
    case "check": {
      const action = positional();
      if (!action) {
        console.log("Usage: nilai check <intended action>");
        process.exit(1);
      }
      await runTool(handleFocusCheck(cwd, { intended_action: action }));
      break;
    }
    case "park": {
      const idea = positional();
      const why = flag("why");
      if (!idea) {
        console.log("Usage: nilai park <idea> [--why <reason>]");
        process.exit(1);
      }
      await runTool(handleFocusPark(cwd, { idea, ...(why ? { why_interesting: why } : {}) }));
      break;
    }
    case "log": {
      const milestone = positional();
      if (!milestone) {
        console.log("Usage: nilai log <milestone>");
        process.exit(1);
      }
      await runTool(handleFocusLog(cwd, { milestone }));
      break;
    }
    case "progress":
      await runTool(handleFocusProgress(cwd));
      break;
    case "pulse":
      await runTool(handleFocusPulse(cwd));
      break;
    case "scope-expand": {
      const addition = positional();
      const extra = flag("extra-minutes");
      if (!addition) {
        console.log("Usage: nilai scope-expand <addition> [--extra-minutes <min>]");
        process.exit(1);
      }
      await runTool(handleFocusScopeExpand(cwd, { addition, ...(extra ? { extra_minutes: parseInt(extra, 10) } : {}) }));
      break;
    }
    case "sessions":
      await runTool(handleFocusSessions(cwd));
      break;
    case "recent":
      await runTool(handleFocusRecent(cwd));
      break;
    case "list-parked":
      await runTool(handleFocusListParked(cwd));
      break;
    case "skills":
      listSkills();
      break;
    case "downtime": {
      const type = flag("type") as "break" | "maintenance" | "awaiting" | undefined;
      const max = flag("max-minutes");
      await runTool(
        handleFocusDowntime(cwd, {
          ...(type && { type }),
          ...(max && { max_minutes: parseInt(max, 10) }),
        }),
      );
      break;
    }
    case "downtime-end":
      await runTool(handleFocusDowntimeEnd(cwd));
      break;
    case "day-start":
      await runTool(handleFocusDayStart(cwd));
      break;
    case "day-end":
      await runTool(handleFocusDayEnd(cwd));
      break;
    case "day-status":
      await runTool(handleFocusDayStatus(cwd));
      break;
    case "intensity": {
      const intensity = positional();
      if (!intensity || !["low", "medium", "high"].includes(intensity)) {
        console.log("Usage: nilai intensity <low|medium|high>");
        process.exit(1);
      }
      await runTool(
        handleFocusIntensity(cwd, { intensity: intensity as "low" | "medium" | "high" }),
      );
      break;
    }
    case "unpark": {
      const index = positional();
      await runTool(
        handleFocusUnpark(cwd, {
          ...(index && { index: parseInt(index, 10) }),
        }),
      );
      break;
    }
    case "break": {
      const duration = flag("duration-minutes");
      const type = flag("type") as "pomodoro_25" | "pomodoro_45" | undefined;
      await runTool(
        handleFocusBreak(cwd, {
          ...(duration && { duration_minutes: parseInt(duration, 10) }),
          ...(type && { type }),
        }),
      );
      break;
    }
    case "stuck": {
      const response = positional();
      if (!response || !["investigate", "park", "split"].includes(response)) {
        console.log("Usage: nilai stuck <investigate|park|split>");
        process.exit(1);
      }
      await runTool(
        handleFocusStuck(cwd, { response: response as "investigate" | "park" | "split" }),
      );
      break;
    }
    case "template": {
      const action = positional();
      const id = flag("id");
      if (!action || !["list", "create", "use", "delete", "init"].includes(action)) {
        console.log("Usage: nilai template <list|create|use|delete|init> [--id <template-id>]");
        process.exit(1);
      }
      await runTool(
        handleFocusTemplate(cwd, {
          action: action as "list" | "create" | "use" | "delete" | "init",
          ...(id && { template_id: id }),
        }),
      );
      break;
    }
    case "energy": {
      const action = positional();
      const level = flag("level");
      if (!action || !["start", "end", "stats", "recommend"].includes(action)) {
        console.log("Usage: nilai energy <start|end|stats|recommend> [--level <1-5>]");
        process.exit(1);
      }
      await runTool(
        handleFocusEnergy(cwd, {
          action: action as "start" | "end" | "stats" | "recommend",
          ...(level && { level: parseInt(level, 10) }),
        }),
      );
      break;
    }
    case "capture": {
      const thought = positional();
      if (!thought) {
        console.log("Usage: nilai capture <thought>");
        process.exit(1);
      }
      await runTool(handleFocusCapture(cwd, { thought }));
      break;
    }
    case "calibration": {
      const action = positional();
      if (!action || !["stats", "suggest"].includes(action)) {
        console.log("Usage: nilai calibration <stats|suggest>");
        process.exit(1);
      }
      await runTool(
        handleFocusCalibration(cwd, { action: action as "stats" | "suggest" }),
      );
      break;
    }
    default:
      console.log(`Unknown command: ${cmd}`);
      process.exit(1);
  }
}

function listSkills(): void {
  const skillsDir = resolve(cwd, ".claude", "skills");
  const sourceDir = resolve(__dirname, "..", "source", "skills");

  const dir = existsSync(skillsDir) ? skillsDir : sourceDir;

  if (!existsSync(dir)) {
    console.log("No skills installed. Run `nilai init` to install.");
    return;
  }

  const entries = readdirSync(dir).filter((e) => {
    try {
      return readFileSync(resolve(dir, e, "SKILL.md"), "utf-8");
    } catch {
      return false;
    }
  });

  if (entries.length === 0) {
    console.log("No skills found.");
    return;
  }

  const rows: { name: string; description: string }[] = [];

  for (const entry of entries) {
    const content = readFileSync(resolve(dir, entry, "SKILL.md"), "utf-8");
    const descMatch = content.match(/^description:\s*"(.+?)"/m) || content.match(/^description:\s*(.+)$/m);
    rows.push({
      name: entry,
      description: descMatch ? descMatch[1].trim() : "",
    });
  }

  const maxName = Math.max(...rows.map((r) => r.name.length));
  console.log("Nilai slash commands:\n");
  for (const row of rows) {
    const padded = row.name.padEnd(maxName);
    console.log(`  /${padded}  ${row.description}`);
  }
  console.log("\nRun any command in Claude Code, or use the CLI equivalent: nilai <command>");
}
