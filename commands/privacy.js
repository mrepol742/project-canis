"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "privacy",
    description: "Display the privacy policy of the bot.",
    usage: "privacy",
    example: "privacy",
    role: "legal",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^privacy$/i.test(msg.body))
        return;
    const text = `
  \`Privacy Policy\`
    This privacy policy outlines how we collect, use, and protect user data in compliance with applicable laws and regulations.

    \`Data Collection\`
    We collect the following types of data from users:
    - User interactions with the bot.
    - User identifiers (e.g., phone numbers) for communication purposes.
    - Usage statistics to improve the bot's functionality.

    \`Data Usage\`
    The collected data is used for:
    - Responding to user queries and commands.
    - Improving the bot's performance and user experience.
    - Ensuring compliance with legal and regulatory requirements.

    \`Data Protection\`
    We implement appropriate security measures to protect user data from unauthorized access, disclosure, or misuse.

    \`User Rights\`
    Users have the right to:
    - Access their data.
    - Request correction of inaccurate data.
    - Request deletion of their data.

    \`Contact Information\`
    For any questions or concerns regarding this privacy policy, users can contact us at mrepol742@gmail.com.
    `;
    await msg.reply(text);
}
