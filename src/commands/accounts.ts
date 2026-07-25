import { Message } from "../types/message";
import { download } from "../components/utils/download";
import { getClientIds } from "../components/services/account";

export const info = {
  command: "accounts",
  description: "List all accounts currently connected in.",
  usage: "accounts",
  example: "accounts",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  let accounts = "";
  const accountsIds = await getClientIds();
  await Promise.all(
    Array.from(accountsIds.entries()).map(([clientId, isRoot]) => {
      accounts += `\`${clientId}\` - ${isRoot ? "Root" : "User"}\n`;
    }),
  );

  msg.reply(`
  \`Accounts\`

  ${accounts}
  `);
}
