"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initInnertube;
const youtubei_js_1 = require("youtubei.js");
let innertube;
async function initInnertube() {
    if (!innertube) {
        innertube = await youtubei_js_1.Innertube.create({
            lang: "en",
            location: "US",
            cache: new youtubei_js_1.UniversalCache(true, "../../.cache"),
        });
    }
    return innertube;
}
