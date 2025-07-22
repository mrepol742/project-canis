import { prisma } from "../prisma";
import log from "../../components/utils/log";
import { Message } from "whatsapp-web.js";

export async function saveSetting(name: string, value: string): Promise<void> {
  try {
    await prisma.settings.upsert({
      where: { name },
      update: {
        value,
      },
      create: {
        name,
        value,
      },
    });
  } catch (error) {
    log.error("Database", "Failed to add message.", error);
  }
}

export async function getSetting(name: string): Promise<string | null> {
  try {
    const setting = await prisma.settings.findUnique({
      where: { name },
    });
    return setting ? setting.value : null;
  } catch (error) {
    log.error("Database", `Failed to get setting: ${name}`, error);
    return null;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const settings = await prisma.settings.findMany();
    return settings.reduce((acc, setting) => {
      acc[setting.name] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    log.error("Database", "Failed to get all settings.", error);
    return {};
  }
}
