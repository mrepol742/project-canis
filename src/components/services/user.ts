import { prisma } from "../prisma";
import log from "../../components/utils/log";
import { Message } from "whatsapp-web.js";

export async function findOrCreateUser(msg: Message): Promise<boolean> {
  try {
    const jid = msg.author || msg.from;
    const lid = jid.split("@")[0];

    let user = await prisma.user.findUnique({
      where: { lid },
    });

    if (user) {
      await prisma.user.update({
        where: { lid },
        data: {
          commandCount: {
            increment: 1,
          },
        },
      });
      return false;
    }

    const contact = await msg.getContact();
    const countryCode = await contact.getCountryCode();
    const about = await contact.getAbout();
    const name = contact.pushname || contact.name || "Unknown";

    user = await prisma.user.create({
      data: {
        lid,
        name,
        number: contact.number,
        countryCode,
        type: contact.isBusiness ? "business" : "private",
        mode: msg.author ? "group" : "private",
        about: about,
        commandCount: 1,
      },
    });
  } catch (error) {
    log.error("Database", `Failed to find or create user.`, error);
  }
  return true;
}

export async function getUserbyLid(lid: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        lid,
      },
    });
    return user;
  } catch (error) {
    log.error("Database", `Failed to get user by lid: ${lid}`, error);
  }
  return null;
}

export async function isBlocked(lid: string): Promise<boolean> {
  try {
    const block = await prisma.block.findUnique({
      where: {
        lid,
      },
    });

    return block !== null;
  } catch (error) {
    log.error("Database", `Failed to check if user is blocked.`, error);
  }
  return false;
}

export async function getUserCount(): Promise<number> {
  try {
    const count = await prisma.user.count();
    return count;
  } catch (error) {
    console.error("Failed to get user count:", error);
    return 0;
  }
}

export async function getBlockUserCount(): Promise<number> {
  try {
    const count = await prisma.block.count();
    return count;
  } catch (error) {
    console.error("Failed to get block user count:", error);
    return 0;
  }
}

export async function getUsers(): Promise<any[]> {
  try {
    const users = await prisma.user.groupBy({
      by: ["number", "name", "quizAnswered"],
      _sum: {
        commandCount: true,
        quizAnswered: true,
      },
      orderBy: {
        _sum: {
          commandCount: "desc",
        },
      },
    });

    // format
    return users.map((u) => ({
      name: u.name,
      number: u.number,
      commandCount: u._sum.commandCount,
      quizAnswered: u._sum.quizAnswered,
    }));
  } catch (error) {
    log.error("Database", `Failed to get users.`, error);
    return [];
  }
}