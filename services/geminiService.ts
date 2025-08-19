
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("Gemini API key not found. AI features will be disabled.");
}

export const summarizeText = async (text: string): Promise<string> => {
    if (!ai) {
        throw new Error("Gemini API is not initialized. Please provide an API key.");
    }
    if (!text || text.trim().length < 50) { // Require a minimum length for a useful summary
        return "Content is too short to summarize.";
    }

    const prompt = `Please provide a concise, one-paragraph summary of the following note. Focus on the key points and main ideas.\n\n---\n${text}\n---`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
                topP: 0.9,
            }
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing text with Gemini:", error);
        throw new Error("Failed to generate summary. See console for details.");
    }
};

export const isGeminiConfigured = (): boolean => {
    return !!ai;
}
