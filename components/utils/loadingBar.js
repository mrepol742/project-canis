"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoadingBar;
const cli_progress_1 = __importDefault(require("cli-progress"));
function LoadingBar(format = "Loading | {bar} | {value}%") {
    return new cli_progress_1.default.SingleBar({
        format,
        barCompleteChar: "█",
        barIncompleteChar: "-",
        hideCursor: true,
    }, cli_progress_1.default.Presets.shades_classic);
}
