"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
