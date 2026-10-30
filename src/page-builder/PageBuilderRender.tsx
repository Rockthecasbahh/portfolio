import React, { useMemo } from 'react';
import { Render } from '@puckeditor/core';
import { createPageBuilderConfig } from './config';

interface Props {
  data: any;
  metadata: Record<string, any>;
  strapiImageUrl: string;
}

/** Public renderer: Strapi Page Builder template -> the site's real components (SSR + hydrated). */
export default function PageBuilderRender({ data, metadata, strapiImageUrl }: Props) {
  const config = useMemo(() => createPageBuilderConfig({ strapiImageUrl }), [strapiImageUrl]);
  return <Render config={config as any} data={data} metadata={metadata} />;
}
