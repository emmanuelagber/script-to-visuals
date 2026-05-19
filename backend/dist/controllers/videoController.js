"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoJob = createVideoJob;
exports.getVideoJob = getVideoJob;
exports.downloadVideo = downloadVideo;
const uuid_1 = require("uuid");
const jobStore_1 = require("../services/jobStore");
const videoWorker_1 = require("../workers/videoWorker");
async function createVideoJob(req, res) {
    const { script } = req.body;
    if (!script || !script.trim()) {
        return res.status(400).json({ error: "Script is required" });
    }
    const jobId = (0, uuid_1.v4)();
    (0, jobStore_1.createJob)({
        jobId,
        script: script.trim(),
        status: "queued",
        progress: 0,
        videoPath: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    setImmediate(() => (0, videoWorker_1.processVideoJob)(jobId));
    res.status(202).json({ jobId });
}
function getVideoJob(req, res) {
    const { jobId } = req.params;
    const job = (0, jobStore_1.getJob)(jobId);
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
function downloadVideo(req, res) {
    const { jobId } = req.params;
    const job = (0, jobStore_1.getJob)(jobId);
    if (!job)
        return res.status(404).json({ message: "Job not found" });
    if (job.status !== "done" || !job.videoPath) {
        return res.status(400).json({ message: "Video not ready" });
    }
    return res.download(job.videoPath, `${job.jobId}.mp4`);
}
