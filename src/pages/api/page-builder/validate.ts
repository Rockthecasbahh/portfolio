import type { APIRoute } from 'astro';
import { validateEditorToken } from '@wecre8websites/strapi-page-builder-react/rsc';
import { PAGE_BUILDER_API_KEY, createEditorSession } from '../../../page-builder/server';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Validates the one-time editor token Strapi appends to the iframe URL against the licence server. */
export const POST: APIRoute = async ({ request }) => {
  if (!PAGE_BUILDER_API_KEY) {
    return json(
      { ok: false, error: 'STRAPI_PAGE_BUILDER_API_KEY is not set in the Astro environment (.env).' },
      200
    );
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const origin = typeof body?.origin === 'string' ? body.origin : '';

  const result = await validateEditorToken(PAGE_BUILDER_API_KEY, token, origin);
  if (!result.ok) return json(result);

  return json({ ok: true, session: createEditorSession() });
};
