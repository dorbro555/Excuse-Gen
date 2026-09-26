import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import { generateExcuseWithGemini } from '../../lib/gemini';
import { saveExcuseRecord } from '../../lib/storage';
import type { ExcuseRecord, GenerateExcusePayload } from '../../lib/types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Expected application/json payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = (await request.json()) as Partial<GenerateExcusePayload>;
    const target = body.target?.trim() || 'Boss';
    const scenario = body.scenario?.trim() || 'Missing a meeting';
    const tone = body.tone?.trim() || 'Plausible & Professional';

    // 1. Generate unique URL-safe identifier
    const id = nanoid(8);

    // 2. Compose excuse via Google Gen AI SDK (Gemini)
    const { excuse, signOff } = await generateExcuseWithGemini({
      target,
      scenario,
      tone
    });

    const dateIssued = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());

    const excuseRecord: ExcuseRecord = {
      id,
      target,
      scenario,
      tone,
      excuse,
      signOff,
      dateIssued,
      createdAt: new Date().toISOString()
    };

    // 3. Persist to Netlify Blobs (or local fallback)
    await saveExcuseRecord(excuseRecord);

    return new Response(
      JSON.stringify({
        success: true,
        ...excuseRecord
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error('API /api/generate error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to compose excuse broadside'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
