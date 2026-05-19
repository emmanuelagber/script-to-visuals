"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJob = getJob;
exports.updateJob = updateJob;
exports.setJobStatus = setJobStatus;
const jobs = new Map();
function createJob(job) {
    jobs.set(job.jobId, job);
}
function getJob(jobId) {
    return jobs.get(jobId);
}
function updateJob(jobId, patch) {
    const job = jobs.get(jobId);
    if (!job)
        return;
    const updated = {
        ...job,
        ...patch,
        updatedAt: new Date().toISOString(),
    };
    jobs.set(jobId, updated);
}
function setJobStatus(jobId, status, progress) {
    updateJob(jobId, { status, progress });
}
