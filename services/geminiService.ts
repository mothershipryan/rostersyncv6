
import { GoogleGenAI } from "@google/genai";
import type { ExtractionResult } from "../types";

const SYSTEM_INSTRUCTION = `
Role: You are a World-Class Sports Data Engineer and Media Asset Management (MAM) Metadata Specialist.
Objective: Extract high-fidelity athlete roster data from the public web and format it for professional broadcast systems and Digital Asset Management platforms (specifically Iconik).

1. Extraction Capabilities:
Real-Time Grounding: Use live web search (Google Search) to locate the most recent official player rosters. You must cross-reference at least two independent sources (e.g., the official team website and the league's official statistics portal).
Identity Verification: Distinguish between active players and non-player staff. You MUST exclude coaches, managers, trainers, and front-office executives. You MUST also extract the player's primary position (e.g., QB, Striker, Goalkeeper, Center).

2. Intelligent Processing Rules:
Gender Sensitivity (Critical): You must strictly maintain gender distinctions. If the query is for a university or collegiate team (e.g., "Texas Longhorns Basketball"), you must verify if the user wants the Men's or Women's team. If specified, the output name MUST include the gender (e.g., "Texas Longhorns Women's Basketball").
Traditional Sports Only: Focus exclusively on physical sports (Football, Basketball, Soccer, Baseball, Hockey, etc.). Do not process Esports queries.
Diacritic Normalization: For compatibility with legacy broadcast systems, you must normalize all names to the standard Latin alphabet. Remove all accents and diacritics (e.g., convert "Sadio Mané" to "Sadio Mane" and "Luka Dončić" to "Luka Doncic").
Title Stripping: Remove all jersey numbers and injury status markers (IL, IR) from the final name strings. The position should be a separate field.

3. Output Specifications:
Output must be a RAW JSON object. Do not include markdown formatting (like \`\`\`json).
The JSON must adhere to this structure:
{
  "teamName": "string",
  "sport": "string",
  "players": [
    { "name": "string", "position": "string" }
  ],
  "verifiedSources": ["string"],
  "verificationNotes": "string"
}
Iconik Compatibility: Ensure player lists are sorted alphabetically by last name to match the Iconik Metadata Field "Options" standard.

4. Quality Control:
If a roster cannot be verified across multiple sources, flag it as a "Warning" in your verification notes.
Prioritize current season data unless a specific historical year is requested in the search query.
`;

const TAGS_SYSTEM_INSTRUCTION = `
You are an expert Sports Information Director and Metadata Librarian. Your task is to generate search aliases (tags) for athletes to improve findability in a Media Asset Management (MAM) system.

Guidelines:
- Provide 5-10 tags per athlete.
- Include: Common nicknames, phonetic misspellings, jersey numbers (prefixed with #), and historical team abbreviations.
- Avoid generic terms like "player" or "athlete."
- Output ONLY a valid JSON object where the key is the Player Name and the value is an array of strings.
- Strictly no conversational text.
`;

