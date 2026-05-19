import "dotenv/config";
import app from "./app";
import { ensureBaseDirs } from "./config/paths";

const PORT = process.env.PORT || 4000;

ensureBaseDirs();

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
