import { useMutation } from "@tanstack/react-query";
import { createVideoJob } from "../api/videoApi";

export function useCreateVideoJob() {
    return useMutation({
        mutationFn: createVideoJob
    });
}
