"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
const log_1 = __importDefault(require("../components/utils/log"));
exports.command = "randomcolor";
exports.role = "user";
async function default_1(msg) {
    await axios_1.default
        .get(`https://api.popcat.xyz/randomcolor`)
        .then(async (response) => {
        const hex = response.data.hex;
        const name = response.data.name;
        const image = response.data.image;
        const color = `
     *${name}*
     \`${hex}\`
     `;
        await msg.reply(color);
    })
        .catch(async (error) => {
        log_1.default.error("randomcolor", `Error fetching data: ${error.message}`);
        await msg.reply(`Error fetching data . Please try again later.`);
    });
}
