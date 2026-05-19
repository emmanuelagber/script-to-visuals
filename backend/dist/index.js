"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const paths_1 = require("./config/paths");
const PORT = process.env.PORT || 4000;
(0, paths_1.ensureBaseDirs)();
app_1.default.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
