import { getGroupbyLid } from "../../services/group";
import type { AgentTool } from "./types";

export const groupInfoTool: AgentTool = {
  name: "get_group",
  description:
    "Look up a WhatsApp group in the database by its gid (numeric part of the group JID).",
  parameters: {
    type: "object",
    properties: {
      gid: {
        type: "string",
        description:
          "The group's gid, e.g. '120363000000000000' (no @g.us suffix)",
      },
    },
    required: ["gid"],
  },
};

export async function runGetGroup(gid: string): Promise<string> {
  if (!gid.trim()) return "No gid provided.";
  const group = await getGroupbyLid(gid);
  if (!group) return `No group found with gid: ${gid}`;
  return JSON.stringify({
    name: group.name,
    description: group.description,
    createdAt: group.createdAt,
  });
}
