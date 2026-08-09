import { getGroq } from "./groq";
import { getGemini } from "./gemini";
import { getOpenAI } from "./openAi";
import { getOpenRouterOAI } from "./openRouter";
import ollama from "ollama";
import log from "../utils/log";
import * as Sentry from "@sentry/node";
import {
  AI_PROVIDER,
  AGENT_MAX_TOOL_ITERATIONS,
  GEMINI_MODEL,
  GROQ_MODEL,
  OLLAMA_MODEL,
  OPEN_ROUTER_MODEL,
  OPENAI_MODEL,
} from "../../config";
import type { ThreadMessage } from "./thread";
import { type AgentTool, executeTool } from "./tools/index";
import type { ToolContext } from "./tools/types";

export interface ToolLogEntry {
  name: string;
  args: Record<string, unknown>;
  result: string;
}

export interface AgentResult {
  text: string | null;
  commandToExecute: string | null;
  toolLog: ToolLogEntry[];
}

export interface ImageData {
  data: string;   // base64, no prefix
  mimetype: string;
}

// Sentinel returned to the LLM when run_command is intercepted
const RUN_CMD_SENTINEL = "__RUN_COMMAND_DISPATCHED__";

type ExecFn = (name: string, args: Record<string, unknown>) => Promise<string>;

function stripRawToolCalls(text: string): string | null {
  const cleaned = text
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, "")
    .replace(/<function_calls?>[\s\S]*?<\/function_calls?>/gi, "")
    .replace(/```(?:json)?\s*\{[\s\S]*?"(?:name|function)"[\s\S]*?\}\s*```/gi, "")
    .trim();

  if (!cleaned) return null;

  // Whole response is a bare JSON tool call object
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && parsed.name && (parsed.arguments !== undefined || parsed.parameters !== undefined)) {
      return null;
    }
  } catch {}

  return cleaned;
}

async function runOpenAILike(
  client: { chat: { completions: { create: (...a: any[]) => Promise<any> } } },
  model: string,
  systemPrompt: string,
  history: ThreadMessage[],
  userQuery: string,
  tools: AgentTool[],
  execFn: ExecFn,
  imageData?: ImageData,
): Promise<string | null> {
  const userContent: any = imageData
    ? [
        { type: "text", text: userQuery },
        { type: "image_url", image_url: { url: `data:${imageData.mimetype};base64,${imageData.data}` } },
      ]
    : userQuery;

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userContent },
  ];

  const oaTools =
    tools.length > 0
      ? tools.map((t) => ({
          type: "function",
          function: { name: t.name, description: t.description, parameters: t.parameters },
        }))
      : undefined;

  const startIdx = messages.length; // first index that will be added this turn

  for (let i = 0; i < AGENT_MAX_TOOL_ITERATIONS; i++) {
    const response = await client.chat.completions.create({
      model,
      messages,
      tools: oaTools,
      tool_choice: oaTools ? "auto" : undefined,
    });

    const choice = response.choices?.[0];
    if (!choice) {
      // Provider returned no choices — content filter, empty response, or malformed reply
      log.warn("AgentRunner", `No choices in response (finish_reason: ${(response as any).finish_reason ?? "unknown"})`);
      break;
    }

    const msg = choice.message;
    messages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      const text = typeof msg.content === "string" ? msg.content : null;
      return text ? stripRawToolCalls(text) : null;
    }

    let commandDispatched = false;
    for (const tc of msg.tool_calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {}
      const result = await execFn(tc.function.name, args);
      log.info("AgentTool", `${tc.function.name} → ${result.slice(0, 80)}`);
      messages.push({ role: "tool", tool_call_id: tc.id, content: result });
      if (result === RUN_CMD_SENTINEL) commandDispatched = true;
    }

    if (commandDispatched) return null;
  }

  // Only scan messages added in this turn — never return stale history
  for (let i = messages.length - 1; i >= startIdx; i--) {
    const m = messages[i];
    if (m.role === "assistant" && typeof m.content === "string" && m.content) {
      return stripRawToolCalls(m.content);
    }
  }
  return null;
}

async function runGemini(
  systemPrompt: string,
  history: ThreadMessage[],
  userQuery: string,
  tools: AgentTool[],
  execFn: ExecFn,
  imageData?: ImageData,
): Promise<string | null> {
  const functionDeclarations = tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));

  const userParts: any[] = [{ text: userQuery }];
  if (imageData) {
    userParts.push({ inlineData: { mimeType: imageData.mimetype, data: imageData.data } });
  }

  const contents: any[] = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: userParts },
  ];

  for (let i = 0; i < AGENT_MAX_TOOL_ITERATIONS; i++) {
    const response = await getGemini().models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        ...(functionDeclarations.length > 0
          ? ({ tools: [{ functionDeclarations }] } as any)
          : {}),
      } as any,
    });

    const parts: any[] = response.candidates?.[0]?.content?.parts ?? [];
    const textPart = parts.find((p: any) => typeof p.text === "string");
    const callParts = parts.filter((p: any) => p.functionCall);

    if (callParts.length === 0) {
      return textPart?.text ?? null;
    }

    contents.push({ role: "model", parts });

    let commandDispatched = false;
    const responseParts: any[] = [];
    for (const part of callParts) {
      const fc = part.functionCall;
      const result = await execFn(fc.name, (fc.args ?? {}) as Record<string, unknown>);
      log.info("AgentTool", `${fc.name} → ${result.slice(0, 80)}`);
      responseParts.push({
        functionResponse: { name: fc.name, response: { result } },
      });
      if (result === RUN_CMD_SENTINEL) commandDispatched = true;
    }
    contents.push({ role: "user", parts: responseParts });

    if (commandDispatched) return null;
  }

  const lastModel = [...contents].reverse().find((c: any) => c.role === "model");
  const lastText = lastModel?.parts?.find((p: any) => typeof p.text === "string");
  return lastText?.text ?? null;
}

