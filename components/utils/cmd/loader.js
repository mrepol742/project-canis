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
exports.commands = exports.commandDirs = void 0;
exports.default = loader;
exports.mapCommands = mapCommands;
const log_1 = __importDefault(require("../log"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const loadingBar_1 = __importDefault(require("../loadingBar"));
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
const basePath = path_1.default.join(__dirname, "..", "..", "..", "commands");
exports.commandDirs = [basePath, path_1.default.join(basePath, "private")];
exports.commands = {};
async function ensureDependencies(dependencies) {
    for (const dep of dependencies) {
        try {
            require.resolve(dep.name);
            log_1.default.info("Loader", `Dependency already installed: ${dep.name}`);
        }
        catch {
            log_1.default.info("Loader", `Installing missing dependency: ${dep.name}@${dep.version}`);
            try {
                const { stdout, stderr } = await execPromise(`npm install ${dep.name}@${dep.version}`);
                if (stdout)
                    log_1.default.info("npm", stdout);
                if (stderr)
                    log_1.default.error("npm", stderr);
            }
            catch (err) {
                log_1.default.error("Loader", `Failed to install ${dep.name}@${dep.version}`, err);
            }
        }
    }
}
async function loader(file, customPath) {
    if (/\.js$|\.ts$/.test(file)) {
        const filePath = path_1.default.join(customPath, file);
        const resolvedPath = path_1.default.resolve(filePath);
        if (require.cache[resolvedPath]) {
            delete require.cache[resolvedPath];
        }
        const commandModule = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
        if (typeof commandModule.default === "function" &&
            commandModule.info &&
            commandModule.info.command) {
            if (Array.isArray(commandModule.info.dependencies)) {
                await ensureDependencies(commandModule.info.dependencies);
            }
            exports.commands[commandModule.info.command] = {
                command: commandModule.info.command,
                description: commandModule.info.description || "No description",
                usage: commandModule.info.usage || "No usage",
                example: commandModule.info.example || "No example",
                role: commandModule.info.role || "user",
                cooldown: commandModule.info.cooldown || 5000,
                exec: commandModule.default,
            };
        }
    }
}
async function mapCommands() {
    let allFiles = [];
    for (const dir of exports.commandDirs) {
        const files = await fs_1.promises.readdir(dir);
        const tuples = files.map((f) => [f, dir]);
        allFiles = [...allFiles, ...tuples];
    }
    const total = allFiles.length;
    if (total === 0) {
        log_1.default.info("Loader", "No commands found.");
        return;
    }
    const bar = (0, loadingBar_1.default)("Loading Commands | {bar} | {value}/{total} {command}");
    bar.start(total, 0, { command: "" });
    for (const [file, dir] of allFiles) {
        try {
            await loader(file, dir);
            bar.increment({ command: file });
        }
        catch (err) {
            log_1.default.error("Loader", `Failed to load ${file}`, err);
            bar.increment({ command: file });
        }
    }
    bar.stop();
    log_1.default.info("Loader", "All commands loaded.");
}
