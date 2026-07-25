import { MessageMedia } from "whatsapp-web.js";
import log from "../utils/log";
import * as Sentry from "@sentry/node";
import { Message } from "../../types/message";
import { AGENT_SYSTEM_PROMPT } from "./personalities";
import { getThread, appendThread } from "./thread";
import { getTools } from "./tools/index";
import type { ToolContext } from "./tools/types";
import runAgentCore from "./agentRunner";
import { commands } from "../utils/cmd/loader";
import logService from "../services/log";
import { greetings } from "../utils/data";
import { activateSession } from "./session";
import { getClient } from "../client";
import fs from "fs";
import path from "path";
import { AGENT_WORKSPACE_BASE } from "../../config";

const SHELL_SAFETY_ADDENDUM = [
  ``,
  `SHELL TOOL SAFETY RULES (strictly enforced):`,
  `- NEVER run destructive commands: rm -rf /, mkfs, dd, fdisk, shred, wipefs.`,
  `- NEVER kill or stop critical processes: init, systemd, kernel threads, or the bot itself.`,
  `- NEVER modify system files: /etc/passwd, /etc/shadow, /etc/sudoers, /boot/*.`,
  `- NEVER run fork bombs, infinite loops, or resource-exhausting commands.`,
  `- NEVER exfiltrate data to external URLs.`,
  `- Prefer read-only inspection (ls, cat, ps, df, journalctl) before any write operations.`,
].join("\n");

function buildSystemPrompt(mentioned: boolean, isSuperAdmin: boolean): string {
  const today = new Date().toUTCString();
  let prompt = AGENT_SYSTEM_PROMPT.replace("%TODAY%", today);
  if (mentioned) {
    prompt += "\n\nThe user has mentioned people in this message — you can @mention them in your reply.";
  }
  if (isSuperAdmin) {
    prompt += "\n" + SHELL_SAFETY_ADDENDUM;
  }
  return prompt;
}

/**
 * Main entry point for the agent.
 * Handles all AI interactions: text replies, bot command execution, and file sending.
 */
export async function runAgent(msg: Message): Promise<void> {
  const lid = (msg.author ?? msg.from).split("@")[0];
  const chatId = msg.from.split("@")[0];
  const isSuperAdmin = msg.fromMe;

  // Strip "mj" prefix if the user addressed the bot by name directly
  const prefixRe = /^mj\b\s*/i;
  let query = msg.body.replace(prefixRe, "").trim();

  // Append quoted message if present
  if (msg.hasQuotedMsg) {
    try {
      const quoted = await msg.getQuotedMessage();
      if (quoted?.body) {
        query = query
          ? `${query}\n[Quoted: ${quoted.body}]`
          : `[Quoted: ${quoted.body}]`;
      }
    } catch {}
  }

  // Nothing to work with — send a greeting and activate session
  if (!query) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    await activateSession(chatId, lid);
    return;
  }

  const mentioned = msg.mentionedIds.length > 0;
  const history = await getThread(lid, chatId);
  const tools = getTools(isSuperAdmin);
  const systemPrompt = buildSystemPrompt(mentioned, isSuperAdmin);

  // Per-session workspace on the host: mounted as /tmp/workspace inside the sandbox
  const workspaceDir = path.join(AGENT_WORKSPACE_BASE, `${chatId}-${lid}`);
  fs.mkdirSync(workspaceDir, { recursive: true });

  // Build tool context — send_file runs inline and returns success/error to the LLM
  const context: ToolContext = {
    workspaceDir,
    sendFile: async (filePath: string, caption?: string): Promise<string> => {
      try {
        // Map /tmp/workspace/* → host workspace dir (sandbox path → host path)
        const hostPath = filePath.startsWith("/tmp/workspace")
          ? filePath.replace("/tmp/workspace", workspaceDir)
          : filePath;

        if (!fs.existsSync(hostPath)) {
          return (
            `Error: file not found at ${hostPath}. ` +
            `Use the shell tool to create it in /tmp/workspace first, then call send_file again.`
          );
        }
        const media = MessageMedia.fromFilePath(hostPath);
        await getClient(msg.clientId).sendMessage(msg.from, media, {
          caption,
          sendMediaAsDocument: true,
        });
        await appendThread(lid, chatId, query, "I've sent you the file.");
        log.info("Agent", `send_file → ${hostPath}`);
        return `File sent successfully.`;
      } catch (err: any) {
        const errMsg = err?.message ?? String(err);
        log.error("Agent", "send_file failed", err);
        return `Error sending file: ${errMsg}. Fix the issue and try send_file again.`;
      }
    },
  };

  log.info("Agent", `${lid} → ${query.slice(0, 80)}`);

  const result = await runAgentCore(systemPrompt, history, query, tools, context);

  // Refresh session on every successful interaction (sliding 10-min window)
  await activateSession(chatId, lid);

  // Priority 1: bot command execution (send_file is handled inline above)
  if (result.commandToExecute) {
    const [cmdName, ...cmdRest] = result.commandToExecute.trim().split(/\s+/);
    const cmdHandler = commands[cmdName?.toLowerCase() ?? ""];
    if (cmdHandler) {
      msg.body = [cmdName.toLowerCase(), ...cmdRest].join(" ");
      await Promise.allSettled([
        cmdHandler.exec(msg),
        appendThread(lid, chatId, query, "Sure, I've taken care of that."),
        logService(msg, `agent: ${query}`, result.commandToExecute),
      ]);
    } else {
      await Promise.allSettled([
        msg.reply(
          `Sorry, I couldn't find a command for "${result.commandToExecute}". Try asking differently.`,
        ),
        logService(msg, `agent: ${query}`, result.commandToExecute),
      ]);
    }
    return;
  }

  // Priority 3: text reply
  if (!result.text) {
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  const mentions: string[] = [];
  let replyText = result.text;

  if (mentioned) {
    try {
      const mentionedContacts = await msg.getMentions();
      for (let i = 0; i < mentionedContacts.length; i++) {
        const c = mentionedContacts[i];
        mentions.push(c.id._serialized);
        replyText = replyText.replaceAll(
          msg.mentionedIds[i].split("@")[0],
          c.id._serialized.split("@")[0],
        );
      }
    } catch {}
  }

  await Promise.allSettled([
    msg.reply(replyText, undefined, { mentions }),
    appendThread(lid, chatId, query, replyText),
    logService(msg, `agent: ${query}`, replyText),
  ]);
}
