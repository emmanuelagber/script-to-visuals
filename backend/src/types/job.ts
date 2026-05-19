    export type JobStatus = "queued" | "processing" | "done" | "failed";

export interface Scene {
    id: number;
    text: string;
}

export interface VideoJob {
    jobId: string;
    script: string;
    status: JobStatus;
    progress: number;
    error?: string;
    videoPath: string | null;
    createdAt: string;
    updatedAt: string;
}