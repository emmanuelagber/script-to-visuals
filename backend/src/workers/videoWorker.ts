//backgound processing pipelines for video each video

import fs from "fs";
import path from "path";
import { JOBS_DIR } from "../config/paths";
import { getJob, setJobStatus, updateJob } from "../services/jobStore";
import { splitScriptIntoScenes } from "../services/scriptService";
import { generateNarrationAudio } from "../services/ttsService";
import { generateSceneVisuals } from "../services/visualService";
import { mergeSceneVideos, renderSceneVideo } from "../services/renderService";

export async function processVideoJob(jobId: string) {
    const job = getJob(jobId);
    if (!job) return;

    const jobDir = path.join(JOBS_DIR, jobId);
    if (!fs.existsSync(jobDir)) fs.mkdirSync(jobDir, { recursive: true });

    try {
        setJobStatus(jobId, "processing", 5);

        const scenes = splitScriptIntoScenes(job.script);
        if (scenes.length === 0) throw new Error("No valid scenes found.");

        const sceneVideos: string[] = [];
        const totalSteps = scenes.length * 3 + 1; // tts + visual + render per scene + merge
        let currentStep = 0;

        for (const scene of scenes) {
            const { outputPath: audioPath } = await generateNarrationAudio(scene.text, jobDir, scene.id);
            currentStep++;
            updateJob(jobId, { progress: Math.floor((currentStep / totalSteps) * 100) });

            const imagePaths = await generateSceneVisuals(scene.text, jobDir, scene.id);
            currentStep++;
            updateJob(jobId, { progress: Math.floor((currentStep / totalSteps) * 100) });

            const videoPath = await renderSceneVideo(imagePaths, audioPath, jobDir, scene.id);
            sceneVideos.push(videoPath);
            currentStep++;
            updateJob(jobId, { progress: Math.floor((currentStep / totalSteps) * 100) });
        }

        const finalVideoPath = path.join(jobDir, "final.mp4");
        await mergeSceneVideos(sceneVideos, finalVideoPath);

        updateJob(jobId, {
            status: "done",
            progress: 100,
            videoPath: finalVideoPath
        });
    } catch (error) {
        updateJob(jobId, {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
