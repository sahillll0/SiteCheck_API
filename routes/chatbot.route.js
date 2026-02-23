import express from "express";
import { getAiResponse } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/ask", getAiResponse);

export default router;
