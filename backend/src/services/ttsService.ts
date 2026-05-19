import path from 'path';
import { spawn } from "child_process";
import { normalizeSceneText } from "./scriptService";

export async function generateNarrationAudio(sceneText: string, outputDir: string, sceneId: number) {
    const outputPath = path.join(outputDir, `scene-${sceneId}-narration.wav`);
    const safeText = normalizeSceneText(sceneText).replace(/[\r\n]+/g, " ").trim();

    await synthesizeSpeechToWav(safeText, outputPath);

    return { outputPath };
}

function escapePsSingleQuoted(value: string) {
    return value.replace(/'/g, "''");
}

function synthesizeSpeechToWav(text: string, outputPath: string): Promise<void> {
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

        const proc = spawn("powershell", ["-NoProfile", "-Command", command], { stdio: "inherit" });

        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`TTS synthesis failed with code ${code}`));
        });
    });
}
