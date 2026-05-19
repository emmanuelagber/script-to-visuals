"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOBS_DIR = exports.STORAGE_DIR = exports.ROOT_DIR = void 0;
exports.ensureBaseDirs = ensureBaseDirs;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const process = require("process");
exports.ROOT_DIR = process.cwd();
exports.STORAGE_DIR = path_1.default.join(exports.ROOT_DIR, 'storage');
exports.JOBS_DIR = path_1.default.join(exports.STORAGE_DIR, 'jobs');
// export const LOGS_DIR = path.join(STORAGE_DIR, 'logs');
function ensureBaseDirs() {
    [exports.STORAGE_DIR, exports.JOBS_DIR].forEach((dir) => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    });
}