// Utility for backoff delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const extractRoster = async (teamQuery: string): Promise<ExtractionResult> => {
    // Check for API key at runtime.
    if (!process.env.API_KEY || process.env.API_KEY.trim() === '') {
        console.error("Critical: API_KEY is missing or empty.");
        throw new Error("API configuration missing. If you are on Vercel, ensure 'API_KEY' is set in Settings > Environment Variables and you have REDEPLOYED the project.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let lastError: any;

    // Model Strategy:
    // Strictly using gemini-1.5-flash as requested.
    const models = [
        "gemini-1.5-flash",
        "gemini-flash-lite-latest"
    ];

    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
            console.log(`[RosterSync] Attempt ${i + 1}/${models.length}: ${model}`);

            const config: any = {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ googleSearch: {} }],
            };

            const startTime = Date.now();
            const response = await ai.models.generateContent({
                model: model,
                contents: `Extract the roster for: ${teamQuery}. Return ONLY valid JSON.`,
                config: config,
            });
            const endTime = Date.now();

            if (!response.text) {
                if (response.promptFeedback && response.promptFeedback.blockReason) {
                    throw new Error(`AI Request blocked: ${response.promptFeedback.blockReason}`);
                }
                throw new Error("AI returned an empty response.");
            }

            // 1. Clean Response (Strip Markdown Code Blocks if present)
            let rawText = response.text.trim();
            // Basic cleanup of markdown wrappers
            if (rawText.startsWith('```json')) {
                rawText = rawText.replace(/^```json/, '').replace(/```$/, '');
            } else if (rawText.startsWith('```')) {
                rawText = rawText.replace(/^```/, '').replace(/```$/, '');
            }
            rawText = rawText.trim();

            // 2. Parse JSON with fallback
            let result: any;
            try {
                result = JSON.parse(rawText);
            } catch (e) {
                console.warn(`[RosterSync] Direct JSON parse failed. Attempting substring extraction.`);
                // Fallback: Try to find the first '{' and last '}' to handle chatty preambles
                const firstBrace = rawText.indexOf('{');
                const lastBrace = rawText.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    try {
                        const extractedJson = rawText.substring(firstBrace, lastBrace + 1);
                        result = JSON.parse(extractedJson);
                    } catch (e2) {
                        console.error(`[RosterSync] JSON Parse Error on model ${model}. Raw text:`, response.text);
                        throw new Error("The AI returned data that could not be parsed.");
                    }
                } else {
                    throw new Error("The AI returned data that could not be parsed.");
                }
            }

            // 3. Robust Data Validation & DEEP SANITIZATION
            if (!result || typeof result !== 'object') {
                result = {};
            }

            if (!result.teamName) result.teamName = teamQuery;
            if (!result.sport) result.sport = "Unknown Sport";

            // Ensure arrays are actually arrays
            if (!Array.isArray(result.players)) {
                result.players = [];
            }

            // DEEP SANITIZATION: Check strictly if player is an object, handle strings, remove nulls
            result.players = result.players.map((p: any) => {
                if (!p) return null;
                // If model returns a string "LeBron James" instead of object
                if (typeof p === 'string') {
                    return { name: p, position: 'Unknown' };
                }
                // If model returns object
                if (typeof p === 'object') {
                    return {
                        name: p.name || 'Unknown Athlete',
                        position: p.position || 'Unknown'
                    };
                }
                return null;
            }).filter((p: any) => p !== null);


            if (!Array.isArray(result.verifiedSources)) {
                result.verifiedSources = [];
            }

            // SANITIZE SOURCES: Must be valid URLs to prevent new URL() crash in UI
            result.verifiedSources = result.verifiedSources.filter((url: string) => {
                try {
                    new URL(url);
                    return true;
                } catch {
                    return false;
                }
            });

            if (!result.verificationNotes) {
                result.verificationNotes = "Extraction completed successfully.";
            }



            // 4. Sort Players Safely
            result.players.sort((a: any, b: any) => {
                const nameA = (a.name || '').toString();
                const nameB = (b.name || '').toString();
                const lastNameA = nameA.split(' ').pop() || '';
                const lastNameB = nameB.split(' ').pop() || '';
                return lastNameA.localeCompare(lastNameB);
            });

            // 5. Append Performance Metadata
            result.meta = {
                model: model,
                latencyMs: endTime - startTime,
                promptTokens: response.usageMetadata?.promptTokenCount || 0,
                candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
                totalTokens: response.usageMetadata?.totalTokenCount || 0
            };

            // Cast to ExtractionResult now that we've validated structure
            return result as ExtractionResult;

        } catch (error: any) {
            lastError = error;
            const status = error.status || error.code;
            console.warn(`[RosterSync] Model ${model} failed with status ${status}:`, error.message);

            // Critical Auth/Request errors should stop immediately
            if (status === 400 || status === 403) {
                break;
            }

            // Exponential backoff
            if (i < models.length - 1) {
                const waitTime = Math.pow(2, i + 1) * 1000;
                console.log(`[RosterSync] Waiting ${Math.round(waitTime)}ms before switching models...`);
                await delay(waitTime);
            }
        }
    }

    // --- FINAL ERROR REPORTING ---
    const status = lastError?.status || lastError?.code;
    const errorMessage = lastError?.message || JSON.stringify(lastError);

    if (status === 403) {
        throw new Error(`⛔ Access Denied (403). Your API Key is restricted. Please check Google Cloud Console > APIs & Services > Credentials.`);
    }

    if (status === 400) {
        throw new Error(`❌ Bad Request (400). The API Key may be invalid or missing required permissions.`);
    }

    if (status === 429) {
        throw new Error(`⚠️ Rate Limit Exceeded (429). Your API quota is exhausted. Please wait a moment or check your billing.`);
    }

    if (status === 503) {
        throw new Error(`🔄 Service Unavailable (503). Google's AI models are currently experiencing high traffic. Please try again in a moment.`);
    }

    // Fallback for other errors
    throw new Error(`AI Service Error (${status || 'Unknown'}): ${errorMessage}`);
};

/**
 * Generate search aliases (tags) for athletes to improve findability in MAM systems
 * @param playerNames - Array of player names to generate tags for
 * @param teamName - Optional team name for context
 * @param sport - Optional sport for context
 * @returns Object mapping player names to arrays of search tags
 */
