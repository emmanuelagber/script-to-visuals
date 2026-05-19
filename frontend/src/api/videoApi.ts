import { apiClient } from "./client";

export interface CreateVideoRequest {
    script: string;
}

export interface CreateVideoResponse {
    jobId: string;
}

export interface VideoJobResponse {
    jobId: string;
    status: "queued" | "processing" | "done" | "failed";
    progress: number;
    videoUrl: string | null;
}

export async function createVideoJob(payload: CreateVideoRequest) {
    const { data } = await apiClient.post<CreateVideoResponse>("/video/create", payload);
    return data;
}

export async function getVideoJob(jobId: string) {
    const { data } = await apiClient.get<VideoJobResponse>(`/video/${jobId}`);
    return data;
}
