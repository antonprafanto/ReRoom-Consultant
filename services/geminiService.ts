
import { GoogleGenAI, FunctionDeclaration, Type, Content, Schema } from "@google/genai";

// Initialize the client
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GENERATION_MODEL = 'gemini-2.5-flash-image';
const CHAT_MODEL = 'gemini-3-pro-preview';
const ANALYSIS_MODEL = 'gemini-2.5-flash'; // Use fast model for analysis logic

// Helper: Detect Room Type
// Now exported so we can call it immediately after upload
export const detectRoomType = async (imageBase64: string): Promise<string> => {
  try {
    const prompt = `Analyze this image strictly. Determine if this is a valid interior architectural space (room) suitable for interior design.

    Rules for "isRoom":
    - TRUE: Living rooms, bedrooms, kitchens, bathrooms, empty rooms, offices, hallways.
    - FALSE: Close-ups of objects/furniture only, pets, food, selfies/people, text/documents, exterior buildings (without patio), landscapes, or blurry unrecognizable images.

    If isRoom is TRUE, identify the "roomType" from this list: 
    Living Room, Bedroom, Kitchen, Dining Room, Home Office, Bathroom, Laundry Room, Entryway, Attic, Basement, Garage, Outdoor Patio, Commercial Space.

    If isRoom is FALSE, "roomType" should be "Not a Room".`;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1],
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRoom: { type: Type.BOOLEAN },
            roomType: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["isRoom", "roomType"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    console.log("Detection Result:", result);

    if (!result.isRoom) {
        return "Unknown";
    }

    return result.roomType || "Unknown";

  } catch (error) {
    console.warn("Room detection failed.", error);
    return "Unknown";
  }
};

// New Function: Quick Analysis for Chat
export const getQuickRoomInsights = async (imageBase64: string, roomType: string): Promise<string> => {
  try {
    const prompt = `Act as an expert interior architect. Briefly scan this ${roomType}.
    Provide a concise 3-bullet point summary of the CURRENT state focusing on:
    1. Natural Lighting quality.
    2. Current layout efficiency.
    3. One immediate opportunity for improvement.
    
    Keep it conversational, helpful, and under 60 words. No markdown formatting like bold/italics.`;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1],
            },
          },
          { text: prompt },
        ],
      },
    });
    return response.text || "I've analyzed your room and I'm ready to help you redesign it.";
  } catch (error) {
    console.error("Quick Analysis Error", error);
    return "I'm ready to help you redesign this room.";
  }
};

export const generateRoomDesign = async (
  imageBase64: string,
  style: string,
  providedRoomType?: string,
  budget?: string // New Parameter
): Promise<string> => {
  try {
    // Use provided type if available, otherwise detect (fallback)
    const roomType = providedRoomType || await detectRoomType(imageBase64);
    const finalRoomType = roomType === "Unknown" ? "Room" : roomType;

    // Step 2: Generate Design with context
    let prompt = `Redesign this ${finalRoomType} in a ${style} style. 
    
    CRITICAL INSTRUCTIONS:
    1. **Functionality**: This is a ${finalRoomType}. Maintain its specific function.
    2. **Furniture**: Only include furniture appropriate for a ${finalRoomType}. 
       ${!finalRoomType.toLowerCase().includes('bedroom') ? 'DO NOT add a bed. DO NOT make it look like a bedroom.' : ''}
    3. **Structure**: Keep walls, windows, and ceiling strictly exactly the same.
    4. **Aesthetic**: Change furniture, decor, textures, and lighting to match ${style}.
    5. **Quality**: High quality, photorealistic, interior design photography.`;

    // Inject Budget Constraint if provided
    if (budget) {
        prompt += `\n6. **Budget Constraint**: The client has a renovation budget of approximately ${budget}. 
        Ensure materials and furniture choices look achievable within this price range (e.g. if low budget, use IKEA-style/simple items; if high budget, use luxury finishes).`;
    }

    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1], // Remove header if present
            },
          },
          { text: prompt },
        ],
      },
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Design Generation Error:", error);
    throw error;
  }
};

