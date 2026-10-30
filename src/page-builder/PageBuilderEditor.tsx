import React, { useCallback, useMemo } from 'react';
import '../styles/global.css';
import '@wecre8websites/strapi-page-builder-react/editor.css';
import { Editor } from '@wecre8websites/strapi-page-builder-react';
import { createPageBuilderConfig } from './config';

interface Props {
  strapiUrl: string;
  strapiAdminOrigin: string;
  additionalContent: Record<string, any>;
}

/**
 * Visual editor shown inside Strapi's "Page Builder" sidebar iframe.
 * The licence key and API token stay on the Astro server (see /api/page-builder/*).
 */
export default function PageBuilderEditor({ strapiUrl, strapiAdminOrigin, additionalContent }: Props) {
  const config = useMemo(
    () => createPageBuilderConfig({ strapiImageUrl: strapiUrl, isEditor: true }),
    [strapiUrl]
  );

  // Support opening Strapi Admin via either localhost:1337 or 127.0.0.1:1337
  const resolvedParentOrigin = useMemo(() => {
    if (typeof document !== 'undefined' && document.referrer) {
      try {
        const refOrigin = new URL(document.referrer).origin;
        const allowed = new Set([
          strapiAdminOrigin,
          'http://localhost:1337',
          'http://127.0.0.1:1337',
        ]);
        if (allowed.has(refOrigin)) return refOrigin;
      } catch {
        // ignore invalid referrer
      }
    }
    return strapiAdminOrigin;
  }, [strapiAdminOrigin]);

  const validate = useCallback(async (token: string, origin: string) => {
    try {
      const res = await fetch('/api/page-builder/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, origin }),
      });
      return await res.json();
    } catch {
      return { ok: false as const, error: 'Unable to validate editor token' };
    }
  }, []);

  const resolve = useCallback(
    async (
      session: string,
      contentType: string,
      documentId: string,
      populate?: string | string[],
      locale?: string,
      pluralName?: string
    ) => {
      try {
        const res = await fetch('/api/page-builder/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session, contentType, documentId, populate, locale, pluralName }),
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? null;
      } catch {
        return null;
      }
    },
    []
  );

  return (
    <Editor
      config={config as any}
      strapi={{ url: `${strapiUrl}/api`, imageUrl: strapiUrl }}
      additionalContent={additionalContent}
      allowedParentOrigin={resolvedParentOrigin}
      validate={validate as any}
      resolve={resolve as any}
    />
  );
}
