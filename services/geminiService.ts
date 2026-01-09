import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DeviceType, DeviceSpecs, DiagnosisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const diagnosisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    diagnosisSummary: {
      type: Type.STRING,
      description: "A concise, non-technical explanation of what is likely wrong with the device.",
    },
    severity: {
      type: Type.STRING,
      enum: ["Critical", "Moderate", "Low"],
      description: "The severity level of the issue.",
    },
    potentialCauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 technical reasons for the issue.",
    },
    estimatedFixPriceUSD: {
      type: Type.NUMBER,
      description: "Estimated cost in USD to repair or diagnose at a shop (excluding upgrades).",
    },
    recommendedUpgrades: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          component: { type: Type.STRING, description: "E.g., '16GB DDR4 RAM', '1TB NVMe SSD'" },
          reason: { type: Type.STRING, description: "Why this upgrade helps." },
          estimatedCostUSD: { type: Type.NUMBER, description: "Approximate market price for the part." },
          performanceBoostPercentage: { type: Type.NUMBER, description: "Estimated % speed improvement." },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        },
      },
      description: "List of hardware upgrades that would solve the problem or extend device life.",
    },
    maintenanceTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable advice for the user (e.g., 'Clean fans', 'Update drivers').",
    },
  },
  required: ["diagnosisSummary", "severity", "potentialCauses", "recommendedUpgrades", "estimatedFixPriceUSD", "maintenanceTips"],
};

export const diagnoseDevice = async (
  deviceType: DeviceType,
  specs: DeviceSpecs,
  symptoms: string,
  tags: string[]
): Promise<DiagnosisResult> => {
  try {
    const prompt = `
      Act as a senior hardware technician. Diagnose the following device issue:
      
      Device Type: ${deviceType}
      Brand/Model: ${specs.brand} ${specs.model}
      Specs: CPU: ${specs.processor}, RAM: ${specs.ram}, Storage: ${specs.storage}, Age: ${specs.ageYears} years.
      
      User Reported Symptoms: ${symptoms}
      Symptom Tags: ${tags.join(", ")}
      
      Provide a diagnosis, potential causes, and specifically focus on HARDWARE upgrades (RAM, SSD, Battery) that would improve the situation. 
      Also estimate costs for parts. Be realistic about pricing.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
        temperature: 0.4, // Lower temperature for more consistent technical advice
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as DiagnosisResult;
  } catch (error) {
    console.error("Gemini Diagnosis Error:", error);
    // Fallback mock data in case of API failure for demo robustness
    return {
      diagnosisSummary: "We encountered an error analyzing your device. However, based on general knowledge, your device may be suffering from hardware aging.",
      severity: "Moderate",
      potentialCauses: ["API Connection Error", "Complex Hardware Failure"],
      recommendedUpgrades: [],
      estimatedFixPriceUSD: 0,
      maintenanceTips: ["Please try again later", "Check your internet connection"],
    };
  }
};
