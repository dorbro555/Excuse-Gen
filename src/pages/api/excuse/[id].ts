import type { APIRoute } from 'astro';
import { getExcuse } from '../../../lib/mockStore';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Excuse ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const record = getExcuse(id);

  if (!record) {
    return new Response(
      JSON.stringify({ error: 'Excuse not found in archive' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify(record),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    }
  );
};
