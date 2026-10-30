import type { APIRoute } from 'astro';
import { STRAPI_BASE_URL } from '../../../utils/strapi-client';
import { STRAPI_API_TOKEN, verifyEditorSession } from '../../../page-builder/server';

export const prerender = false;

const PATTERNS = {
  contentType: /^[\w.:-]{1,100}$/,
  documentId: /^[\w-]{1,100}$/,
  populate: /^[\w[\].,=*-]{1,300}$/,
  locale: /^[A-Za-z_-]{1,20}$/,
  pluralName: /^[\w-]{1,60}$/,
};

const pluralize = (s: string) =>
  /[^aeiou]y$/i.test(s) ? s.slice(0, -1) + 'ies' : /(s|x|z|ch|sh)$/i.test(s) ? s + 'es' : s + 's';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Resolves a Strapi entry for the editor's "Strapi content" fields, gated by a signed editor session. */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || !verifyEditorSession(body.session)) return json({ data: null }, 401);

  const { contentType, documentId, populate, locale, pluralName } = body;
  const populateList: string[] =
    populate === undefined ? [] : Array.isArray(populate) ? populate : [populate];

  const valid =
    PATTERNS.contentType.test(contentType || '') &&
    PATTERNS.documentId.test(documentId || '') &&
    populateList.every((p) => typeof p === 'string' && PATTERNS.populate.test(p)) &&
    (!locale || PATTERNS.locale.test(locale)) &&
    (!pluralName || PATTERNS.pluralName.test(pluralName));
  if (!valid) return json({ data: null }, 400);

  const singular = String(contentType).split('::')[1]?.split('.')[0] || contentType;
  const url = new URL(`${STRAPI_BASE_URL}/api/${pluralName || pluralize(singular)}/${documentId}`);

  if (populateList.length) {
    for (const p of populateList) {
      const [k, v] = p.split('=');
      if (k && v) url.searchParams.append(k, v);
    }
  } else {
    url.searchParams.append('populate', '*');
  }
  if (locale) url.searchParams.append('locale', locale);

  try {
    const res = await fetch(url, {
      headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : undefined,
    });
    if (!res.ok) return json({ data: null }, res.status === 404 ? 404 : 502);
    const payload = await res.json();
    return json({ data: payload?.data ?? null });
  } catch {
    return json({ data: null }, 502);
  }
};