async function runOllama(
  systemPrompt: string,
  history: ThreadMessage[],
  userQuery: string,
  tools: AgentTool[],
  execFn: ExecFn,
  imageData?: ImageData,
): Promise<string | null> {
  const userMessage: any = { role: "user", content: userQuery };
  if (imageData) userMessage.images = [imageData.data];

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    userMessage,
  ];

  const ollamaTools =
    tools.length > 0
      ? tools.map((t) => ({
          type: "function" as const,
          function: { name: t.name, description: t.description, parameters: t.parameters },
        }))
      : undefined;

  const startIdx = messages.length;

  for (let i = 0; i < AGENT_MAX_TOOL_ITERATIONS; i++) {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages,
      tools: ollamaTools,
    });

    messages.push(response.message);

    const toolCalls = response.message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      const text = response.message.content || null;
      return text ? stripRawToolCalls(text) : null;
    }

    let commandDispatched = false;
    for (const tc of toolCalls) {
      const result = await execFn(
        tc.function.name,
        (tc.function.arguments ?? {}) as Record<string, unknown>,
      );
      log.info("AgentTool", `${tc.function.name} → ${result.slice(0, 80)}`);
      messages.push({ role: "tool", content: result });
      if (result === RUN_CMD_SENTINEL) commandDispatched = true;
    }

    if (commandDispatched) return null;
  }

  // Only scan messages added in this turn — never return stale history
  for (let i = messages.length - 1; i >= startIdx; i--) {
    const m = messages[i];
    if (m.role === "assistant" && m.content) return stripRawToolCalls(m.content);
  }
  return null;
}

export default async function runAgent(
  systemPrompt: string,
  history: ThreadMessage[],
  userQuery: string,
  tools: AgentTool[],
  context: ToolContext,
  model?: string,
  imageData?: ImageData,
): Promise<AgentResult> {
  let commandToExecute: string | null = null;
  const toolLog: ToolLogEntry[] = [];
  let firstTool = true;

  const execFn: ExecFn = async (name, args) => {
    const isFirst = firstTool;
    firstTool = false;

    try { await context.onToolCall?.(name, isFirst); } catch {}

    if (name === "run_command") {
      commandToExecute = String(args.command ?? "").trim();
      toolLog.push({ name, args, result: "dispatched" });
      return RUN_CMD_SENTINEL;
    }

    const result = await executeTool(name, args, context);
    toolLog.push({ name, args, result: result.slice(0, 400) });
    return result;
  };

  const emptyResult = (text: string | null): AgentResult => ({
    text,
    commandToExecute,
    toolLog,
  });

  try {
    let text: string | null = null;
    switch (AI_PROVIDER) {
      case "openrouter":
        text = await runOpenAILike(
          getOpenRouterOAI(),
          model || OPEN_ROUTER_MODEL,
          systemPrompt,
          history,
          userQuery,
          tools,
          execFn,
          imageData,
        );
        break;

      case "groq":
        text = await runOpenAILike(
          getGroq() as any,
          model || GROQ_MODEL,
          systemPrompt,
          history,
          userQuery,
          tools,
          execFn,
          imageData,
        );
        break;

      case "openai":
        text = await runOpenAILike(
          getOpenAI() as any,
          model || OPENAI_MODEL,
          systemPrompt,
          history,
          userQuery,
          tools,
          execFn,
          imageData,
        );
        break;

      case "gemini":
        text = await runGemini(systemPrompt, history, userQuery, tools, execFn, imageData);
        break;

      case "ollama":
        text = await runOllama(systemPrompt, history, userQuery, tools, execFn, imageData);
        break;

      default:
        throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
    }

    return emptyResult(text);
  } catch (err: any) {
    const status: number | undefined = err?.status ?? err?.statusCode;

    if (status === 429) {
      const reset: string | undefined =
        err?.headers?.["x-ratelimit-reset-tokens"] ??
        err?.headers?.["x-ratelimit-reset-requests"];
      const hint = reset ? ` Try again in ${reset}.` : " Please try again shortly.";
      log.warn("AgentRunner", `Rate limited by ${AI_PROVIDER}.${hint}`);
      return emptyResult(`I'm being rate-limited right now.${hint}`);
    }

    if (status === 400 && err?.error?.error?.code === "tool_use_failed") {
      log.warn("AgentRunner", `Tool use failed: ${err.error.error.message}`);
      return emptyResult("Sorry, I ran into a problem processing that request. Please try again.");
    }

    Sentry.captureException(err);
    log.error("AgentRunner", err);
    return emptyResult(null);
  }
}
