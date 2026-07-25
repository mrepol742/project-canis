import type { AgentTool } from "./types";

export const sendFileTool: AgentTool = {
  name: "send_file",
  description:
    "Send a local file to the user in WhatsApp. " +
    "Use this after creating files with the shell tool. " +
    "Supports any file type: HTML, zip, images, PDFs, scripts, etc.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute path to the file to send, e.g. /tmp/mj-workspace/index.html",
      },
      caption: {
        type: "string",
        description: "Optional caption shown under the file in WhatsApp",
      },
    },
    required: ["path"],
  },
};
