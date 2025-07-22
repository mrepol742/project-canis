"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const user_1 = require("../components/services/user");
exports.info = {
    command: "top",
    description: "Get the top users of the bot.",
    usage: "top",
    example: "top",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^top$/i.test(msg.body))
        return;
    const user = await (0, user_1.getUsers)();
    if (!user || user.length === 0) {
        await msg.reply("No users found.");
        return;
    }
    const text = `
\`Top Users:\`

    ${user
        .filter((u, index) => u.commandCount !== 0 && index < 20)
        .map((u, index) => {
        const displayName = u.name.length > 12 ? u.name.slice(0, 12) + "..." : u.name;
        return `${index + 1}. ${displayName} - ${u.commandCount + u.quizAnswered} Points`;
    })
        .join("\n    ")}
    `;
    await msg.reply(text);
}
