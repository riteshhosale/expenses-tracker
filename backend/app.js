import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

dotenv.config();
const app = express();

const configuredOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const isAllowedLocalhost = (origin) => /^http:\/\/localhost:\d+$/.test(origin);
const isAllowedRenderOrigin = (origin) =>
  /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server and non-browser requests (no Origin header).
      if (!origin) return callback(null, true);

      if (configuredOrigins.includes(origin) || isAllowedLocalhost(origin)) {
        return callback(null, true);
      }

      if (isAllowedRenderOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend if built
const distPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(path.join(distPath, "index.html"))) {
  app.use(express.static(distPath));
}

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// SPA fallback
app.get("*", (req, res) => {
  if (fs.existsSync(path.join(distPath, "index.html"))) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    res.status(404).json({ message: "Frontend not built" });
  }
});

const PORT = process.env.PORT || 5000;

function startServer() {
  app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
}

// Attempt to connect to the database, but always start the server (fallback for local dev)
connectDB().then((ok) => {
  if (!ok)
    console.warn(
      "⚠️ Starting server without DB connection (fallback for local dev)",
    );
  startServer();
});
