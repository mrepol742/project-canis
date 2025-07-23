"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
exports.info = {
    command: "waifu",
    description: "Get a random waifu image or a specific type of waifu.",
    usage: "waifu [type]",
    example: "waifu neko",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^waifu\b\s*/i, "").trim();
    if (query.length !== 0) {
        if (!/^(neko|shinobu|megumin|bully|cuddle|cry|hug|awoo|kiss|lick|pat|smug|bonk|yeet|blush|smile|wave|highfive|handhold|nom|bite|glomp|slap|kill|kick|happy|wink|poke|dance|cringe)$/i.test(query)) {
            await msg.reply("Invalid argument. Please use one of the following:\n\nneko, shinobu, megumin, bully, cuddle, cry, hug, awoo, kiss, lick, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe");
            return;
        }
    }
    const result = await axios_1.default.get(`https://api.waifu.pics/sfw/${query.length > 0 ? query : "waifu"}`);
    const response = await axios_1.default.get(result.data.url, {
        responseType: "arraybuffer",
    });
    const tempDir = "./.temp";
    await promises_1.default.mkdir(tempDir, { recursive: true });
    const tempPath = `${tempDir}/${Date.now()}.png`;
    await promises_1.default.writeFile(tempPath, response.data);
    const media = whatsapp_web_js_1.MessageMedia.fromFilePath(tempPath);
    await msg.reply(media);
    await promises_1.default.unlink(tempPath);
}
