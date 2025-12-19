import prisma from "../prisma";
import log from "../../components/utils/log";
import WAWebJS, { GroupChat } from "whatsapp-web.js";
import * as Sentry from "@sentry/node";

export async function findOrCreateGroup(chat: WAWebJS.Chat): Promise<void> {
  try {
    if (!chat.isGroup) return;

    const groupChat = chat as GroupChat;
    await prisma.group.upsert({
      where: { gid: groupChat.id.user },
      update: {
        name: groupChat.name,
        description: groupChat.description,
      },
      create: {
        gid: groupChat.id.user,
        name: groupChat.name,
        description: groupChat.description,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to find or create group.`, error);
  }
}

export async function getGroupbyLid(gid: string) {
  try {
    const user = await prisma.group.findUnique({
      where: {
        gid,
      },
    });
    return user;
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to get group by gid: ${gid}`, error);
  }
  return null;
}

export async function getGroupCount(): Promise<number> {
  try {
    const count = await prisma.group.count();
    return count;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to get group count:", error);
    return 0;
  }
}
