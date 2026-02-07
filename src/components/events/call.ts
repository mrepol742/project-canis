import { Call } from "whatsapp-web.js";
import log from "../utils/log";
import { client } from "../client";
import { getSetting } from "../services/settings";
import { videoResponses, voiceResponses } from "../utils/data";
import * as Sentry from "@sentry/node";

function getRandomResponse(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function (call: Call): Promise<void> {
  try {
    if (call.fromMe || call.isGroup) return;

    const isPaused = await getSetting("paused");
    if (isPaused && isPaused === "on") return;

    const isCallMustReject = await getSetting("call_reject");
    if (!isCallMustReject || isCallMustReject == "off") return;

    await call.reject();
    if (!call.from) return;

    let response;
    if (call.isVideo) {
      response = getRandomResponse(videoResponses);
    } else {
      response = getRandomResponse(voiceResponses);
    }

    (await client()).sendMessage(call.from, response);

    log.info("Call", call.from, call.isVideo ? "video" : "voice");
  } catch (err) {
    Sentry.captureException(err);
    log.error("Error handling call:", err);
  }
}
