import { Scene } from "../types/job";

export function splitScriptIntoScenes(script: string): Scene[] {
    const chunks = script
        .split(/\n\s*\n|(?<=[.!?])\s+/g)
        .map((s) => normalizeSceneText(s))
        .filter(Boolean);

    return chunks.map((text, idx) => ({
        id: idx + 1,
        text,
    }));
}

export function normalizeSceneText(text: string) {
    return text
        .replace(/^\s*(scene|shot|chapter)\s*\d+[:.)-]?\s*/i, "")
        .replace(/^\s*(scene|shot|chapter)\s*[:.)-]\s*/i, "")
        .replace(/\s+/g, " ")
        .trim();
}