export const editRoomDesign = async (
  imageBase64: string,
  userInstruction: string
): Promise<string> => {
  try {
    // We construct a specific prompt for the nano banana model to act as an editor
    const prompt = `Edit this image based on the following instruction: "${userInstruction}". Maintain the perspective and original layout where possible, only modifying the requested elements. Photorealistic.`;

    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1],
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image generated.");
  } catch (error) {
    console.error("Edit Generation Error:", error);
    throw error;
  }
};

export const generateFloorPlan = async (
    imageBase64: string, 
    providedRoomType?: string, 
    scale?: string // New Parameter
): Promise<string> => {
  try {
     // Use provided type if available, otherwise detect
    const roomType = providedRoomType || await detectRoomType(imageBase64);
    const finalRoomType = roomType === "Unknown" ? "Room" : roomType;

    // Step 2: Detailed Spatial Analysis (Surveyor Mode)
    // We use the ANALYSIS_MODEL to act as a surveyor to map the room geometry first.
    const analysisPrompt = `You are an expert architectural surveyor. Analyze this ${finalRoomType} photo to extract precise spatial layout data for a floor plan.
    
    Please output a structured description:
    1. **Room Shape & Structure**: Is it square, rectangular, or irregular? Where are the visible corners?
    2. **Fixed Elements**: Locate all windows and doors relative to the camera viewpoint.
    3. **Furniture Mapping**: List ONLY the furniture visible or appropriate for a ${finalRoomType}. 
       ${!finalRoomType.toLowerCase().includes('bedroom') ? 'IMPORTANT: Do NOT hallucinate a bed if this is not a bedroom.' : ''}
       Describe exact positions relative to the walls.
    4. **Negative Space**: Note the clear walking paths.
    
    Be extremely specific about relative positions (left, right, center, back).`;

    const analysisResponse = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1],
            },
          },
          { text: analysisPrompt },
        ],
      },
    });

    const spatialContext = analysisResponse.text || `Standard ${finalRoomType} layout.`;

    // Step 3: Generation with Strict Drafting Rules (Draftsman Mode)
    let genPrompt = `Generate a technical Architectural Floor Plan (2D Blueprint) for the ${finalRoomType} shown in the image.
    
    Based on this spatial analysis:
    "${spatialContext}"

    **CRITICAL DRAFTING RULES:**
    1. **Viewpoint**: Strictly TOP-DOWN (Bird's Eye View). NO perspective, NO isometric angle, NO 3D depth. It must look like a flat map.
    2. **Style**: Professional CAD style. Black lines on a clean white background. Minimalist.
    3. **Structure**: Draw clear double-lines for walls. Indicate windows with thinner lines inside walls. Indicate doors with swing arcs.
    4. **Furniture**: Draw furniture appropriate for a ${finalRoomType} as simple 2D geometric outlines.
    5. **Constraint**: ${!finalRoomType.toLowerCase().includes('bedroom') ? 'Do NOT draw a bed.' : ''}
    
    Ensure the furniture arrangement matches the provided image and analysis perfectly.`;

    if (scale) {
        genPrompt += `\n6. **Scale Detail**: The user requested a scale of ${scale}. Ensure the line weights and detail level correspond to this architectural scale (e.g. 1:50 show more detail, 1:200 show blocks).`;
    }

    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1],
            },
          },
          { text: genPrompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No floor plan generated.");
  } catch (error) {
    console.error("Floor Plan Generation Error:", error);
    throw error;
  }
};

