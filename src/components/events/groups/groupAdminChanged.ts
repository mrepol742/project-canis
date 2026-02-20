import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import * as Sentry from "@sentry/node";
import { getSetting } from "../../services/settings";

export default async function (notif: GroupNotification): Promise<void> {
  try {
    if (notif.timestamp < Date.now() / 1000 - 10) return;

    const isPaused = await getSetting("paused");
    if (isPaused && isPaused === "on") return;
  } catch (err) {
    Sentry.captureException(err);
    log.error("GroupJoin", "Failed to process group admin changed event:", err);
  }
}
