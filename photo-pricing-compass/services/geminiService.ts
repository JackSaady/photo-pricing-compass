import { GoogleGenAI } from "@google/genai";
import { UserProfile, ScenarioData } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize AI only when needed to avoid instant crashes if key is missing
const getAiClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getNegotiationAdvice = async (
  scenario: ScenarioData,
  clientBudget: number,
  profile: UserProfile
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing. Cannot generate advice.";

  const prompt = `
    You are a pricing strategist for a photographer.
    
    CONTEXT:
    Photographer's Target Hourly Rate: ${profile.currency}${profile.targetHourlyRate.toFixed(2)}
    Scenario: ${scenario.title} (${scenario.type})
    
    PRICING TIERS:
    Essential: ${profile.currency}${scenario.tiers[0].price}
    Standard: ${profile.currency}${scenario.tiers[1].price}
    Premium: ${profile.currency}${scenario.tiers[2].price}
    
    SITUATION:
    The client has a budget of ${profile.currency}${clientBudget}.
    
    TASK:
    Provide 3 specific, tactical suggestions to adjust the scope of work to meet the client's budget without devaluing the photographer's time.
    Do not just say "offer less". Be specific based on typical photography costs (e.g., fewer images, reduced licensing duration, remove advanced retouching, client comes to studio instead of on-location).
    Keep it bulleted and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate advice.";
  } catch (error) {
    console.error("Gemini API Error", error);
    return "Error connecting to AI advisor.";
  }
};

export const getCorporatePlanStrategy = async (
  headcount: number,
  days: number,
  hoursPerDay: number
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing.";

  const prompt = `
    Act as a corporate photography logistics planner.
    
    Scenario:
    Headcount: ${headcount} people
    Days allocated: ${days}
    Shooting hours/day: ${hoursPerDay}
    
    Task:
    Provide a brief, 2-sentence strategic recommendation on how to structure the flow (e.g., "Schedule 5 mins per person with 2 styling stations...") to ensure efficiency and high quality.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No strategy generated.";
  } catch (error) {
    console.error(error);
    return "Error retrieving strategy.";
  }
};
