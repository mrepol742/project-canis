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
exports.checkRequirements = checkRequirements;
const child_process_1 = require("child_process");
const process = __importStar(require("process"));
const semver_1 = __importDefault(require("semver"));
const log_1 = __importDefault(require("./log"));
function checkNodeVersion() {
    const current = process.versions.node;
    const required = ">=24.0.0";
    if (!semver_1.default.satisfies(current, required)) {
        log_1.default.warn("Node", `Node.js ${required} required, found ${current}`);
    }
    else {
        log_1.default.info("Node", `Node.js ${current}`);
    }
}
function checkMySQL() {
    const dbUrl = process.env.DATABASE_URL || "mysql://root@127.0.0.1:3306";
    try {
        const version = (0, child_process_1.execSync)("mariadb --version").toString().trim();
        log_1.default.info("MySQL", version);
    }
    catch {
        log_1.default.error("MySQL", "MySQL is required but not found (install mysql-client or ensure server is accessible).");
        process.exit(1);
    }
}
function checkRedis() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    try {
        const version = (0, child_process_1.execSync)("redis-cli --version").toString().trim();
        log_1.default.info("Redis", version);
    }
    catch {
        log_1.default.error("Redis", "Redis is required but not found (install redis-cli or ensure server is running).");
        process.exit(1);
    }
}
function checkChrome() {
    try {
        const version = (0, child_process_1.execSync)("google-chrome-stable --version")
            .toString()
            .trim();
        log_1.default.info("GoogleChrome", version);
    }
    catch {
        log_1.default.error("GoogleChrome", "Google Chrome not found. Some features may not work.");
    }
}
function checkFFMPEG() {
    try {
        const version = (0, child_process_1.execSync)("ffmpeg -version")
            .toString()
            .split("\n")[0]
            .trim();
        log_1.default.info("FFMPEG", version);
    }
    catch {
        log_1.default.warn("FFMPEG", "FFmpeg not found. Some features may not work.");
    }
}
function checkRequirements() {
    log_1.default.info("Requirements", "Checking bot requirements...");
    checkNodeVersion();
    checkMySQL();
    checkRedis();
    checkChrome();
    checkFFMPEG();
    log_1.default.info("Requirements", "Bot requirements check complete.");
}
