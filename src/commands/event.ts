import { Message } from "../../types/message";

export const info = {
  command: "event",
  description: "Return the event of the message or the quoted message.",
  usage: "event",
  example: "event",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^event/i.test(msg.body)) return;

  let event: Message = msg;

  if (msg.hasQuotedMsg) event = await msg.getQuotedMessage();

  await msg.reply("```" + JSON.stringify(event, null, 2) + "```");
}
