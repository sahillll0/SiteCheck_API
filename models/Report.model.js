import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        domain: {
            type: String,
            required: false,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        metrics: {
            // SEO
            titleLength: { type: Number },
            metaDescriptionLength: { type: Number },
            h1Count: { type: Number },
            h2Count: { type: Number },
            h3Count: { type: Number },
            canonical: { type: String },
            robots: { type: String },
            favicon: { type: String },

            // Performance
            pageSize: { type: String, required: true },
            imageCount: { type: Number, required: true },
            scriptCount: { type: Number, required: true },
            styleCount: { type: Number }, // Renamed/New
            resourceCount: { type: Number, required: true },
            textRatio: { type: Number }, // New

            // Social
            ogTitle: { type: String },
            ogDescription: { type: String },
            ogImage: { type: String },
            twitterCard: { type: String },

            // Mobile & Security
            viewport: { type: String },
            https: { type: Boolean },
        },
        issues: {
            type: [String],
            default: [],
        },
        suggestions: {
            type: [String],
            default: [],
        },
        analyzedAt: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);

// Indexes for faster queries
reportSchema.index({ userId: 1 });
reportSchema.index({ url: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
