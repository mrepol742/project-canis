"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
exports.info = {
    command: "pickupline",
    description: "Fetch a random pick-up line.",
    usage: "pickupline",
    example: "pickupline",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^pickupline$/i.test(msg.body))
        return;
    const response = await axios_1.default.get(`https://api.popcat.xyz/pickuplines`);
    await msg.reply(response.data.pickupline);
}
