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

// Validate required environment variables
if (!process.env.DB_URL) {
    console.error("FATAL ERROR: DB_URL is not defined in environment variables.");
}
if (!process.env.JWT_SECRET) {
    console.error("WARNING: JWT_SECRET is not defined. Authentication will fail.");
}

// Global error handlers for better Vercel logs
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception thrown:", err);
    process.exit(1);
});

const app = express();
const PORT = parseInt(process.env.PORT) || 8001;

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Simple request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            "https://site-check-com.vercel.app",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ];

        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
        }

        const isAllowed = allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:");

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
};

app.use(cors(corsOptions));


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
