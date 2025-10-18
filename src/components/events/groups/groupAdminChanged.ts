import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import sleep from "../../utils/sleep";
import { client } from "../../client";
import { getMessage } from "../../../data/group";
import * as Sentry from "@sentry/node";

export default async function (notif: GroupNotification): Promise<void> {
  try {
    if (notif.timestamp < Date.now() / 1000 - 10) return;
  } catch (err) {
    Sentry.captureException(err);
    log.error("GroupJoin", "Failed to process group admin changed event:", err);
  }
}
