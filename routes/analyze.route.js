import express from "express";
import { analyze, getReportById, getReports, deleteReport } from "../controllers/analyze.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, analyze);
router.get("/", protectRoute, getReports);
router.get("/:id", protectRoute, getReportById);
router.delete("/:id", protectRoute, deleteReport);

export default router;
