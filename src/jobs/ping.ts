import log from "../components/utils/log";
import client from "../components/client";
import { CronJobInfo } from "../cron";

export const info: CronJobInfo = {
  name: "Ping",
  description: "Ping WhatsApp Client",
  schedule: "*/5 * * * *", // every 5 minutes
  runOnStartup: false,
};

export default async function () {
  try {
    const chats = await (await client()).getChats();
    log.info(
      "Ping",
      `Successfully fetched ${chats.length} chats to keep session alive.`,
    );
  } catch (err) {
    log.error("Ping", err);
  }
}
