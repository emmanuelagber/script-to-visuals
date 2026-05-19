import express from "express";
import cors from "cors";
import videoRoutes from "./routes/videoRoutes";

const app = express();

function parseCorsOrigins() {
    const raw = process.env.CORS_ORIGINS ?? "";
    const origins = raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    return new Set(origins);
}

const allowedOrigins = parseCorsOrigins();

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow server-to-server and local tools without Origin header.
            if (!origin) return callback(null, true);

            if (allowedOrigins.has(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ["GET", "POST"],
    })
);
app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/video", videoRoutes);

export default app;
