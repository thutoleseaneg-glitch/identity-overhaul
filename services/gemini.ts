
import { GoogleGenAI, Type } from "@google/genai";
import { UserState } from "../types";

export async function getLifeInsights(userData: UserState) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare data for context
  const dataSummary = Object.entries(userData.entries).map(([date, data]) => {
    return {
      date,
      activities: data.categories,
      // Fix: Use dealsClosed instead of deals to match SalesEntry interface
      sales: data.sales ? { revenue: data.sales.revenue, leads: data.sales.leads, dealsClosed: data.sales.dealsClosed } : null,
      gym: data.gym ? { completed: data.gym.completed, type: data.gym.type } : null,
      network: data.network ? { newContacts: data.network.newContacts?.length || 0 } : null,
      relationships: data.relationships ? data.relationships.map(r => ({
        trust: r.trustMatrix.integrity + r.trustMatrix.competence + r.trustMatrix.communication + r.trustMatrix.alignment + r.trustMatrix.reciprocity,
        mood: r.mood,
        weather: r.weather,
        time: r.valueExchange.timeInvested
      })) : null
    };
  });

  const contactSummary = userData.contacts.map(c => ({
    tier: c.tier,
    industry: c.industry,
    wealth: c.estimatedNetWorth,
  }));

  const prompt = `
    Analyze this professional's Relationship Intelligence and Commercial logs.
    
    Context:
    - Daily Logs: ${JSON.stringify(dataSummary)}
    - Contact Network: ${JSON.stringify(contactSummary)}
    
    Focus Areas:
    1. Relationship ROI: Evaluate "Trust Depth" (100-pt system) against Commercial gains.
    2. Weather Forecasting: Correlate relationship "weather" (Sunny/Rainy) with deal velocity.
    3. Value Exchange Optimization: Analyze time invested vs trust growth.
    4. Trust Dimension Analysis: Identify if Integrity or Competence is the primary trust-builder.

    Example Output Style:
    "RELATIONSHIP WEATHER IS TRENDING 'SUNNY' FOR STRATEGIC MINING CONTACTS; INITIATE DEAL PROPOSALS NOW."
    "TRUST ACCELERATION IS 2X HIGHER WHEN FOCUSING ON 'ALIGNMENT' RATHER THAN 'COMPETENCE' IN TOURISM NETWORK."
    "SYSTEM AT RISK: HIGH VALUE EXCHANGE (TIME) WITH LOW TRUST RECOVERY IN FINANCE SECTOR. RE-EVALUATE PORTFOLIO."

    Return the response as JSON with an array of strings in the 'insights' field. Use aggressive, professional, and ultra-concise business language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["insights"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result.insights || [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      "SYSTEM ADVISORY: RE-ALIGN TRUST DIMENSIONS TO ACCELERATE RELATIONSHIP ROI.",
      "WEATHER FORECAST: CLEAR SKIES IN THE STRATEGIC NETWORK. EXECUTE HIGH-VALUE TOUCHPOINTS.",
      "OPTIMIZE VALUE EXCHANGE: TIME INVESTMENT WITHOUT TRUST GROWTH DETECTED IN CASUAL TIER."
    ];
  }
}
