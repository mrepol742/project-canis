"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
const log_1 = __importDefault(require("../components/utils/log"));
exports.info = {
    command: "randomcolor",
    description: "Generate a random color with its name and hex code.",
    usage: "randomcolor",
    example: "randomcolor",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^randomcolor$/i.test(msg.body))
        return;
    await axios_1.default
        .get(`https://api.popcat.xyz/randomcolor`)
        .then(async (response) => {
        const hex = response.data.hex;
        const name = response.data.name;
        const image = response.data.image;
        const color = `
     \`${name}\`
     ${hex}
     `;
        await msg.reply(color);
    })
        .catch(async (error) => {
        log_1.default.error("randomcolor", `Error fetching data: ${error.message}`);
        await msg.reply(`Error fetching data . Please try again later.`);
    });
}
