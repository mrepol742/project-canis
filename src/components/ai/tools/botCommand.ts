import type { AgentTool } from "./types";

export const runCommandTool: AgentTool = {
  name: "run_command",
  description:
    "Execute a bot command to fulfill a user's request. " +
    "The command output is delivered directly to the user — do NOT repeat or describe what you ran in your text reply.",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          "The full command string with arguments, e.g. 'play despacito', 'joke', 'wiki quantum physics'",
      },
    },
    required: ["command"],
  },
};
