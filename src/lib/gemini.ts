import { GoogleGenAI } from '@google/genai';
import { generateMockExcuse } from './mockGenerator';
import type { GenerateExcusePayload } from './types';

// Read API key from Node process.env or Vite import.meta.env
const apiKey =
  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
  (import.meta.env && (import.meta.env as Record<string, string>)?.GEMINI_API_KEY) ||
  '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

const SYSTEM_INSTRUCTION = `You are the master satirist and chief scribe of "The Literary Broadside: Gazette of Social Indispositions" (established 1884).
Your mission is to compose unimpeachable, ornate, bespoke excuses for individuals seeking social absolution.

Parameters provided:
- Target: Who the excuse is for (e.g., Boss, Partner, Friends, Mother-in-Law).
- Scenario: The avoided obligation (e.g., Running late, Missing a meeting, Skipping a party, Forgot an anniversary).
- Tone: The specific rhetorical posture:
  1. "Plausible & Professional": Crisp corporate gravitas, diplomatic deflection, acute scheduling anomalies.
  2. "Overly Dramatic": 19th-century Victorian melodrama, gothic tragedy, existential calamities, apothecary seclusion.
  3. "Techno-Babble": Critical telemetry anomalies, quantum firmware corruption, kernel panics, packet loss.
  4. "Absolute Absurdity": Surrealist obstacles, municipal waterfowl embargoes, localized temporal dilation, street mime perimeters.

Requirements:
- Compose a 1 to 3 sentence literary evasion tailored specifically to the Target and Scenario.
- Keep the language rich, high-contrast, and performative.
- Provide an appropriate matching sign-off phrase (e.g., "With sincere professional regards,", "Yours in irrevocable sorrow,", "Held hostage by circumstance,").
- Output must be strict valid JSON matching the schema.`;

export interface GeneratedContentResult {
  excuse: string;
  signOff: string;
}

/**
 * Generates an excuse using Google Gen AI SDK (Gemini) or falls back to template engine if API key is absent.
 */
export async function generateExcuseWithGemini(
  payload: GenerateExcusePayload
): Promise<GeneratedContentResult> {
  // If no Gemini API key is configured, gracefully fall back to the mock generator
  if (!aiClient) {
    console.info(
      'ℹ️ [Gemini Service] GEMINI_API_KEY not found in environment. Using Literary Broadside mock engine.'
    );
    const mock = await generateMockExcuse(payload);
    return {
      excuse: mock.excuse,
      signOff: mock.signOff
    };
  }

  try {
    const prompt = `Compose an excuse with the following specifications:
Target: ${payload.target || 'General Acquaintance'}
Avoided Obligation: ${payload.scenario || 'An upcoming engagement'}
Rhetorical Tone: ${payload.tone || 'Plausible & Professional'}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            excuse: {
              type: 'STRING',
              description: 'The body of the excuse formatted in The Literary Broadside editorial style.'
            },
            signOff: {
              type: 'STRING',
              description: 'A matching stylized closing sign-off.'
            }
          },
          required: ['excuse', 'signOff']
        }
      }
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response received from Gemini API');
    }

    const parsed = JSON.parse(text) as GeneratedContentResult;
    if (!parsed.excuse || !parsed.signOff) {
      throw new Error('Incomplete JSON schema returned from Gemini');
    }

    return parsed;
  } catch (error) {
    console.warn(
      '⚠️ [Gemini Service] Gemini generation failed or rate limited; falling back to template engine:',
      error
    );
    const fallback = await generateMockExcuse(payload);
    return {
      excuse: fallback.excuse,
      signOff: fallback.signOff
    };
  }
}
