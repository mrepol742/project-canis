import { MessageContent, MessageMedia, MessageSendOptions } from "whatsapp-web.js";
import log from "../utils/log";
import * as Sentry from "@sentry/node";
import { Message } from "../../types/message";
import { AGENT_SYSTEM_PROMPT } from "./personalities";
import { getThread, appendThread } from "./thread";
import { getTools } from "./tools/index";
import type { ToolContext } from "./tools/types";
import runAgentCore, { type ImageData, type ToolLogEntry } from "./agentRunner";
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

// First tool call — shown immediately to the user so they know something's happening
const FIRST_TOOL_STATUS: Record<string, string[]> = {
  browser:       ["searching... 🔍", "lemme look that up 👀", "googling real quick 🌐", "on it, checking the web 🔍"],
  shell:         ["running that... ⚙️", "executing... give me a sec 💻", "on it ⚙️"],
  run_command:   ["on it 👌", "doing that now", "got it, running that"],
  send_file:     ["preparing that file 📁", "getting that ready for you 📂"],
  get_user:      ["looking them up...", "checking that number 👤"],
  get_group:     ["fetching group info...", "pulling that up 📋"],
  list_commands: [],  // fast op, stay silent
  bot_stats:     [],  // fast op, stay silent
};

// Follow-up status when the agent retries or uses another tool in the same turn
const FOLLOWUP_TOOL_STATUS: Record<string, string[]> = {
  browser: ["still looking... 🔍", "trying another source", "digging deeper 🔎"],
  shell:   ["running another step... ⚙️", "almost there 💻"],
};

// Generic fallbacks
const GENERIC_FIRST = ["hold on 👀", "one sec...", "lemme check", "gimme a moment 🔍"];

// Error replies — varied so it doesn't feel robotic
const ERROR_REPLIES = [
  "something went wrong on my end, try again?",
  "ugh, ran into an issue. try again 😅",
  "that one broke on me, sorry. try again",
  "hit a snag, try again in a bit",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

function buildToolSummary(toolLog: ToolLogEntry[]): string {
  if (!toolLog.length) return "";
  const lines = toolLog.map((t) => {
    const argsStr = Object.values(t.args)
      .map((v) => String(v))
      .join(", ")
      .slice(0, 80);
    return `• ${t.name}(${argsStr}) → ${t.result.slice(0, 200)}`;
  });
  return `[Tools used this turn:\n${lines.join("\n")}]\n\n`;
}

/**
 * Main entry point for the agent.
 * Handles all AI interactions: text replies, bot command execution, and file sending.
 */
export async function runAgent(msg: Message): Promise<void> {
  const lid = (msg.author ?? msg.from).split("@")[0];
  const chatId = msg.from.split("@")[0];
  const isSuperAdmin = msg.fromMe;

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

  // Download image if present — passed to LLM as vision input
  let imageData: ImageData | undefined;
  if (msg.hasMedia) {
    try {
      const media = await msg.downloadMedia();
      if (media?.data && media.mimetype.startsWith("image/")) {
        imageData = { data: media.data, mimetype: media.mimetype };
      }
    } catch {}
  }

  // Nothing to work with — send a greeting and activate session
  if (!query && !imageData) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    await activateSession(chatId, lid);
    return;
  }

  const mentioned = msg.mentionedIds.length > 0;
  const history = await getThread(lid, chatId);
  const tools = getTools(isSuperAdmin);
  const systemPrompt = buildSystemPrompt(mentioned, isSuperAdmin);

  const workspaceDir = path.join(AGENT_WORKSPACE_BASE, `${chatId}-${lid}`);
  fs.mkdirSync(workspaceDir, { recursive: true });

  const context: ToolContext = {
    workspaceDir,

    sendFile: async (filePath: string, caption?: string): Promise<string> => {
      try {
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
        await appendThread(lid, chatId, threadQuery, "I've sent you the file.");
        log.info("Agent", `send_file → ${hostPath}`);
        return `File sent successfully.`;
      } catch (err: any) {
        const errMsg = err?.message ?? String(err);
        log.error("Agent", "send_file failed", err);
        return `Error sending file: ${errMsg}. Fix the issue and try send_file again.`;
      }
    },

    onToolCall: async (toolName: string, isFirst: boolean): Promise<void> => {
      if (isFirst) {
        const pool = FIRST_TOOL_STATUS[toolName];
        if (pool !== undefined && pool.length === 0) return; // silent tool
        const text = pool?.length ? pick(pool) : pick(GENERIC_FIRST);
        await msg.reply(text);
      } else {
        const pool = FOLLOWUP_TOOL_STATUS[toolName];
        if (pool?.length) await msg.reply(pick(pool));
      }
    },
  };

  // Thread query: note if an image was attached so the LLM remembers it next turn
  const threadQuery = imageData ? (query ? `[Image] ${query}` : "[Image]") : query;

  log.info("Agent", `${lid} → ${query.slice(0, 80)}`);

  const result = await runAgentCore(systemPrompt, history, query || "[Describe this image]", tools, context, undefined, imageData);

  await activateSession(chatId, lid);

  // Priority 1: bot command — capture actual reply for thread accuracy
  if (result.commandToExecute) {
    const [cmdName, ...cmdRest] = result.commandToExecute.trim().split(/\s+/);
    const cmdHandler = commands[cmdName?.toLowerCase() ?? ""];
    if (cmdHandler) {
      msg.body = [cmdName.toLowerCase(), ...cmdRest].join(" ");

      // Intercept msg.reply to capture what the command sends back
      let capturedOutput = "Sure, I've taken care of that.";
      const originalReply = msg.reply.bind(msg);
      (msg as any).reply = async (
        content: MessageContent,
        chatId?: string,
        options?: MessageSendOptions,
      ): Promise<Message> => {
        if (typeof content === "string") capturedOutput = content;
        return originalReply(content, chatId, options);
      };

      await cmdHandler.exec(msg);
      (msg as any).reply = originalReply;

      await Promise.allSettled([
        appendThread(lid, chatId, threadQuery, capturedOutput),
        logService(msg, `agent: ${query}`, result.commandToExecute),
      ]);
    } else {
      await Promise.allSettled([
        msg.reply(`hmm, couldn't find a command for "${result.commandToExecute}" 🤔 try asking differently`),
        logService(msg, `agent: ${query}`, result.commandToExecute),
      ]);
    }
    return;
  }

  if (!result.text) {
    await msg.reply(pick(ERROR_REPLIES));
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

  // Prepend tool summary to assistant thread entry so next turn has full context
  const threadAssistant = buildToolSummary(result.toolLog) + replyText;

  await Promise.allSettled([
    msg.reply(replyText, undefined, { mentions }),
    appendThread(lid, chatId, threadQuery, threadAssistant),
    logService(msg, `agent: ${query}`, replyText),
  ]);
}