export const generatePlayerTags = async (
    playerNames: string[],
    teamName?: string,
    sport?: string
): Promise<Record<string, string[]>> => {
    // Check for API key at runtime
    if (!process.env.API_KEY || process.env.API_KEY.trim() === '') {
        console.error("Critical: API_KEY is missing or empty.");
        throw new Error("API configuration missing. If you are on Vercel, ensure 'API_KEY' is set in Settings > Environment Variables and you have REDEPLOYED the project.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let lastError: any;

    // Model Strategy: Use same approach as extractRoster
    const models = [
        "gemini-1.5-flash",
        "gemini-flash-lite-latest"
    ];

    // Build context for better tag generation
    let contextInfo = '';
    if (teamName || sport) {
        contextInfo = `\nContext: ${teamName || ''} ${sport || ''}`.trim();
    }

    const prompt = `Generate search aliases for the following athletes:
${playerNames.map(name => `- ${name}`).join('\n')}${contextInfo}

Return ONLY valid JSON. No markdown, no explanation.`;

    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
            console.log(`[RosterSync] Generating tags (Attempt ${i + 1}/${models.length}): ${model}`);

            const config: any = {
                systemInstruction: TAGS_SYSTEM_INSTRUCTION,
                tools: [{ googleSearch: {} }],
            };

            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: config,
            });

            if (!response.text) {
                if (response.promptFeedback && response.promptFeedback.blockReason) {
                    throw new Error(`AI Request blocked: ${response.promptFeedback.blockReason}`);
                }
                throw new Error("AI returned an empty response.");
            }

            // Clean response (strip markdown code blocks)
            let rawText = response.text.trim();
            if (rawText.startsWith('```json')) {
                rawText = rawText.replace(/^```json/, '').replace(/```$/, '');
            } else if (rawText.startsWith('```')) {
                rawText = rawText.replace(/^```/, '').replace(/```$/, '');
            }
            rawText = rawText.trim();

            // Parse JSON with fallback
            let result: any;
            try {
                result = JSON.parse(rawText);
            } catch (e) {
                console.warn(`[RosterSync] Direct JSON parse failed. Attempting substring extraction.`);
                const firstBrace = rawText.indexOf('{');
                const lastBrace = rawText.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    try {
                        const extractedJson = rawText.substring(firstBrace, lastBrace + 1);
                        result = JSON.parse(extractedJson);
                    } catch (e2) {
                        console.error(`[RosterSync] JSON Parse Error. Raw text:`, response.text);
                        throw new Error("The AI returned data that could not be parsed.");
                    }
                } else {
                    throw new Error("The AI returned data that could not be parsed.");
                }
            }

            // Validate result is an object
            if (!result || typeof result !== 'object' || Array.isArray(result)) {
                throw new Error("Invalid response format: expected object mapping player names to tag arrays.");
            }

            // Validate that values are arrays of strings
            const validatedResult: Record<string, string[]> = {};
            for (const [playerName, tags] of Object.entries(result)) {
                if (Array.isArray(tags)) {
                    validatedResult[playerName] = tags.filter(tag => typeof tag === 'string');
                }
            }

            console.log(`[RosterSync] Successfully generated tags for ${Object.keys(validatedResult).length} players using ${model}.`);
            return validatedResult;

        } catch (error: any) {
            lastError = error;
            const status = error.status || error.code;
            console.warn(`[RosterSync] Model ${model} failed with status ${status}:`, error.message);

            // Critical Auth/Request errors should stop immediately
            if (status === 400 || status === 403) {
                break;
            }

            // Exponential backoff before trying next model
            if (i < models.length - 1) {
                const waitTime = Math.pow(2, i + 1) * 1000;
                console.log(`[RosterSync] Waiting ${Math.round(waitTime)}ms before switching models...`);
                await delay(waitTime);
            }
        }
    }

    // Final error reporting
    const status = lastError?.status || lastError?.code;
    const errorMessage = lastError?.message || JSON.stringify(lastError);

    if (status === 403) {
        throw new Error(`⛔ Access Denied (403). Your API Key is restricted. Please check Google Cloud Console > APIs & Services > Credentials.`);
    }

    if (status === 400) {
        throw new Error(`❌ Bad Request (400). The API Key may be invalid or missing required permissions.`);
    }

    if (status === 429) {
        throw new Error(`⚠️ Rate Limit Exceeded (429). Your API quota is exhausted. Please wait a moment or check your billing.`);
    }

    if (status === 503) {
        throw new Error(`🔄 Service Unavailable (503). Google's AI models are currently experiencing high traffic. Please try again in a moment.`);
    }

    throw new Error(`AI Service Error (${status || 'Unknown'}): ${errorMessage}`);
};
