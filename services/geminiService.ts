import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

// Helper to get safe API client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateIcebreakers = async (
  myProfile: UserProfile,
  targetProfile: UserProfile
): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return ["Hello! I'd love to connect.", "Hi, I noticed we share similar interests."];

  try {
    const prompt = `
      I am ${myProfile.name}, a ${myProfile.headline}.
      I want to connect with ${targetProfile.name}, who is a ${targetProfile.headline}.
      
      My skills: ${myProfile.skills.join(", ")}.
      My interests: ${myProfile.interests.join(", ")}.
      
      Their skills: ${targetProfile.skills.join(", ")}.
      Their interests: ${targetProfile.interests.join(", ")}.
      Their bio: "${targetProfile.bio}"
      
      Generate 3 professional, warm, and culturally sensitive conversation starters (icebreakers) based on the "Ubuntu" philosophy (connectedness, mutual respect).
      Keep them concise (under 30 words).
      Return ONLY the 3 strings separated by a pipe character (|).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    return text.split("|").map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Error generating icebreakers:", error);
    return ["Hi there! I'd love to connect and discuss our shared field.", "Hello! Your profile really stood out to me."];
  }
};

export const analyzeCompatibility = async (
  myProfile: UserProfile,
  targetProfile: UserProfile
): Promise<{ score: number; reason: string }> => {
  const ai = getAiClient();
  if (!ai) return { score: 75, reason: "You both have complimentary skills in technology." };

  try {
    const prompt = `
      Analyze the professional compatibility between two people for a networking platform.
      
      Person A (Me): ${JSON.stringify(myProfile)}
      Person B (Target): ${JSON.stringify(targetProfile)}
      
      Provide a compatibility score from 0 to 100 and a 1-sentence reason focusing on synergy and potential collaboration.
      Format: "SCORE: [number] | REASON: [text]"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const match = text.match(/SCORE:\s*(\d+)\s*\|\s*REASON:\s*(.*)/i);
    
    if (match) {
      return {
        score: parseInt(match[1], 10),
        reason: match[2].trim()
      };
    }
    return { score: 70, reason: "AI analysis incomplete, but profiles show promise." };

  } catch (error) {
    console.error("Error analyzing compatibility:", error);
    return { score: 0, reason: "Could not analyze compatibility at this time." };
  }
};

export const optimizeBio = async (currentBio: string, skills: string[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return currentBio;

    try {
        const prompt = `
            Rewrite the following professional bio to be more engaging, impactful, and aligned with the Ubuntu philosophy of openness and community.
            Current Bio: "${currentBio}"
            Key Skills to highlight: ${skills.join(", ")}
            Return ONLY the new bio text.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text?.trim() || currentBio;
    } catch (e) {
        console.error("Error optimizing bio", e);
        return currentBio;
    }
}
