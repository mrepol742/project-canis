"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
const npmlog_1 = __importDefault(require("npmlog"));
exports.command = "pickupline";
exports.role = "user";
async function default_1(msg) {
    await axios_1.default
        .get(`https://api.popcat.xyz/pickupline`)
        .then(async (response) => {
        await msg.reply(response.data.pickupline);
    })
        .catch(async (error) => {
        npmlog_1.default.error("pickupline", `Error fetching data: ${error.message}`);
        await msg.reply(`Error fetching data . Please try again later.`);
    });
}
