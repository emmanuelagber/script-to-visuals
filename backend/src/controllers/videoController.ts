// handle REST requests and map them to services/workers
import { Request, Response } from "express";
import {v4 as uuidv4} from "uuid";
import { createJob, getJob } from "../services/jobStore";
import { processVideoJob } from "../workers/videoWorker";

export async function createVideoJob(req: Request, res: Response) {
    const { script } = req.body as { script: string };
    
    if(!script || !script.trim()) {
        return res.status(400).json({ error: "Script is required" });
    }

    const jobId = uuidv4();
    createJob({
        jobId,
        script: script.trim(),
        status: "queued",
        progress: 0,
        videoPath: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    setImmediate(() => processVideoJob(jobId));

    res.status(202).json({ jobId });
}

export function getVideoJob(req: Request, res: Response) {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }

    return res.json({
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        videoUrl: job.status === "done" ? `/api/video/${jobId}/download` : null,
        error: job.error || null,
    });
}

export function downloadVideo(req: Request, res: Response) {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "done" || !job.videoPath) {
        return res.status(400).json({ message: "Video not ready" });
    }

    return res.download(job.videoPath, `${job.jobId}.mp4`);
}
