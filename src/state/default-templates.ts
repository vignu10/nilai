import type { SessionTemplate } from "./templates.js";
import { writeTemplates, readTemplates } from "./templates.js";

export const DEFAULT_TEMPLATES: SessionTemplate[] = [
  {
    id: "debug-standard",
    name: "Debug Session",
    description: "Standard debugging workflow",
    category: "debug",
    default_time_box_minutes: 45,
    default_intensity: "high",
    default_done_criteria: [
      "Root cause identified and documented",
      "Fix implemented and tested",
      "Regression tests pass",
      "Bug closed with reproduction steps",
    ],
    enable_break_reminders: false, // Focus flow is important when debugging
    break_interval_minutes: 45,
    enable_stuck_detection: true,
    stuck_threshold_minutes: 10,
    created_at: "2024-01-01T00:00:00Z",
    usage_count: 0,
  },
  {
    id: "code-review-quick",
    name: "Quick Code Review",
    description: "Fast code review session",
    category: "code_review",
    default_time_box_minutes: 30,
    default_intensity: "medium",
    default_done_criteria: [
      "All files reviewed",
      "Critical issues identified",
      "Comments added for improvements",
    ],
    enable_break_reminders: true,
    break_interval_minutes: 25,
    enable_stuck_detection: false,
    stuck_threshold_minutes: 15,
    created_at: "2024-01-01T00:00:00Z",
    usage_count: 0,
  },
  {
    id: "feature-development",
    name: "Feature Development",
    description: "Building new features",
    category: "feature",
    default_time_box_minutes: 90,
    default_intensity: "medium",
    default_done_criteria: [
      "Core functionality implemented",
      "Basic tests pass",
      "API endpoints work",
      "Documentation updated",
    ],
    enable_break_reminders: true,
    break_interval_minutes: 45,
    enable_stuck_detection: true,
    stuck_threshold_minutes: 20,
    created_at: "2024-01-01T00:00:00Z",
    usage_count: 0,
  },
];

export async function initializeDefaultTemplates(cwd: string): Promise<void> {
  const existing = await readTemplates(cwd);
  if (existing.length === 0) {
    await writeTemplates(cwd, DEFAULT_TEMPLATES);
  }
}
