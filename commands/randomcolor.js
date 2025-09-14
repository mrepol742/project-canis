"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("../components/axios"));
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
    const response = await axios_1.default.get(`https://api.popcat.xyz/randomcolor`);
    const hex = response.data.hex;
    const name = response.data.name;
    const image = response.data.image;
    const color = `
     \`${name}\`
     ${hex}
     `;
    await msg.reply(color);
}
