import { Message } from "../types/message";
import axios from "../components/axios";

export const info = {
  command: "aur",
  description: "Search the Arch User Repository (AUR) for packages.",
  usage: "aur <query>",
  example: "aur zeditor",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^aur\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const response = await axios.get(
    `https://aur.archlinux.org/rpc/?v=5&type=search&by=name&arg=${encodeURIComponent(query)}`,
  );

  const results = response.data.results;
  if (!results || results.length === 0) {
    await msg.reply(`No AUR packages found for "${query}".`);
    return;
  }

  const pkg = results[0];

  const info = `
    \`${pkg.Name}\` - ${pkg.Version}
    ${pkg.Description || "No description available."}

    Votes: ${pkg.NumVotes}
    Popularity: ${pkg.Popularity.toFixed(2)}
    Out-of-date: ${pkg.OutOfDate ? "Yes" : "No"}

    https://aur.archlinux.org/packages/${pkg.Name}/
    `;

  await msg.reply(info);
}
