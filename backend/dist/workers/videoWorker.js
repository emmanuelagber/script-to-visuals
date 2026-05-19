"use strict";
//backgound processing pipelines for video each video
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideoJob = processVideoJob;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const paths_1 = require("../config/paths");
const jobStore_1 = require("../services/jobStore");
const scriptService_1 = require("../services/scriptService");
const ttsService_1 = require("../services/ttsService");
const visualService_1 = require("../services/visualService");
const renderService_1 = require("../services/renderService");
async function processVideoJob(jobId) {
    const job = (0, jobStore_1.getJob)(jobId);
    if (!job)
        return;
    const jobDir = path_1.default.join(paths_1.JOBS_DIR, jobId);
    if (!fs_1.default.existsSync(jobDir))
        fs_1.default.mkdirSync(jobDir, { recursive: true });
    try {
        (0, jobStore_1.setJobStatus)(jobId, "processing", 5);
        const scenes = (0, scriptService_1.splitScriptIntoScenes)(job.script);
        if (scenes.length === 0)
            throw new Error("No valid scenes found.");
        const sceneVideos = [];
        const totalSteps = scenes.length * 3 + 1; // tts + visual + render per scene + merge
        let currentStep = 0;
        for (const scene of scenes) {
            const { outputPath: audioPath } = await (0, ttsService_1.generateNarrationAudio)(scene.text, jobDir, scene.id);
            currentStep++;
            (0, jobStore_1.updateJob)(jobId, { progress: Math.floor((currentStep / totalSteps) * 100) });
            const imagePaths = await (0, visualService_1.generateSceneVisuals)(scene.text, jobDir, scene.id);
            currentStep++;
            (0, jobStore_1.updateJob)(jobId, { progress: Math.floor((currentStep / totalSteps) * 100) });
            const videoPath = await (0, renderService_1.renderSceneVideo)(imagePaths, audioPath, jobDir, scene.id);
            sceneVideos.push(videoPath);
            currentStep++;
            (0, jobStore_1.updateJob)(jobId, { progress: Math.floor((currentStep / totalSteps) * 100) });
        }
        const finalVideoPath = path_1.default.join(jobDir, "final.mp4");
        await (0, renderService_1.mergeSceneVideos)(sceneVideos, finalVideoPath);
        (0, jobStore_1.updateJob)(jobId, {
            status: "done",
            progress: 100,
            videoPath: finalVideoPath
        });
    }
    catch (error) {
        (0, jobStore_1.updateJob)(jobId, {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
