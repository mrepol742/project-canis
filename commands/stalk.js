"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const user_1 = require("../components/services/user");
exports.info = {
    command: "stalk",
    description: "Stalk a user (not allowed).",
    usage: "stalk",
    example: "stalk @user",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (msg.mentionedIds.length === 0) {
        await msg.reply("Please mention a user to stalk.");
        return;
    }
    const lid = msg.mentionedIds[0].split("@")[0];
    const [user] = await Promise.all([
        (0, user_1.getUserbyLid)(lid)
    ]);
    if (!user)
        return await msg.reply("User not found.");
    const text = `
  \`${user.name}\`
  ${user.about || "No about information available."}

    ID: ${user.lid}
    Number: ${user.number}
    Country Code: ${user.countryCode}
    Type: ${user.type}
    Mode: ${user.mode}
    Command Count: ${user.commandCount}
    Last Seen: ${new Date(user.updatedAt).toLocaleString()}
    `;
    await msg.reply(text);
}
