---
name: focus-calibration
description: "View time estimation accuracy over time. Use to improve planning."
argument-hint: "<stats|suggest>"
user-invocable: true
---

View time estimation accuracy statistics. ADHD brains often struggle with time estimation - calibration data helps you learn your actual velocity.

## Actions

- `stats`: Show estimation error trends by task type and intensity
- `suggest`: Get a time estimate suggestion based on historical data

## Stats Include

- Average error in minutes and percentage
- Bias direction (underestimate/overestimate/accurate)
- Error by task type (debug, feature, code review, etc.)
- Trend: are you getting better or worse over time?

## Usage

1. Start session with estimate: /focus-start task="..." estimated_minutes=30
2. End session to record actual time
3. View stats: /focus-calibration stats
4. Get suggestion: /focus-calibration suggest

## Tips

- Track estimates for at least 3 sessions to see patterns
- Use `suggest` before starting a task to get a data-driven estimate
- Review stats weekly to improve your planning accuracy

Call the `focus_calibration` MCP tool with appropriate action.
