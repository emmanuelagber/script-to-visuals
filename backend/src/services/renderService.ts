//render scene videos and merge final mp4 output

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { runFfmpeg } from "../utils/ffmpeg";

export async function renderSceneVideo(
    imagePaths: string[],
    audioPath: string,
    outputDir: string,
    sceneId: number
) {
    const outputPath = path.join(outputDir, `scene-${sceneId}.mp4`);
    const audioDuration = await getAudioDuration(audioPath);
    const shotDuration = Math.max(1.8, audioDuration / Math.max(1, imagePaths.length));
    const shotVideoPaths: string[] = [];

    for (let i = 0; i < imagePaths.length; i++) {
        const shotVideoPath = path.join(outputDir, `scene-${sceneId}-shot-${i + 1}.mp4`);
        await runFfmpeg([
            "-loop", "1",
            "-t", shotDuration.toFixed(2),
            "-i", imagePaths[i],
            "-vf", buildShotMotionFilter(i),
            "-r", "30",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-an",
            shotVideoPath
        ]);
        shotVideoPaths.push(shotVideoPath);
    }

    const silentSceneVideoPath = path.join(outputDir, `scene-${sceneId}-silent.mp4`);
    await mergeSceneVideos(shotVideoPaths, silentSceneVideoPath);

    // Add narration and trim to narration length.
    await runFfmpeg([
        "-i", silentSceneVideoPath,
        "-i", audioPath,
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        outputPath
    ]);

    return outputPath;
}

export async function mergeSceneVideos(sceneVideoPaths: string[], outputFilePath: string) {
    const listFile = path.join(path.dirname(outputFilePath), "concat-list.txt");
    const lines = sceneVideoPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
    fs.writeFileSync(listFile, lines, "utf-8");

    await runFfmpeg([
        "-f", "concat",
        "-safe", "0",
        "-i", listFile,
        "-c", "copy",
        outputFilePath
    ]);
}

function buildShotMotionFilter(index: number) {
    const motions = [
        "scale=1500:960,zoompan=z='min(zoom+0.0010,1.16)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720",
        "scale=1500:960,zoompan=z='if(lte(zoom,1.0),1.0,max(zoom-0.0007,1.0))':x='(iw-iw/zoom)':y='(ih-ih/zoom)/2':d=1:s=1280x720",
        "scale=1500:960,zoompan=z='min(zoom+0.0009,1.12)':x='(iw-iw/zoom)/3':y='(ih-ih/zoom)/4':d=1:s=1280x720",
        "scale=1500:960,zoompan=z='min(zoom+0.0008,1.10)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/3':d=1:s=1280x720"
    ];

    return motions[index % motions.length];
}

function getAudioDuration(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const args = [
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            audioPath
        ];

        const proc = spawn("ffprobe", args, { stdio: ["ignore", "pipe", "inherit"] });
        let stdout = "";

        proc.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });

        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code !== 0) return reject(new Error(`ffprobe failed with code ${code}`));
            const duration = Number.parseFloat(stdout.trim());
            if (!Number.isFinite(duration) || duration <= 0) return reject(new Error("Invalid audio duration from ffprobe"));
            resolve(duration);
        });
    });
}