export const analyzeRoomDesign = async (imageBase64: string): Promise<any> => {
  try {
    const prompt = `Act as a professional interior designer. Analyze this room image critically.
    Provide a score from 1-10 for Lighting, Layout, and Color Harmony.
    List 3 specific "Pros" (what works well).
    List 3 specific "Cons" (what needs improvement).
    List 3 actionable "Quick Tips" to improve the room without major renovation.`;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1],
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lightingScore: { type: Type.INTEGER },
            layoutScore: { type: Type.INTEGER },
            colorHarmonyScore: { type: Type.INTEGER },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            quickTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["lightingScore", "layoutScore", "colorHarmonyScore", "pros", "cons", "quickTips"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");
    return JSON.parse(text);

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const createChatSession = (history?: Content[], language: 'en' | 'id' = 'en', budget?: string) => {
  const langInstruction = language === 'id' 
    ? "IMPORTANT: You MUST respond in Bahasa Indonesia (Indonesian Language). Use a professional, helpful, and creative tone suitable for an interior design consultant." 
    : "Respond in English.";
  
  const budgetInstruction = budget 
    ? `The user has specified a project budget of ${budget}. Detect the currency (e.g. IDR/Rupiah if 'Juta' or 'Rp' is used) and use that currency for all estimates. Keep all suggestions, items, and renovation ideas within this financial constraint.` 
    : "";

  return ai.chats.create({
    model: CHAT_MODEL,
    history: history,
    config: {
      systemInstruction: `You are ReRoom, an expert interior design consultant AI. ${langInstruction}
      Your goal is to help users refine their room designs and plan their renovations.
      ${budgetInstruction}
      
      You have access to tools that can:
      1. Edit the room design image based on text instructions (e.g. "change the wall color to blue").
      2. Suggest shoppable furniture/decor items.
      3. Estimate renovation costs based on the visible elements.

      When a user asks to change something in the image, ALWAYS call the 'editRoom' function with a concise instruction.
      When a user asks where to buy items seen in the room or asks for recommendations, use 'suggestItems'.
      When a user asks for a price, budget, cost, or estimation, use 'estimateRenovationCost'.
      
      Be helpful, creative, and concise.`,
      tools: [
        {
          functionDeclarations: [
            {
              name: 'editRoom',
              description: 'Edit the current room design image based on a natural language instruction.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  instruction: {
                    type: Type.STRING,
                    description: 'The instruction for editing the image (e.g., "Add a yellow rug", "Make the walls brick").',
                  },
                },
                required: ['instruction'],
              },
            },
            {
              name: 'suggestItems',
              description: 'Suggest a list of shoppable furniture or decor items related to the design.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  items: {
                    type: Type.ARRAY,
                    description: 'List of recommended items.',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: 'Name of the item' },
                        description: { type: Type.STRING, description: 'Short description of the item' },
                      },
                      required: ['name', 'description'],
                    },
                  },
                },
                required: ['items'],
              },
            },
            {
              name: 'estimateRenovationCost',
              description: 'Calculate a rough renovation budget estimation broken down by categories (e.g., Furniture, Paint, Flooring).',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  currency: { type: Type.STRING, description: 'Currency symbol (e.g. $, IDR, €)' },
                  totalCostLow: { type: Type.NUMBER, description: 'Total estimated cost (low end)' },
                  totalCostHigh: { type: Type.NUMBER, description: 'Total estimated cost (high end)' },
                  disclaimer: { type: Type.STRING, description: 'Short disclaimer about estimation accuracy' },
                  categories: {
                    type: Type.ARRAY,
                    description: 'Breakdown of costs by category',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        categoryName: { type: Type.STRING, description: 'Name of category (e.g. Paint, Furniture)' },
                        items: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of specific items included' },
                        estimatedCostLow: { type: Type.NUMBER },
                        estimatedCostHigh: { type: Type.NUMBER }
                      },
                      required: ['categoryName', 'items', 'estimatedCostLow', 'estimatedCostHigh']
                    }
                  }
                },
                required: ['currency', 'totalCostLow', 'totalCostHigh', 'categories', 'disclaimer']
              }
            }
          ]
        }
      ]
    },
  });
};
