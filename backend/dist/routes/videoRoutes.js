"use strict";
// wire endpoints to controller handlers
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const videoController_1 = require("../controllers/videoController");
const router = (0, express_1.Router)();
router.post("/create", videoController_1.createVideoJob);
router.get("/:jobId", videoController_1.getVideoJob);
router.get("/:jobId/download", videoController_1.downloadVideo);
exports.default = router;
