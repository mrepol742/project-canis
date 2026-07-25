import { commands } from "../../utils/cmd/loader";
import type { AgentTool } from "./types";

const MAX_OUTPUT = 2000;

export const listCommandsTool: AgentTool = {
  name: "list_commands",
  description:
    "List available bot commands with their descriptions, usage syntax, and required role.",
  parameters: {
    type: "object",
    properties: {
      role: {
        type: "string",
        description: "Filter by role. Omit or pass 'all' for every command.",
        enum: ["user", "admin", "super-admin", "all"],
      },
    },
  },
};

export function runListCommands(role = "all"): string {
  const result: Record<
    string,
    { description: string; usage: string; role: string }
  > = {};

  for (const [key, cmd] of Object.entries(commands)) {
    if (role !== "all" && cmd.role !== role) continue;
    result[key] = {
      description: cmd.description,
      usage: cmd.usage,
      role: cmd.role,
    };
  }

  return JSON.stringify(result).slice(0, MAX_OUTPUT);
}
