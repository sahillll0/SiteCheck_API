import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export const getAiResponse = async (req, res) => {
    const { message, chatHistory } = req.body;

    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    try {
        const apiKey = (process.env.GEMINI_API_KEY || process.env.GIMINI_API_KEY || "")?.trim();
        if (!apiKey) {
            return res.status(500).json({ message: "Gemini API Key is missing in the server configuration." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const systemPrompt = `You are the SiteCheck Assistant, a helpful and minimalist AI direct from the SiteCheck platform.
Your purpose is to assist users with:
1. Understanding SiteCheck's website analysis reports (SEO, Performance, Security).
2. Navigating the SiteCheck platform.
3. Offering general web optimization advice.

GREETINGS & IDENTITY:
- You should answer basic greetings like "hi", "hello", "hey", etc., with a friendly welcome.
- If asked "who developed you" or "who created you", answer: "I was developed by Sahil Tippe, the creator of SiteCheck."

CRITICAL RULES:
- For other queries, ONLY answer questions related to SiteCheck, SEO, web performance, accessibility, and security.
- For ANY question outside this scope (e.g., cooking, sports, general trivia), politely redirect the user back to SiteCheck topics.
- Be concise, professional, and helpful.
- Use simple markdown for formatting.`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt
        });

        // Format history and ensure it starts with a user message
        let history = (chatHistory || []).map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        // Remove the first message if it's from the model (Gemini requires history to start with user)
        if (history.length > 0 && history[0].role === "model") {
            history.shift();
        }

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error("Error in chatbot controller:", error);

        let errorMessage = "Failed to get AI response";
        let statusCode = 500;

        if (error.message?.includes("429") || error.status === 429) {
            errorMessage = "Chatbot is temporarily unavailable due to high demand (Quota exceeded). Please try again in 1 minute.";
            statusCode = 429;
        } else if (error.message?.includes("404") || error.status === 404) {
            errorMessage = "AI model not found. Please contact support.";
            statusCode = 404;
        }

        res.status(statusCode).json({
            message: errorMessage,
            error: error.message,
            details: error.response?.data || null
        });
    }
};
