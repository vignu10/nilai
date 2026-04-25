---
name: focus-energy
description: "Track energy levels for patterns. Use at session start/end or to view stats."
argument-hint: "<start|end|stats|recommend> [--level <1-5>]"
user-invocable: true
---

Track energy levels to find patterns in your productivity. ADHD brains have fluctuating energy - understanding your patterns helps you schedule work effectively.

## Actions

- `start <1-5>`: Rate energy at session start (1=exhausted, 5=energized)
- `end <1-5>`: Rate energy at session end
- `stats`: Show energy patterns by time of day and task type
- `recommend`: Get energy-based recommendation for current time

## Energy Scale

1. Exhausted - Barely functioning
2. Low - Running on fumes
3. Medium - Baseline functioning
4. High - Sharp and focused
5. Energized - Peak performance

## Usage

1. Start session with energy: /focus-start task="..." energy_start=4
2. End session with energy: /focus-energy end --level=2
3. View stats: /focus-energy stats
4. Get recommendation: /focus-energy recommend

Call the `focus_energy` MCP tool with appropriate action and level.
