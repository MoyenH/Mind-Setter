import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ImpactItem {
  text: string;
  score: number; // 1-5
  category: string;
}

export interface DecisionOption {
  name: string;
  pros: ImpactItem[];
  cons: ImpactItem[];
  overallScore: number;
  imagePrompt?: string; // Descriptive prompt for a representative image
}

export interface DecisionAnalysis {
  summary: string;
  options: DecisionOption[];
  recommendation: string;
  analyticalNote: string;
}

export async function analyzeDecision(query: string): Promise<DecisionAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following decision query and provide a detailed comparison with weighted pros and cons. 
    Query: "${query}"
    
    If it's a single decision (e.g. "Should I quit my job?"), treat "Stay/Wait" as one option and "Quit/Act" as the other.
    If it's a direct comparison (e.g. "Tesla vs BMW"), analyze both as options.
    Assign a score from 1 to 5 for each pro/con based on its likely impact on the person's life/situation.
    Sort the pros and cons by impact score (highest first).
    
    For each option, provide an 'imagePrompt' which is a 5-8 word descriptive prompt for a professional, clean image of the subject (e.g. 'A sleek modern electric car on a white background' for Tesla).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A brief executive summary of the decision landscape." },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the option (e.g. 'Option A', 'BMW')." },
                pros: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      score: { type: Type.NUMBER, description: "Impact score 1-5" },
                      category: { type: Type.STRING, description: "e.g. 'Financial', 'Emotional', 'Career'" }
                    }
                  }
                },
                cons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      score: { type: Type.NUMBER, description: "Impact score 1-5" },
                      category: { type: Type.STRING }
                    }
                  }
                },
                overallScore: { type: Type.NUMBER, description: "Calculated balance score for this option (0-100)." },
                imagePrompt: { type: Type.STRING, description: "Descriptive image prompt." }
              },
              required: ["name", "pros", "cons", "overallScore", "imagePrompt"]
            }
          },
          recommendation: { type: Type.STRING, description: "Clear advice or reasoning for the preferred path." },
          analyticalNote: { type: Type.STRING, description: "A deeper insight or hidden factor to consider." }
        },
        required: ["summary", "options", "recommendation", "analyticalNote"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No analysis received from AI.");
  
  return JSON.parse(text) as DecisionAnalysis;
}
