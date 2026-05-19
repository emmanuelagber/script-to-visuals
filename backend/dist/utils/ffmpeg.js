"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFfmpeg = runFfmpeg;
const child_process_1 = require("child_process");
function runFfmpeg(args, options = {}) {
    return new Promise((resolve, reject) => {
        const proc = (0, child_process_1.spawn)("ffmpeg", ["-y", ...args], { stdio: "inherit", cwd: options.cwd });
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code === 0)
                resolve();
            else
                reject(new Error(`ffmpeg exited with code ${code}`));
        });
    });
}
