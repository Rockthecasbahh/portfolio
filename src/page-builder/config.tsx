import React from 'react';
import type { Config } from '@wecre8websites/strapi-page-builder-react';
import StudioMotionRig3D from '../components/StudioMotionRig3D';
import { createIdentityAndPortfolioBlocks } from './blocks/IdentityAndPortfolioBlocks';
import { createCareerAndContactBlocks } from './blocks/CareerAndContactBlocks';
import { createContentAndLayoutBlocks } from './blocks/ContentAndLayoutBlocks';
import { createNavigationBlocks } from './blocks/NavigationBlocks';

export interface PageBuilderConfigOptions {
  /** Base URL used to resolve Strapi `/uploads/...` media (e.g. http://localhost:1337). */
  strapiImageUrl?: string;
  /** In the editor preview the root renders the 3D rig itself; on the public site BaseLayout does. */
  isEditor?: boolean;
}

/** Root-level 3D rig props that can be overridden per page from the Page Builder sidebar. */
export const ROOT_3D_KEYS = [
  'cameraRigScale',
  'videoLightIntensity',
  'videoLightColor',
  'sceneOffsetX',
  'sceneOffsetY',
  'scrollMorphIntensity',
] as const;

export function extractRoot3DOverrides(rootProps: Record<string, any> | undefined) {
  const out: Record<string, any> = {};
  if (!rootProps) return out;
  for (const key of ROOT_3D_KEYS) {
    const v = rootProps[key];
    if (v === undefined || v === null || v === '') continue;
    out[key] = key === 'videoLightColor' ? String(v) : Number(v);
  }
  if (rootProps.showTopographicContours !== undefined) {
    out.showTopographicContours =
      rootProps.showTopographicContours === true || rootProps.showTopographicContours === 'true';
  }
  return out;
}

export function createPageBuilderConfig({
  strapiImageUrl = 'http://localhost:1337',
  isEditor = false,
}: PageBuilderConfigOptions = {}): Config {
  const navigation = createNavigationBlocks();
  const identity = createIdentityAndPortfolioBlocks(strapiImageUrl);
  const career = createCareerAndContactBlocks(strapiImageUrl);
  const content = createContentAndLayoutBlocks(strapiImageUrl);

  return {
    categories: {
      navigation: {
        title: 'Header & Navigation',
        components: ['HeaderNavigation', 'FooterBlock'],
        defaultExpanded: true,
      },
      identity: {
        title: 'Identity & Hero',
        components: ['HeroStratum', 'LogoWall', 'EducationSkillsStratum'],
        defaultExpanded: true,
      },
      portfolio: {
        title: 'Portfolio (Strapi Projects)',
        components: ['HorizontalShowreel', 'PortfolioChapters', 'SingleProjectSpotlight'],
        defaultExpanded: true,
      },
      career: {
        title: 'Career & Contact',
        components: ['ExperienceCascade', 'DossierContact'],
      },
      content: {
        title: 'Content',
        components: ['SectionHeading', 'CardsGrid', 'ContentWithImage', 'MarkdownBlock'],
      },
      layout: {
        title: 'Layout',
        components: ['TopoColumns', 'Spacer'],
      },
    },
    components: {
      ...navigation,
      ...identity,
      ...career,
      ...content,
    } as any,
    root: {
      fields: {
        title: { type: 'text', label: 'Page Title (SEO)' },
        cameraRigScale: { type: 'slider', label: '3D Camera Rig Scale', min: 0.6, max: 1.8, step: 0.05 },
        videoLightIntensity: { type: 'slider', label: '3D Video Light Intensity', min: 0, max: 6, step: 0.1 },
        videoLightColor: { type: 'color', label: '3D Video Light Colour' },
        sceneOffsetX: { type: 'slider', label: '3D Scene Offset X', min: -4, max: 4, step: 0.05 },
        sceneOffsetY: { type: 'slider', label: '3D Scene Offset Y', min: -2, max: 2, step: 0.05 },
        scrollMorphIntensity: { type: 'slider', label: '3D Scroll Morph Intensity', min: 0, max: 2, step: 0.05 },
        showTopographicContours: {
          type: 'radio',
          label: 'Topographic Contour Lines',
          options: [
            { label: 'Show', value: 'true' },
            { label: 'Hide', value: 'false' },
          ],
        },
      } as any,
      defaultProps: {
        title: '',
        cameraRigScale: 1.15,
        videoLightIntensity: 3.0,
        videoLightColor: '#d9ebf4',
        sceneOffsetX: 2.55,
        sceneOffsetY: -0.1,
        scrollMorphIntensity: 1.15,
        showTopographicContours: 'true',
      } as any,
      render: ({ children, puck, ...rootProps }: any) => {
        if (!isEditor) return <>{children}</>;
        const baseSettings = puck?.metadata?.studio3d || {};
        const settings = { ...baseSettings, ...extractRoot3DOverrides(rootProps) };
        return (
          <>
            <StudioMotionRig3D settings={settings} />
            <div className="relative z-10">{children}</div>
          </>
        );
      },
    },
  } as Config;
}
