import { analyzeWebsite } from "../lib/analyzer.js";
import Report from "../models/Report.model.js";

export const analyze = async (req, res) => {
    const { url } = req.body;
    const userId = req.user._id;

    try {
        if (!url) {
            return res.status(400).json({ message: "URL is required" });
        }

        // Run Analysis
        const result = await analyzeWebsite(url);

        // Extract domain
        let domain = "";
        try {
            const urlObj = new URL(result.url);
            domain = urlObj.hostname;
        } catch (e) {
            domain = result.url; // Fallback
        }

        // Save Report to Database
        // Save Report to Database
        const newReport = new Report({
            userId,
            url: result.url,
            domain: domain,
            score: result.score,
            metrics: result.metrics, // Direct mapping now possible
            issues: result.issues,
            suggestions: result.suggestions,
            analyzedAt: new Date(result.analyzedAt),
        });

        await newReport.save();

        res.status(200).json({
            _id: newReport._id,
            ...newReport.toObject(),
        });
    } catch (error) {
        console.error("Analysis error:", error.message);

        if (error.message === "Invalid URL provided" || error.message.includes("Failed to fetch")) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Failed to analyze website", error: error.message });
    }
};

export const getReports = async (req, res) => {
    try {
        const userId = req.user._id;
        const reports = await Report.find({ userId }).sort({ createdAt: -1 }); // Newest first
        res.status(200).json(reports);
    } catch (error) {
        console.log("Error in getReports", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        // Ensure user owns report
        if (report.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized access to report" });
        }

        res.status(200).json(report);
    } catch (error) {
        console.log("Error in getReportById", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        // Ensure user owns report
        if (report.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized access to report" });
        }

        await Report.findByIdAndDelete(id);

        res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
        console.log("Error in deleteReport", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
