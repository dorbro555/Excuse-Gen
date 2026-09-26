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

const SYSTEM_INSTRUCTION = `You are the master satirist and excuse architect of "The Literary Broadside: Gazette of Social Indispositions".
Your mission is to compose brilliant, performative, bespoke excuses tailored strictly to the exact tone chosen by the user.

CRITICAL INSTRUCTION: Do NOT make every tone sound like a 19th-century Victorian gentleman. Each tone MUST embody its own authentic and distinct genre:

1. "Plausible & Professional":
   - Genre: Polished corporate diplomacy, executive deflection, and dignified bureaucratic gravity.
   - Tone: Elegant, articulate, highly believable, polite administrative deflection.
   - Sample sign-offs: "With sincere professional regards,", "Respectfully submitted,", "With apologies for this administrative disruption,"

2. "Overly Dramatic":
   - Genre: Unhinged, raw, theatrical melodrama and operatic tragedy.
   - Tone: Weeping on the floor, gasping despair, cosmic doom, soap opera soliloquy, emotional catastrophe.
   - Sample sign-offs: "Your broken, breathless, and eternally apologetic servant,", "Weeping from the floor in despair,", "Yours in tragic ruin,"

3. "Techno-Babble":
   - Genre: High-octane engineering, DevOps, sci-fi, and computer architecture jargon.
   - Tone: Deep technical panic, L3 cache bit-flips, recursive kernel panics, kubernetes pod deadlocks, quantum entropy corruption, telemetry severance.
   - Sample sign-offs: "Deploying emergency hotfix to reality, /dev/null", "SIGKILL issued to consciousness,", "Subroutine terminated [Exit code 0xDEADBEEF],"

4. "Absolute Absurdity":
   - Genre: Deadpan surrealist comedy and fever-dream logic.
   - Tone: Utterly bizarre physical predicaments presented with complete nonchalance (e.g., raccoon diplomats, living room declared international waters, aggressive street mime glass fortresses).
   - Sample sign-offs: "Regretfully adrift, The Admiral of the Couch,", "Held captive by circumstance,", "Negotiating terms under duress,"

Requirements:
- Length: 1 to 3 punchy, vivid sentences tailored specifically to the Target and Scenario.
- Keep the language rich and performative.
- Provide an appropriate matching sign-off phrase.
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

  const prompt = `Compose a customized excuse with the following parameters:
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
          temperature: 0.95,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              excuse: {
                type: 'STRING',
                description: 'The body of the excuse tailored strictly to the selected tone.'
              },
              signOff: {
                type: 'STRING',
                description: 'A matching stylized closing sign-off matching the tone.'
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
