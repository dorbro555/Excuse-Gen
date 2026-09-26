import { GoogleGenAI } from '@google/genai';
import { generateMockExcuse } from './mockGenerator';
import type { GenerateExcusePayload } from './types';

function getApiKey(): string {
  // Check process.env (Node / SSR runtime)
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }
  // Check import.meta.env (Vite / Astro runtime)
  if (import.meta.env && (import.meta.env as Record<string, string>)?.GEMINI_API_KEY) {
    return (import.meta.env as Record<string, string>).GEMINI_API_KEY.trim();
  }
  return '';
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

// Priority ordered: gemini-3.1-flash-lite has active free-tier quota and lowest latency
const MODELS_TO_TRY = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

/**
 * Generates an excuse using Google Gen AI SDK (Gemini) with multi-model resilience and local fallback.
 */
export async function generateExcuseWithGemini(
  payload: GenerateExcusePayload
): Promise<GeneratedContentResult> {
  const apiKey = getApiKey();

  // If no Gemini API key is configured, gracefully fall back to the mock generator
  if (!apiKey) {
    console.info(
      'ℹ️ [Gemini Service] GEMINI_API_KEY not found in environment. Using Literary Broadside mock engine.'
    );
    const mock = await generateMockExcuse(payload);
    return {
      excuse: mock.excuse,
      signOff: mock.signOff
    };
  }

  const prompt = `Compose an excuse with the following specifications:
Target: ${payload.target || 'General Acquaintance'}
Avoided Obligation: ${payload.scenario || 'An upcoming engagement'}
Rhetorical Tone: ${payload.tone || 'Plausible & Professional'}`;

  const aiClient = new GoogleGenAI({ apiKey });

  for (const model of MODELS_TO_TRY) {
    try {
      const response = await aiClient.models.generateContent({
        model,
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
        throw new Error(`Empty response from ${model}`);
      }

      const parsed = JSON.parse(text) as GeneratedContentResult;
      if (!parsed.excuse || !parsed.signOff) {
        throw new Error(`Incomplete JSON schema returned from ${model}`);
      }

      console.info(`✅ [Gemini Service] Successfully generated excuse using model: ${model}`);
      return parsed;
    } catch (error: any) {
      console.warn(
        `⚠️ [Gemini Service] Model ${model} generation attempt failed:`,
        error?.message || error
      );
      // Continue to next model in MODELS_TO_TRY
    }
  }

  // Graceful fallback to broadside template generator if all API attempts failed
  console.info('ℹ️ [Gemini Service] Falling back to Literary Broadside template engine.');
  const fallback = await generateMockExcuse(payload);
  return {
    excuse: fallback.excuse,
    signOff: fallback.signOff
  };
}
