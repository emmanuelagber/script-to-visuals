"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSceneVisuals = generateSceneVisuals;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ffmpeg_1 = require("../utils/ffmpeg");
const scriptService_1 = require("./scriptService");
const sceneVisualParser_1 = require("./sceneVisualParser");
const SCENE_COLORS = ["#1f2937", "#0f766e", "#7c2d12", "#1d4ed8", "#6d28d9"];
async function generateSceneVisuals(sceneText, outputDir, sceneId) {
    const cleanedSceneText = (0, scriptService_1.normalizeSceneText)(sceneText);
    const shotCount = pickShotCount(cleanedSceneText);
    const parsedFacts = (0, sceneVisualParser_1.parseSceneFacts)(cleanedSceneText);
    const queryPlan = buildImageQueryPlan(parsedFacts, shotCount);
    const outputs = [];
    for (let i = 0; i < queryPlan.length; i++) {
        const outputPath = path_1.default.join(outputDir, `scene-${sceneId}-shot-${i + 1}.jpg`);
        const downloaded = await tryDownloadSceneImage(queryPlan[i], outputPath);
        if (downloaded)
            outputs.push(outputPath);
    }
    if (outputs.length > 0)
        return outputs;
    // Fallback when image API is unavailable.
    const fallbackOutputPath = path_1.default.join(outputDir, `scene-${sceneId}-visual.png`);
    const color = SCENE_COLORS[(sceneId - 1) % SCENE_COLORS.length];
    const wrappedText = wrapTextForScene(cleanedSceneText);
    const captionFileName = `scene-${sceneId}-caption.txt`;
    const captionPath = path_1.default.join(outputDir, captionFileName);
    fs_1.default.writeFileSync(captionPath, wrappedText, "utf-8");
    await (0, ffmpeg_1.runFfmpeg)([
        "-f", "lavfi",
        "-i", `color=c=${color}:s=1280x720:d=1`,
        "-vf",
        `drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':textfile='${captionFileName}':fontcolor=white:fontsize=42:line_spacing=10:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.45:boxborderw=24`,
        "-frames:v", "1",
        fallbackOutputPath
    ], { cwd: outputDir });
    return [fallbackOutputPath];
}
function wrapTextForScene(text, maxCharsPerLine = 42, maxLines = 8) {
    const normalized = text.replace(/\s+/g, " ").trim();
    const words = normalized.split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxCharsPerLine) {
            current = candidate;
        }
        else {
            if (current)
                lines.push(current);
            current = word;
            if (lines.length >= maxLines)
                break;
        }
    }
    if (current && lines.length < maxLines)
        lines.push(current);
    return lines.join("\n");
}
async function tryDownloadSceneImage(query, outputPath) {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey)
        return false;
    const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&size=large&per_page=5`;
    const searchResponse = await fetch(searchUrl, {
        headers: {
            Authorization: apiKey,
        },
    });
    if (!searchResponse.ok) {
        return false;
    }
    const searchJson = (await searchResponse.json());
    const firstCandidate = searchJson.photos?.find((photo) => Boolean(photo.src?.landscape || photo.src?.large2x || photo.src?.large));
    const imageUrl = firstCandidate?.src?.landscape
        ?? firstCandidate?.src?.large2x
        ?? firstCandidate?.src?.large;
    if (!imageUrl)
        return false;
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok)
        return false;
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    fs_1.default.writeFileSync(outputPath, imageBuffer);
    return true;
}
function buildImageQueryPlan(facts, shotCount) {
    const base = (0, sceneVisualParser_1.buildVisualQueryFromFacts)(facts);
    const variants = [
        `${base}, cinematic wide shot`,
        `${base}, medium shot`,
        `${base}, close up details`,
        `${base}, atmospheric environment`
    ];
    return variants.slice(0, shotCount);
}
function pickShotCount(sceneText) {
    const wordCount = sceneText.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 70)
        return 4;
    if (wordCount >= 35)
        return 3;
    return 2;
}
