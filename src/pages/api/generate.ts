import type { APIRoute } from 'astro';
import { generateMockExcuse } from '../../lib/mockGenerator';
import { saveExcuse } from '../../lib/mockStore';
import type { GenerateExcusePayload } from '../../lib/types';

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

    // Generate excuse with simulated OpenRouter AI latency
    const excuseRecord = await generateMockExcuse({ target, scenario, tone });

    // Save to local mock store
    saveExcuse(excuseRecord);

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
