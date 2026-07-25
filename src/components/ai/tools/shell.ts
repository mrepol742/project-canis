import { exec, spawn } from "child_process";
import util from "util";
import fs from "fs";
import { EXEC_SHELL, AGENT_SANDBOX } from "../../../config";
import type { AgentTool } from "./types";

const execPromise = util.promisify(exec);
const MAX_OUTPUT = 2000;
const TIMEOUT_MS = 30_000;

export const shellTool: AgentTool = {
  name: "shell",
  description:
    "Execute a shell command in an isolated sandbox environment. " +
    "Your working directory is /tmp/workspace — all files you create go here. " +
    "Use send_file to deliver a file from /tmp/workspace to the user. " +
    "Network access is available (you can install packages with npm, pip, etc.).",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          "The shell command to run. Example: mkdir -p /tmp/workspace && cat > /tmp/workspace/index.html << 'EOF'\\n<html>...</html>\\nEOF",
      },
    },
    required: ["command"],
  },
};

function collectOutput(stdout: string, stderr: string): string {
  const parts = [stdout.trim(), stderr.trim() ? `STDERR: ${stderr.trim()}` : ""].filter(Boolean);
  return (parts.join("\n") || "(no output)").slice(0, MAX_OUTPUT);
}

/**
 * Run command inside a bwrap sandbox:
 * - Host filesystem is mounted read-only
 * - /tmp is a fresh tmpfs (isolated from host /tmp)
 * - workspaceDir is bind-mounted read-write as /tmp/workspace
 * - Network is kept (internet access works)
 * - PID, IPC, and UTS namespaces are isolated
 */
async function runSandboxed(command: string, workspaceDir: string): Promise<string> {
  return new Promise((resolve) => {
    const bwrapArgs = [
      // Host root read-only
      "--ro-bind", "/", "/",
      // Essential pseudo-filesystems
      "--dev", "/dev",
      "--proc", "/proc",
      // Fresh tmpfs for isolation
      "--tmpfs", "/tmp",
      "--tmpfs", "/root",
      "--tmpfs", "/run",
      // Per-session workspace read-write
      "--bind", workspaceDir, "/tmp/workspace",
      // Namespace isolation (keep network for package installs)
      "--unshare-pid",
      "--unshare-uts",
      "--unshare-ipc",
      "--new-session",
      "--die-with-parent",
      // Execute
      EXEC_SHELL, "-c",
      // timeout wrapper ensures hard kill at 28s even if process ignores SIGTERM
      `cd /tmp/workspace && timeout -k 1 28 ${command}`,
    ];

    const proc = spawn("bwrap", bwrapArgs, {
      timeout: TIMEOUT_MS,
      killSignal: "SIGKILL",
    });

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", () => resolve(collectOutput(stdout, stderr)));
    proc.on("error", (err: Error) => resolve(`Sandbox error: ${err.message}`));
  });
}

/**
 * Direct execution fallback (used when AGENT_SANDBOX=false).
 * Less isolated but still CWD-confined to the workspace.
 */
async function runDirect(command: string, workspaceDir: string): Promise<string> {
  try {
    const { stdout, stderr } = await execPromise(command, {
      timeout: TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
      shell: EXEC_SHELL,
      cwd: workspaceDir,
    });
    return collectOutput(stdout, stderr);
  } catch (err: any) {
    const out = [err.stdout?.trim() ?? "", err.stderr?.trim() ?? err.message]
      .filter(Boolean)
      .join("\n");
    return out.slice(0, MAX_OUTPUT);
  }
}

export async function runShell(command: string, workspaceDir: string): Promise<string> {
  if (!command.trim()) return "No command provided.";
  fs.mkdirSync(workspaceDir, { recursive: true });
  return AGENT_SANDBOX ? runSandboxed(command, workspaceDir) : runDirect(command, workspaceDir);
}
