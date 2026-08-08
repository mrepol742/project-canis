export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<
      string,
      { type: string; description: string; enum?: string[] }
    >;
    required?: string[];
  };
}

/** Context passed into tool execution so tools can interact with the WhatsApp session. */
export interface ToolContext {
  /** Host-side workspace directory mounted as /tmp/workspace inside the sandbox. */
  workspaceDir: string;
  /** Send a file from the local filesystem to the current WhatsApp chat. */
  sendFile: (path: string, caption?: string) => Promise<string>;
  /** Called before each tool executes. isFirst=true on the first tool call of the turn. */
  onToolCall?: (toolName: string, isFirst: boolean) => Promise<void>;
}
