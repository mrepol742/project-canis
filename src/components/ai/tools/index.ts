import { AGENT_SHELL_ENABLED } from "../../../config";
import { shellTool, runShell } from "./shell";
import { userInfoTool, runGetUser } from "./userInfo";
import { groupInfoTool, runGetGroup } from "./groupInfo";
import { botStatsTool, runBotStats } from "./botStats";
import { listCommandsTool, runListCommands } from "./listCommands";
import { runCommandTool } from "./botCommand";
import { browserTool, runBrowser } from "./browser";
import { sendFileTool } from "./sendFile";
export type { AgentTool } from "./types";
import type { ToolContext } from "./types";

export function getTools(_isSuperAdmin: boolean) {
  const tools = [
    userInfoTool,
    groupInfoTool,
    botStatsTool,
    listCommandsTool,
    runCommandTool,
    browserTool,
    sendFileTool,
  ];
  if (AGENT_SHELL_ENABLED) tools.push(shellTool);
  return tools;
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context?: ToolContext,
): Promise<string> {
  switch (name) {
    case "shell":
      return runShell(String(args.command ?? ""), context?.workspaceDir ?? "/tmp/mj-workspace");
    case "get_user":
      return runGetUser(String(args.lid ?? ""));
    case "get_group":
      return runGetGroup(String(args.gid ?? ""));
    case "bot_stats":
      return runBotStats();
    case "list_commands":
      return runListCommands(String(args.role ?? "all"));
    case "run_command":
      // Intercepted upstream in agentRunner before reaching here
      return "Command dispatched.";
    case "send_file":
      if (!context?.sendFile) return "File sending is not available in this context.";
      return context.sendFile(
        String(args.path ?? "").trim(),
        args.caption !== undefined ? String(args.caption) : undefined,
      );
    case "browser":
      return runBrowser(String(args.input ?? ""));
    default:
      return `Unknown tool: ${name}`;
  }
}
