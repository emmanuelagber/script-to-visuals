import { VideoJob, JobStatus } from "../types/job";

const jobs = new Map<string, VideoJob>();

export function createJob(job: VideoJob) {
    jobs.set(job.jobId, job);
}

export function getJob(jobId: string) {
    return jobs.get(jobId);
}

export function updateJob(
    jobId: string,
    patch: Partial<Pick<VideoJob, "status" | "progress" | "error" | "videoPath">>
) {
    const job = jobs.get(jobId);
    if (!job) return;
    
    const updated: VideoJob = {
        ...job,
        ...patch,
        updatedAt: new Date().toISOString(),
    };
    jobs.set(jobId, updated);
}

export function setJobStatus(jobId: string, status: JobStatus, progress:number) {
    updateJob(jobId, { status, progress });
}