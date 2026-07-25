import { getUserbyLid } from "../../services/user";
import type { AgentTool } from "./types";

export const userInfoTool: AgentTool = {
  name: "get_user",
  description:
    "Look up a WhatsApp user in the database by their lid (the numeric part of their ID, without @).",
  parameters: {
    type: "object",
    properties: {
      lid: {
        type: "string",
        description:
          "The user's lid, e.g. '1234567890' (no @c.us or @s.whatsapp.net suffix)",
      },
    },
    required: ["lid"],
  },
};

export async function runGetUser(lid: string): Promise<string> {
  if (!lid.trim()) return "No lid provided.";
  const user = await getUserbyLid(lid);
  if (!user) return `No user found with lid: ${lid}`;
  return JSON.stringify({
    name: user.name,
    number: user.number,
    countryCode: user.countryCode,
    type: user.type,
    commandCount: user.commandCount,
    points: user.points,
    createdAt: user.createdAt,
  });
}
