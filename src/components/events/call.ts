import { Call } from "whatsapp-web.js";
import log from "../utils/log";
import { client } from "../client";
import { getSetting } from "../services/settings";

const voiceResponses = [
  "Sorry, I can't take voice calls right now.",
  "I'm unavailable for a voice call at the moment.",
  "Not able to answer your call right now, please text me instead.",
  "I'm currently busy, please try later for a voice call.",
];

const videoResponses = [
  "Sorry, I can’t do video calls right now.",
  "I’m not available for a video call at the moment.",
  "Please send me a message instead of a video call.",
  "I can’t pick up your video call right now, let’s chat instead.",
];

function getRandomResponse(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function (call: Call) {
  try {
    if (call.fromMe) return;
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

    await client.sendMessage(call.from, response);

    log.info(
      "CallEvent",
      `Rejected a ${call.isVideo ? "video" : "voice"} call from ${call.from}`,
    );
  } catch (err) {
    log.error("Error handling call:", err);
  }
}
