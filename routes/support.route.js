import express from "express";
import { sendSupportMessage } from "../controllers/support.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Allow both authenticated and unauthenticated users to send support messages
// If you want to force login, add protectRoute middleware
router.post("/send", sendSupportMessage);

export default router;
