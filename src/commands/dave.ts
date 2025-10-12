import { Message } from "../../types/message";
import obi from "./obi";

export const info = {
  command: "dave",
  description: "Interact with the Obi AI agent.",
  usage: "obi <query>",
  example: "obi Who are you?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  msg.body = msg.body.replace("dave", "obi");
  await obi(msg);
}
