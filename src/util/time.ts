export function formatElapsed(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  return formatDuration(ms);
}

export function formatRemaining(
  startedAt: string,
  timeBoxMinutes: number,
): number {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  const budget = timeBoxMinutes * 60_000;
  return Math.max(0, Math.round((budget - elapsed) / 60_000));
}

export function elapsedMinutes(startedAt: string): number {
  const ms = Date.now() - new Date(startedAt).getTime();
  return Math.round(ms / 60_000);
}

export type Intensity = "low" | "medium" | "high";

export function getNudge(
  startedAt: string,
  timeBoxMinutes: number,
  milestoneCount: number,
  intensity: Intensity = "medium",
): string {
  const elapsed = elapsedMinutes(startedAt);
  const remaining = formatRemaining(startedAt, timeBoxMinutes);
  const over = elapsed - timeBoxMinutes;

  if (over > 0) {
    if (intensity === "low" && over <= timeBoxMinutes * 0.5) {
      return `${elapsed} of ${timeBoxMinutes} minutes used. ${milestoneCount} milestone${milestoneCount !== 1 ? "s" : ""} logged.`;
    }
    return `Session is ${over} minute${over !== 1 ? "s" : ""} over the ${timeBoxMinutes}min time box. Consider calling focus_end.`;
  }

  const nearThreshold = intensity === "high" ? 0.25 : 0.1;
  if (remaining <= timeBoxMinutes * nearThreshold) {
    return `Approaching time box limit. ${remaining} minute${remaining !== 1 ? "s" : ""} remaining.`;
  }

  const stallThreshold = intensity === "low" ? 0.5 : intensity === "high" ? 0.15 : 0.3;
  if (milestoneCount === 0 && elapsed > timeBoxMinutes * stallThreshold) {
    return `${elapsed} of ${timeBoxMinutes} minutes used with no milestones logged. Are you on track?`;
  }

  return `${elapsed} of ${timeBoxMinutes} minutes used. ${milestoneCount} milestone${milestoneCount !== 1 ? "s" : ""} logged.`;
}

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 60) return `${totalMin}m`;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
