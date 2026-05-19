"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNarrationAudio = generateNarrationAudio;
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const scriptService_1 = require("./scriptService");
async function generateNarrationAudio(sceneText, outputDir, sceneId) {
    const outputPath = path_1.default.join(outputDir, `scene-${sceneId}-narration.wav`);
    const safeText = (0, scriptService_1.normalizeSceneText)(sceneText).replace(/[\r\n]+/g, " ").trim();
    await synthesizeSpeechToWav(safeText, outputPath);
    return { outputPath };
}
function escapePsSingleQuoted(value) {
    return value.replace(/'/g, "''");
}
function synthesizeSpeechToWav(text, outputPath) {
    return new Promise((resolve, reject) => {
        const escapedText = escapePsSingleQuoted(text);
        const escapedOut = escapePsSingleQuoted(outputPath);
        const command = [
            "Add-Type -AssemblyName System.Speech;",
            "$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;",
            "$synth.Rate = 0;",
            `$synth.SetOutputToWaveFile('${escapedOut}');`,
            `$synth.Speak('${escapedText}');`,
            "$synth.Dispose();",
        ].join(" ");
        const proc = (0, child_process_1.spawn)("powershell", ["-NoProfile", "-Command", command], { stdio: "inherit" });
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code === 0)
                resolve();
            else
                reject(new Error(`TTS synthesis failed with code ${code}`));
        });
    });
}
