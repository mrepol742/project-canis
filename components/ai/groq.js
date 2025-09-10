"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groq = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const client = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || "",
});
exports.groq = client;
