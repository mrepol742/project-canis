import log from "../components/utils/log";
import client from "../components/client";
import { CronJobInfo } from "../cron";
import * as Sentry from "@sentry/node";

export const info: CronJobInfo = {
  name: "Ping",
  description: "Ping WhatsApp Client",
  schedule: "0 * * * *", // every hour
  runOnStartup: false,
};

export default async function () {
  try {
    // const chats = await (await client()).getChats();
    // log.info(
    //   "Ping",
    //   `Successfully fetched ${chats.length} chats to keep session alive.`,
    // );
  } catch (err) {
    Sentry.captureException(err);
    log.error("Ping", err);
  }
}
