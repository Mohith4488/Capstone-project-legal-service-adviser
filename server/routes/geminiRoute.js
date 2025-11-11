import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI("AIzaSyBia3LRIK3ihDywoMhFesJjHC198ggtwhA");

router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    // ✅ Updated API call using v1 models
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.json({ answer: response });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ message: "Gemini API error", error: error.message });
  }
});

export default router;
