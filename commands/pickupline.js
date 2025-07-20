"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.role = exports.command = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
const log_1 = __importDefault(require("../components/utils/log"));
const font_1 = __importDefault(require("../components/utils/font"));
exports.command = "pickupline";
exports.role = "user";
exports.info = {
    command: "pickupline",
    description: "Fetch a random pick-up line.",
    usage: "pickupline",
    example: "pickupline",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    await axios_1.default
        .get(`https://api.popcat.xyz/pickuplines`)
        .then(async (response) => {
        await msg.reply((0, font_1.default)(response.data.pickupline));
    })
        .catch(async (error) => {
        log_1.default.error("pickupline", `Error fetching data: ${error.message}`);
        await msg.reply(`Error fetching data. Please try again later.`);
    });
}
