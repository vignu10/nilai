import type { SessionTemplate } from "../state/templates.js";
import { readTemplates, writeTemplates, getTemplate, saveTemplate, deleteTemplate, incrementTemplateUsage } from "../state/templates.js";
import { initializeDefaultTemplates } from "../state/default-templates.js";

export async function handleFocusTemplate(
  cwd: string,
  args: {
    action: "list" | "create" | "use" | "delete" | "init";
    template_id?: string;
    template?: Partial<SessionTemplate>;
  },
): Promise<{ content: { type: "text"; text: string }[] }> {
  switch (args.action) {
    case "init":
      await initializeDefaultTemplates(cwd);
      return { content: [{ type: "text", text: "Default templates initialized." }] };

    case "list":
      return await listTemplates(cwd);

    case "create":
      if (!args.template || !args.template.id || !args.template.name) {
        return { content: [{ type: "text", text: "Template requires id and name." }] };
      }
      return await createTemplate(cwd, args.template as SessionTemplate);

    case "use":
      if (!args.template_id) {
        return { content: [{ type: "text", text: "Template ID required." }] };
      }
      return await useTemplate(cwd, args.template_id);

    case "delete":
      if (!args.template_id) {
        return { content: [{ type: "text", text: "Template ID required." }] };
      }
      await deleteTemplate(cwd, args.template_id);
      return { content: [{ type: "text", text: `Template ${args.template_id} deleted.` }] };

    default:
      return { content: [{ type: "text", text: "Unknown action. Use: list, create, use, delete, init" }] };
  }
}

async function listTemplates(cwd: string) {
  const templates = await readTemplates(cwd);
  if (templates.length === 0) {
    return {
      content: [{
        type: "text",
        text: "No templates found. Run 'nilai template init' to create defaults.",
      }],
    };
  }

  const lines = templates.map((t) =>
    `- ${t.id}: ${t.name} (${t.category})\n  ${t.description}\n  Time: ${t.default_time_box_minutes}min, Intensity: ${t.default_intensity}\n  Criteria: ${t.default_done_criteria.length} items, Used: ${t.usage_count} times`
  );

  return { content: [{ type: "text", text: "Templates:\n" + lines.join("\n\n") }] };
}

async function createTemplate(cwd: string, template: SessionTemplate) {
  await saveTemplate(cwd, template);
  return {
    content: [{
      type: "text",
      text: `Template created: ${template.id}\nUse with: /focus-start with template_id="${template.id}"`,
    }],
  };
}

async function useTemplate(cwd: string, templateId: string) {
  const template = await getTemplate(cwd, templateId);
  if (!template) {
    return { content: [{ type: "text", text: "Template not found." }] };
  }

  // Increment usage count
  await incrementTemplateUsage(cwd, templateId);

  return {
    content: [{
      type: "text",
      text: `Template loaded: ${template.name}\n` +
        `Description: ${template.description}\n` +
        `Time box: ${template.default_time_box_minutes}min\n` +
        `Intensity: ${template.default_intensity}\n` +
        `Done criteria:\n  ${template.default_done_criteria.join("\n  ")}\n\n` +
        `Start session with: /focus-start task="..." template_id="${template.id}"`,
    }],
  };
}
