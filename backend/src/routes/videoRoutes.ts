// wire endpoints to controller handlers

import {Router} from "express";
import { createVideoJob, getVideoJob, downloadVideo } from "../controllers/videoController";

const router = Router();

router.post("/create", createVideoJob);

router.get("/:jobId", getVideoJob);

router.get("/:jobId/download", downloadVideo);

export default router;