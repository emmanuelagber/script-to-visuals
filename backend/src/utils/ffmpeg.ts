import { spawn } from 'child_process';

interface FfmpegOptions {
    cwd?: string;
}

export function runFfmpeg(args: string[], options: FfmpegOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn("ffmpeg", ["-y", ...args], { stdio: "inherit", cwd: options.cwd });

        proc.on("error", reject);
        proc.on("close", (code: number | null) => {
            if(code === 0) resolve();
            else reject(new Error(`ffmpeg exited with code ${code}`));
        })
    });
}
