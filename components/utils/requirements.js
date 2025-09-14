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
const url_1 = __importDefault(require("url"));
function checkNodeVersion() {
    const current = process.versions.node;
    const required = ">=24.0.0";
    if (!semver_1.default.satisfies(current, required)) {
        log_1.default.warn("Requirements", `Node.js ${required} required, found ${current}`);
    }
    else {
        log_1.default.info("Requirements", `Node.js version OK: ${current}`);
    }
}
function safePrintDBUrl(dbUrl, fallback) {
    try {
        const parsed = new url_1.default.URL(dbUrl);
        return `${parsed.protocol}//${parsed.hostname}:${parsed.port || ""}`;
    }
    catch {
        return fallback;
    }
}
function checkMySQL() {
    const dbUrl = process.env.DATABASE_URL || "mysql://root@127.0.0.1:3306";
    try {
        const version = (0, child_process_1.execSync)("mariadb --version").toString().trim();
        log_1.default.info("Requirements", `MySQL available at ${safePrintDBUrl(dbUrl, "mysql://127.0.0.1:3306")} | ${version}`);
    }
    catch {
        log_1.default.error("Requirements", "MySQL is required but not found (install mysql-client or ensure server is accessible).");
        process.exit(1);
    }
}
function checkRedis() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    try {
        const version = (0, child_process_1.execSync)("redis-cli --version").toString().trim();
        log_1.default.info("Requirements", `Redis available at ${safePrintDBUrl(redisUrl, "redis://localhost:6379")} | ${version}`);
    }
    catch {
        log_1.default.error("Requirements", "Redis is required but not found (install redis-cli or ensure server is running).");
        process.exit(1);
    }
}
function checkChrome() {
    try {
        const version = (0, child_process_1.execSync)("google-chrome-stable --version").toString().trim();
        log_1.default.info("Requirements", `Google Chrome installed | ${version}`);
    }
    catch {
        try {
            const version = (0, child_process_1.execSync)("chromium --version").toString().trim();
            log_1.default.info("Requirements", `Chromium installed | ${version}`);
        }
        catch {
            log_1.default.error("Requirements", "Google Chrome/Chromium is required but not found.");
            process.exit(1);
        }
    }
}
function checkFFMPEG() {
    try {
        const version = (0, child_process_1.execSync)("ffmpeg -version").toString().split("\n")[0].trim();
        log_1.default.info("Requirements", `FFmpeg installed | ${version}`);
    }
    catch {
        log_1.default.warn("Requirements", "FFmpeg not found. Some features may not work.");
    }
}
function checkRequirements() {
    log_1.default.info("Requirements", "Checking system requirements...");
    checkNodeVersion();
    checkMySQL();
    checkRedis();
    checkChrome();
    checkFFMPEG();
    log_1.default.info("Requirements", "System check complete.");
}
