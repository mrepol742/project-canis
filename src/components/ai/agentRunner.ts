import OpenAI from "openai";
import { groq } from "./groq";
import { gemini } from "./gemini";
import { openai } from "./openAi";
import ollama from "ollama";
import log from "../utils/log";
import * as Sentry from "@sentry/node";
import {
  AI_PROVIDER,
  AGENT_MAX_TOOL_ITERATIONS,
  GEMINI_MODEL,
  GROQ_MODEL,
  OLLAMA_MODEL,
  OPEN_ROUTER_API_KEY,
  OPEN_ROUTER_MODEL,
  OPENAI_MODEL,
} from "../../config";
import type { ThreadMessage } from "./thread";
import { type AgentTool, executeTool } from "./tools/index";
import type { ToolContext } from "./tools/types";

export interface AgentResult {
  text: string | null;
  commandToExecute: string | null;
}

// Sentinel returned to the LLM when run_command is intercepted
const RUN_CMD_SENTINEL = "__RUN_COMMAND_DISPATCHED__";

/*
 * OpenAI-compatible client for OpenRouter
 */
const openrouterApiClient = new OpenAI({
  apiKey: OPEN_ROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

type ExecFn = (name: string, args: Record<string, unknown>) => Promise<string>;

/*
 * Shared agentic loop for OpenAI, Groq, and OpenRouter.
 */
async function runOpenAILike(
  client: { chat: { completions: { create: (...a: any[]) => Promise<any> } } },
  model: string,
  systemPrompt: string,
  history: ThreadMessage[],
  userQuery: string,
  tools: AgentTool[],
  execFn: ExecFn,
): Promise<string | null> {
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userQuery },
  ];

  const oaTools =
    tools.length > 0
      ? tools.map((t) => ({
          type: "function",
          function: { name: t.name, description: t.description, parameters: t.parameters },
        }))
      : undefined;

  for (let i = 0; i < AGENT_MAX_TOOL_ITERATIONS; i++) {
    const response = await client.chat.completions.create({
      model,
      messages,
      tools: oaTools,
      tool_choice: oaTools ? "auto" : undefined,
    });

    const msg = response.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return typeof msg.content === "string" ? msg.content : null;
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
      if (result === RUN_CMD_SENTINEL) {
        commandDispatched = true;
      }
    }

    // Stop the loop once a bot command has been dispatched — no further LLM reply needed
    if (commandDispatched) return null;
  }

  // Exhausted iterations — return the last assistant text if any
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "assistant" && typeof m.content === "string" && m.content) {
      return m.content;
    }
  }
  return null;
}

/*
 * Gemini uses functionDeclarations / functionCall / functionResponse.
 */
async function runGemini(
  systemPrompt: string,
  history: ThreadMessage[],
  userQuery: string,
  tools: AgentTool[],
  execFn: ExecFn,
): Promise<string | null> {
  const functionDeclarations = tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));

  const contents: any[] = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: userQuery }] },
  ];

  for (let i = 0; i < AGENT_MAX_TOOL_ITERATIONS; i++) {
    const response = await gemini.models.generateContent({
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

/*
 * Ollama — same tool_calls structure as OpenAI.
 */
async function runOllama(
  systemPrompt: string,
  history: ThreadMessage[],
  userQuery: string,
  tools: AgentTool[],
  execFn: ExecFn,
): Promise<string | null> {
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userQuery },
  ];

  const ollamaTools =
    tools.length > 0
      ? tools.map((t) => ({
          type: "function" as const,
          function: { name: t.name, description: t.description, parameters: t.parameters },
        }))
      : undefined;

  for (let i = 0; i < AGENT_MAX_TOOL_ITERATIONS; i++) {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages,
      tools: ollamaTools,
    });

    messages.push(response.message);

    const toolCalls = response.message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      return response.message.content || null;
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

  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "assistant" && m.content) return m.content;
  }
  return null;
}

/*
 * Public entry point.
 * Returns { text, commandToExecute } — callers execute the command themselves.
 */
export default async function runAgent(
  systemPrompt: string,
  history: ThreadMessage[],
  userQuery: string,
  tools: AgentTool[],
  context: ToolContext,
  model?: string,
): Promise<AgentResult> {
  let commandToExecute: string | null = null;

  const execFn: ExecFn = async (name, args) => {
    if (name === "run_command") {
      commandToExecute = String(args.command ?? "").trim();
      return RUN_CMD_SENTINEL;
    }
    return executeTool(name, args, context);
  };

  try {
    let text: string | null = null;
    switch (AI_PROVIDER) {
      case "openrouter":
        text = await runOpenAILike(
          openrouterApiClient,
          model || OPEN_ROUTER_MODEL,
          systemPrompt,
          history,
          userQuery,
          tools,
          execFn,
        );
        break;

      case "groq":
        text = await runOpenAILike(
          groq as any,
          model || GROQ_MODEL,
          systemPrompt,
          history,
          userQuery,
          tools,
          execFn,
        );
        break;

      case "openai":
        text = await runOpenAILike(
          openai as any,
          model || OPENAI_MODEL,
          systemPrompt,
          history,
          userQuery,
          tools,
          execFn,
        );
        break;

      case "gemini":
        text = await runGemini(systemPrompt, history, userQuery, tools, execFn);
        break;

      case "ollama":
        text = await runOllama(systemPrompt, history, userQuery, tools, execFn);
        break;

      default:
        throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
    }

    return { text, commandToExecute };
  } catch (err: any) {
    const status: number | undefined = err?.status ?? err?.statusCode;

    if (status === 429) {
      const reset: string | undefined =
        err?.headers?.["x-ratelimit-reset-tokens"] ??
        err?.headers?.["x-ratelimit-reset-requests"];
      const hint = reset ? ` Try again in ${reset}.` : " Please try again shortly.";
      log.warn("AgentRunner", `Rate limited by ${AI_PROVIDER}.${hint}`);
      return { text: `I'm being rate-limited right now.${hint}`, commandToExecute: null };
    }

    // Tool validation: model generated a malformed or unregistered tool call
    if (status === 400 && err?.error?.error?.code === "tool_use_failed") {
      log.warn("AgentRunner", `Tool use failed: ${err.error.error.message}`);
      return {
        text: "Sorry, I ran into a problem processing that request. Please try again.",
        commandToExecute: null,
      };
    }

    Sentry.captureException(err);
    log.error("AgentRunner", err);
    return { text: null, commandToExecute };
  }
}
