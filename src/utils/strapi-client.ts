import { strapi } from '@strapi/client';

export const STRAPI_BASE_URL =
  import.meta.env.STRAPI_BASE_URL ||
  process.env.STRAPI_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:1337' : 'https://cms.matteocasling.com');

export const strapiClient = strapi({
  baseURL: `${STRAPI_BASE_URL}/api`,
});

/**
 * Resolves either a Strapi uploaded media URL (/uploads/...) or a local static asset path (/assets/...)
 */
export function getStrapiMediaUrl(
  mediaObj?: { url?: string | null } | null,
  fallbackPath?: string | null
): string {
  const rawUrl = mediaObj?.url || fallbackPath || '';
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  if (rawUrl.startsWith('/uploads/')) {
    return `${STRAPI_BASE_URL}${rawUrl}`;
  }
  return rawUrl;
}
