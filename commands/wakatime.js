"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
exports.info = {
    command: "wakatime",
    description: "Shows current WakaTime tasks for today.",
    usage: "wakatime",
    example: "wakatime",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^wakatime/i.test(msg.body))
        return;
    const apiKey = process.env.WAKATIME_API_KEY;
    if (!apiKey) {
        await msg.reply("WakaTime API key is not configured.");
        return;
    }
    const today = new Date().toISOString().split("T")[0];
    const response = await axios_1.default.get(`https://wakatime.com/api/v1/users/current/heartbeats`, {
        params: { date: today },
        headers: {
            Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        },
    });
    const heartbeats = response.data.data;
    if (!heartbeats || heartbeats.length === 0) {
        await msg.reply("The author didn't do any job today unfortunately 😢");
        return;
    }
    heartbeats.sort((a, b) => a.time - b.time);
    const projectDurations = {};
    for (let i = 0; i < heartbeats.length; i++) {
        const hb = heartbeats[i];
        const nextHb = heartbeats[i + 1];
        if (!hb.project)
            continue;
        let duration = 0;
        if (nextHb) {
            duration = Math.min(120, nextHb.time - hb.time);
        }
        else {
            duration = 60;
        }
        projectDurations[hb.project] =
            (projectDurations[hb.project] || 0) + duration;
    }
    const projects = Object.keys(projectDurations);
    if (projects.length === 0) {
        await msg.reply("The author didn't do any job today unfortunately 😢");
        return;
    }
    const projectList = projects.map((proj) => {
        const seconds = projectDurations[proj];
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `- ${proj}: ${hours}h ${minutes}m`;
    });
    const replyText = `\`Today's WakaTime projects\`\n${projectList.join("\n")}`;
    await msg.reply(replyText);
}
