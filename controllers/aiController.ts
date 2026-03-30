import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const generatePostDraft = async (req: Request, res: Response) => {
  const { title, category } = req.body;

  if (!title || title.length < 2) {
    res.status(400).json({ error: "Title too short" });
    return;
  }

  if(!category) {
    res.status(400).json({ error: "Please choose a category before generating a draft" });
    return; 
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a short, engaging food blog post based on this title: "${title}" and category: "${category}". 
      Requirements:
        - Do NOT include the title in the output
        - Do NOT use headings like "##" or repeat the title
        - Start directly with the content
        - Write 2–3 paragraphs
        - Use a warm and friendly tone`,
    });

    const draft = response.text;

    res.json({ draft });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to generate content" });
  }
};