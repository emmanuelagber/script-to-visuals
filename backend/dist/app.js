"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const videoRoutes_1 = __importDefault(require("./routes/videoRoutes"));
const app = (0, express_1.default)();
function parseCorsOrigins() {
    const raw = process.env.CORS_ORIGINS ?? "";
    const origins = raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    return new Set(origins);
}
const allowedOrigins = parseCorsOrigins();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server and local tools without Origin header.
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST"],
}));
app.use(express_1.default.json({ limit: "5mb" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/video", videoRoutes_1.default);
exports.default = app;
