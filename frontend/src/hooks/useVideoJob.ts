//React Query polling for job status

import { useQuery } from "@tanstack/react-query";
import { getVideoJob } from "../api/videoApi";

export function useVideoJob(jobId: string | null) {
    return useQuery({
        queryKey: ["videoJob", jobId],
        queryFn: () => getVideoJob(jobId as string),
        enabled: Boolean(jobId),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "done" || status === "failed") return false;
            return 2500;
        }
    });
}
