export type DaySession = {
  session_id: string;
  type: "focused" | "downtime";
  started_at: string;
  ended_at?: string;
  duration_minutes: number;
  task?: string;
  downtime_type?: string;
};

export type Day = {
  date: string;
  started_at: string;
  ended_at?: string;
  sessions: DaySession[];
  total_focused_minutes: number;
  total_downtime_minutes: number;
  total_idle_minutes: number;
  current_idle_streak_minutes: number;
  auto_started: boolean;
};

import { readFile, writeFile, unlink } from "node:fs/promises";
import { dayPath, historyDir, ensureFocusDirs } from "./paths.js";
import type { Session } from "./session.js";

export async function readDay(cwd: string): Promise<Day | null> {
  const path = dayPath(cwd);
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as Day;
  } catch {
    return null;
  }
}

export async function writeDay(cwd: string, day: Day): Promise<void> {
  ensureFocusDirs(cwd);
  const path = dayPath(cwd);
  await writeFile(path, JSON.stringify(day, null, 2), "utf-8");
}

export async function deleteDay(cwd: string): Promise<void> {
  const path = dayPath(cwd);
  try {
    await unlink(path);
  } catch {
    // already gone
  }
}

export async function startDay(cwd: string, autoStarted = false): Promise<Day> {
  const existing = await readDay(cwd);
  if (existing) {
    throw new Error("Day tracking already active. End current day with focus_day_end.");
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);

  const day: Day = {
    date,
    started_at: now.toISOString(),
    sessions: [],
    total_focused_minutes: 0,
    total_downtime_minutes: 0,
    total_idle_minutes: 0,
    current_idle_streak_minutes: 0,
    auto_started: autoStarted,
  };

  await writeDay(cwd, day);
  return day;
}

export async function endDay(cwd: string): Promise<Day> {
  let day = await readDay(cwd);
  if (!day) {
    throw new Error("No active day tracking. Start a day with focus_day_start.");
  }

  day.ended_at = new Date().toISOString();
  day = updateIdleTime(day);
  await archiveDay(cwd, day);
  await deleteDay(cwd);
  return day;
}

async function archiveDay(cwd: string, day: Day): Promise<void> {
  const path = `${historyDir(cwd)}/${day.date}.json`;
  await writeFile(path, JSON.stringify(day, null, 2), "utf-8");
}

export async function addSessionToDay(cwd: string, session: Session): Promise<void> {
  let day = await readDay(cwd);
  if (!day || day.ended_at) {
    return;
  }

  const now = new Date();
  const startedAt = new Date(session.started_at);
  const endedAt = session.ended_at ? new Date(session.ended_at) : now;
  const duration = (endedAt.getTime() - startedAt.getTime()) / 60_000;

  const daySession: DaySession = {
    session_id: session.id,
    type: session.status === "downtime" ? "downtime" : "focused",
    started_at: session.started_at,
    ended_at: session.ended_at,
    duration_minutes: Math.round(duration),
    ...(session.status !== "downtime" && { task: session.task }),
    ...(session.status === "downtime" && { downtime_type: session.downtime_type }),
  };

  day.sessions.push(daySession);

  if (daySession.type === "focused") {
    day.total_focused_minutes += daySession.duration_minutes;
  } else {
    day.total_downtime_minutes += daySession.duration_minutes;
  }

  day = updateIdleTime(day);
  await writeDay(cwd, day);
}

export function updateIdleTime(day: Day): Day {
  const updated = { ...day };

  if (updated.sessions.length === 0) {
    updated.current_idle_streak_minutes = 0;
    return updated;
  }

  let totalIdle = 0;
  const sessions = [...updated.sessions].sort((a, b) =>
    new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  const dayStart = new Date(updated.started_at);
  const lastSessionEnd = sessions[sessions.length - 1].ended_at
    ? new Date(sessions[sessions.length - 1].ended_at!)
    : new Date();

  for (let i = 0; i < sessions.length; i++) {
    const currentStart = new Date(sessions[i].started_at);
    if (i === 0) {
      totalIdle += (currentStart.getTime() - dayStart.getTime()) / 60_000;
    } else {
      const prevEnd = sessions[i - 1].ended_at
        ? new Date(sessions[i - 1].ended_at!)
        : new Date(sessions[i - 1].started_at);
      totalIdle += (currentStart.getTime() - prevEnd.getTime()) / 60_000;
    }
  }

  updated.total_idle_minutes = Math.max(0, Math.round(totalIdle));

  const now = new Date();
  updated.current_idle_streak_minutes = Math.max(
    0,
    Math.round((now.getTime() - lastSessionEnd.getTime()) / 60_000)
  );

  return updated;
}
