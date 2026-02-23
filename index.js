import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import analyzeRoutes from "./routes/analyze.route.js";
import supportRoutes from "./routes/support.route.js";
import chatbotRoutes from "./routes/chatbot.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            "http://localhost:5173",
            "https://site-check-com.vercel.app",
            process.env.FRONTEND_URL
        ].filter(Boolean);
        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// Explicitly handle preflight requests
app.options("*", cors());

app.get("/", (req, res) => {
    res.status(200).json({ message: "SiteCheck Backend", status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/chatbot", chatbotRoutes);

// For Vercel, we export the app
export default app;

// Only listen locally if not on Vercel
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log("Server is running on port." + PORT);
        connectDB();
    });
} else {
    // In production (Vercel), we connect to DB immediately
    connectDB().catch(err => console.error("MongoDB connection error:", err));
}

// Catch-all route for any undefined API routes to prevent generic 404s
app.use((req, res) => {
    res.status(404).json({ message: "API Route not found", path: req.path });
});
