"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitScriptIntoScenes = splitScriptIntoScenes;
exports.normalizeSceneText = normalizeSceneText;
function splitScriptIntoScenes(script) {
    const chunks = script
        .split(/\n\s*\n|(?<=[.!?])\s+/g)
        .map((s) => normalizeSceneText(s))
        .filter(Boolean);
    return chunks.map((text, idx) => ({
        id: idx + 1,
        text,
    }));
}
function normalizeSceneText(text) {
    return text
        .replace(/^\s*(scene|shot|chapter)\s*\d+[:.)-]?\s*/i, "")
        .replace(/^\s*(scene|shot|chapter)\s*[:.)-]\s*/i, "")
        .replace(/\s+/g, " ")
        .trim();
}
