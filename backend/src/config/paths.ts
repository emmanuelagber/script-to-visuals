import path from 'path';
import fs from 'fs';
import process = require('process');

export const ROOT_DIR = process.cwd();
export const STORAGE_DIR = path.join(ROOT_DIR, 'storage');
export const JOBS_DIR = path.join(STORAGE_DIR, 'jobs');
// export const LOGS_DIR = path.join(STORAGE_DIR, 'logs');

export function ensureBaseDirs() {
    [STORAGE_DIR, JOBS_DIR].forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }    });
}