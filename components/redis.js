"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const log_1 = __importDefault(require("./utils/log"));
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
        connectTimeout: 30000,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
});
redis.on("error", (err) => log_1.default.error("Redis", err));
redis.connect();
exports.default = redis;
