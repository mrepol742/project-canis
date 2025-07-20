"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.role = exports.command = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const GoogleTTS = __importStar(require("google-tts-api"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
exports.command = "say";
exports.role = "user";
exports.info = {
    command: "say",
    description: "Convert text to speech and send it as an audio message.",
    usage: "say <text>",
    example: "say Hello, how are you?",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^say\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide something to say.");
        return;
    }
    const url = GoogleTTS.getAudioUrl(query.substring(0, 150), {
        lang: "en",
        slow: false,
        host: "https://translate.google.com",
    });
    const response = await axios_1.default.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const tempDir = "./.temp";
    const tempPath = `${tempDir}/${Date.now()}.mp3`;
    await fs_1.default.promises.mkdir(tempDir, { recursive: true });
    await fs_1.default.promises.writeFile(tempPath, buffer);
    const media = whatsapp_web_js_1.MessageMedia.fromFilePath(tempPath);
    await msg.reply(media);
    await fs_1.default.promises.unlink(tempPath);
}
