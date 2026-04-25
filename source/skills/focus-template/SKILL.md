---
name: focus-template
description: "Manage or use session templates. Use to skip setup friction for common patterns."
argument-hint: "<list|create|use|delete|init> [--id <template-id>]"
user-invocable: true
---

Manage session templates for common workflows. Templates pre-fill session settings to reduce setup friction.

## Actions

- `list`: Show available templates with their configurations
- `use <id>`: Load a template's defaults for the next session
- `create`: Create a new template (requires template data)
- `delete <id>`: Remove a template
- `init`: Initialize default templates

## Default Templates

- `debug-standard`: Debug sessions (45min, high intensity, no breaks, 10min stuck threshold)
- `code-review-quick`: Quick code reviews (30min, medium intensity, 25min breaks)
- `feature-development`: Building features (90min, medium intensity, 45min breaks, 20min stuck threshold)

## Usage

1. List templates: /focus-template list
2. Use template: /focus-template use debug-standard
3. Start session with template: /focus-start task="..." template_id="debug-standard"

Call the `focus_template` MCP tool with appropriate action.
