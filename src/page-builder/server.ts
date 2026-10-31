import crypto from 'node:crypto';
import { resolveAllData } from '@wecre8websites/strapi-page-builder-react/rsc';
import { createPageBuilderConfig, extractRoot3DOverrides } from './config';
import { interpolateTemplateValue } from './helpers';
import { STRAPI_BASE_URL } from '../utils/strapi-client';
import type { GlobalPageData, LandingPageData } from '../utils/types';

/** URL the visitor's browser uses to reach Strapi (uploads, admin). */
export const PUBLIC_STRAPI_URL: string =
  import.meta.env.PUBLIC_STRAPI_URL ||
  process.env.PUBLIC_STRAPI_URL ||
  (import.meta.env.PROD ? 'https://cms.matteocasling.com' : 'http://localhost:1337');

/** Page Builder API key from https://pagebuilder.wc8.io (server-side only, never sent to the browser). */
export const PAGE_BUILDER_API_KEY: string =
  import.meta.env.STRAPI_PAGE_BUILDER_API_KEY ||
  process.env.STRAPI_PAGE_BUILDER_API_KEY ||
  'b88aa5ad445af0080f9b4adfcb7b19c6';

/** Optional Strapi API token (read access) so the editor can resolve draft content. */
export const STRAPI_API_TOKEN: string =
  import.meta.env.STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || '';

/** Origin of the Strapi admin allowed to embed the editor. */
export const STRAPI_ADMIN_ORIGIN: string = (() => {
  try {
    return new URL(PUBLIC_STRAPI_URL).origin;
  } catch {
    return 'https://cms.matteocasling.com';
  }
})();

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function hmac(value: string): string {
  return crypto
    .createHmac('sha256', PAGE_BUILDER_API_KEY || 'page-builder-disabled')
    .update(value)
    .digest('hex');
}

/** Issues a short-lived signed editor session after the licence token was validated. */
export function createEditorSession(): string {
  const expires = String(Date.now() + SESSION_TTL_MS);
  return `${expires}.${hmac(expires)}`;
}

export function verifyEditorSession(session: unknown): boolean {
  if (!PAGE_BUILDER_API_KEY || typeof session !== 'string') return false;
  const [expires, sig] = session.split('.');
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  const expected = hmac(expires);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export interface TemplateRender {
  data: any;
  metadata: Record<string, any>;
  globalData: GlobalPageData;
}

/**
 * Resolves a Page Builder template (Strapi relations, handlebars) on the server so the public page
 * is server-rendered. Returns null when the page has no template (falls back to Dynamic Zone blocks).
 */
export async function buildTemplateRender(
  page: LandingPageData,
  globalData: GlobalPageData,
  extras: Record<string, any> = {}
): Promise<TemplateRender | null> {
  if (!page.templateJson || !Array.isArray(page.templateJson.content)) return null;

  try {
    const metadata = {
      title: page.title,
      description: page.description,
      studio3d: globalData.studio3d,
      ...extras,
    };
    const config = createPageBuilderConfig({ strapiImageUrl: PUBLIC_STRAPI_URL });
    const data = await resolveAllData(
      {
        url: `${STRAPI_BASE_URL}/api`,
        imageUrl: PUBLIC_STRAPI_URL,
        authToken: STRAPI_API_TOKEN || undefined,
      },
      page.templateJson,
      config as any,
      metadata
    );

    const rawRootProps = data?.root?.props || page.templateJson.root?.props;
    const resolvedRootProps = interpolateTemplateValue(rawRootProps, metadata);
    const resolvedData = resolvedRootProps
      ? {
          ...data,
          root: {
            ...(data?.root || {}),
            props: resolvedRootProps,
          },
        }
      : data;

    const overrides = extractRoot3DOverrides(resolvedRootProps);
    return {
      data: resolvedData,
      metadata,
      globalData: {
        ...globalData,
        studio3d: { ...globalData.studio3d, ...overrides },
      },
    };
  } catch (err) {
    console.error('[Page Builder] Failed to resolve template, using Dynamic Zone fallback:', err);
    return null;
  }
}
