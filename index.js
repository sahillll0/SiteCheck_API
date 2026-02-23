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
const PORT = process.env.PORT;

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/chatbot", chatbotRoutes);

// For Vercel, we export the app
export default app;

// Only listen locally if not on Vercel
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log("Server is running on port:" + PORT);
        connectDB();
    });
} else {
    // In production (Vercel), we connect to DB immediately
    connectDB();
}
