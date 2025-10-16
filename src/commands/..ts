import { Message } from "../types/message";
import log from "../components/utils/log";
import EventMessage from "../components/events/message";

export const info = {
  command: ".",
  description: "Repeat executing of command from qouted message.",
  usage: ".",
  example: ".",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!msg.hasQuotedMsg) {
    await msg.reply(
      "You need to reply to a message to rerun the commands again.",
    );
    return;
  }

  const qoutedMessage = await msg.getQuotedMessage();

  if (/^.{1,2}$/.test(qoutedMessage.body.trim())) {
    await msg.reply("You cannot use '.' on another '.' command..");
    return;
  }

  msg = qoutedMessage;

  await EventMessage(msg, "again");
}
