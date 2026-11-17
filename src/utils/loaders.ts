import { strapiClient, getStrapiMediaUrl } from './strapi-client';
import type {
  GlobalPageData,
  LandingPageData,
  PageBuilderTemplateJson,
  ProjectItem,
  ExperienceItem,
  BlockData,
} from './types';
import {
  getProfile as getFallbackProfile,
  getStudio3DSettings as getFallbackStudio3D,
  getProjects as getFallbackProjects,
  getExperiences as getFallbackExperiences,
} from '../lib/cms';

export const blocksPopulate = {
  on: {
    'blocks.hero-stratum': {
      populate: {
        portraitImage: {
          fields: ['url', 'alternativeText'],
        },
        primaryCta: true,
        secondaryCta: true,
      },
    },
    'blocks.logo-wall': {
      populate: {
        logos: {
          populate: {
            image: {
              fields: ['url', 'alternativeText'],
            },
          },
        },
      },
    },
    'blocks.education-skills-stratum': {
      populate: {
        metrics: true,
        educationItems: true,
        softwareMeters: true,
      },
    },
    'blocks.horizontal-showreel': {
      populate: {
        projects: {
          populate: {
            coverImage: {
              fields: ['url', 'alternativeText'],
            },
            tools: true,
          },
        },
      },
    },
    'blocks.portfolio-chapters': {
      populate: {
        chapters: true,
        projects: {
          populate: {
            coverImage: {
              fields: ['url', 'alternativeText'],
            },
            tools: true,
          },
        },
      },
    },
    'blocks.experience-cascade': {
      populate: {
        experiences: {
          populate: {
            logoImage: {
              fields: ['url', 'alternativeText'],
            },
            highlights: true,
          },
        },
      },
    },
    'blocks.dossier-contact': {
      populate: {
        dossierCards: true,
        primaryCta: true,
        secondaryCta: true,
      },
    },
    'blocks.heading-section': true,
    'blocks.card-grid': {
      populate: {
        cards: true,
      },
    },
    'blocks.content-with-image': {
      populate: {
        image: {
          fields: ['url', 'alternativeText'],
        },
        link: true,
      },
    },
    'blocks.markdown': true,
  },
};

export function normalizeStrapiProject(raw: any): ProjectItem {
  const coverUrl = getStrapiMediaUrl(raw?.coverImage, raw?.thumbnail);
  const toolsList: string[] = Array.isArray(raw?.tools)
    ? raw.tools
        .map((t: any) => (typeof t === 'string' ? t : t?.name || ''))
        .filter(Boolean)
    : [];

  return {
    slug: raw?.slug || '',
    title: raw?.title || '',
    chapterNumber: raw?.chapterNumber || '01',
    category: raw?.category || 'video',
    madeFor: raw?.madeFor || '',
    year: raw?.year || '2024',
    location: raw?.location || '',
    track: raw?.track || 'both',
    featuredInReel: Boolean(raw?.featuredInReel),
    sortOrder: raw?.sortOrder ?? 99,
    shortDescription: raw?.shortDescription || '',
    mandateChallenge: raw?.mandateChallenge || '',
    executionCraft: raw?.executionCraft || '',
    impactMetric: raw?.impactMetric || '',
    thumbnail: coverUrl || raw?.thumbnail || '',
    secondaryImage: raw?.secondaryImage || '',
    videoYoutubeId: raw?.videoYoutubeId || '',
    externalUrl: raw?.externalUrl || '',
    externalLabel: raw?.externalLabel || 'View Project',
    tools: toolsList,
  };
}

export function getReadableLogoUrl(
  logoPath?: string | null,
  orgShort?: string,
  orgName?: string
): string {
  if (!logoPath && !orgShort && !orgName) return '';
  const path = (logoPath || '').toLowerCase();
  const org = `${orgShort || ''} ${orgName || ''}`.toLowerCase();

  // IAEA logo: always high-contrast navy logo
  if (path.includes('iaea') || org.includes('iaea')) {
    return '/assets/logos/iaea-fao-navy.png';
  }

  // IFAD logo: always high-contrast dark logo
  if (path.includes('ifad') || org.includes('ifad')) {
    return '/assets/logos/ifad.png';
  }

  if (!logoPath) return '';

  // Strip white suffix variants if present (e.g. -white.png, _white_xxxx.png, -white-xxxx.png)
  return logoPath.replace(/[-_]white(?:[-_a-z0-9]+)?\.png$/i, '.png');
}

export interface SkillTier {
  name: string;
  tags: string[];
}

export const DEFAULT_SKILL_TIERS: SkillTier[] = [
  {
    name: 'Primary Craft',
    tags: [
      'Documentary Production',
      'Location Directing',
      '2D/3D Motion Direction',
      'Blender 3D & Unreal Engine 5',
      'After Effects & Premiere Pro',
      'Sound Mastering',
    ],
  },
  {
    name: 'Technical & Web',
    tags: [
      'Drupal 10 & WordPress',
      'HTML5 / CSS3 / JS',
      'Astro & React',
      'Python',
      'Information Architecture',
    ],
  },
  {
    name: 'Strategy & Reach',
    tags: [
      'Campaign Strategy',
      'UN Policy Communications',
      'Digital Analytics',
      'Paid Media (Google & Meta Ads)',
      'Press Engagement',
    ],
  },
];

export function filterUniversityEducation<T extends { degree?: string; school?: string }>(
  items: T[] = []
): T[] {
  return items.filter(
    (edu) => !/liceo|scuola superiore|high school/i.test(`${edu?.degree || ''} ${edu?.school || ''}`)
  );
}

export function cleanSkillsHeading(heading?: string): string {
  return (heading || 'Core Capabilities & Technical Stack').replace(/\\+$/, '').trim() || 'Core Capabilities & Technical Stack';
}

export function buildSkillTiers(
  softwareMeters?: Array<{ name?: string; subtitle?: string }>
): SkillTier[] {
  const list = Array.isArray(softwareMeters) ? softwareMeters : [];
  const hasTierFormat = list.some((s) => s?.name === 'Primary Craft');
  if (!hasTierFormat) return DEFAULT_SKILL_TIERS;

  return list
    .map((sw) => ({
      name: String(sw?.name || '').trim(),
      tags: String(sw?.subtitle || '')
        .split(/[·,]/)
        .map((t) => t.trim().replace(/\b3d\b/gi, '3D'))
        .filter(Boolean),
    }))
    .filter((tier) => tier.name && tier.tags.length > 0);
}

export function normalizeStrapiExperience(raw: any): ExperienceItem {
  const rawLogo = getStrapiMediaUrl(raw?.logoImage, raw?.logoPath);
  const cleanLogo = getReadableLogoUrl(rawLogo, raw?.organizationShort, raw?.organization);

  const bulletList: string[] = Array.isArray(raw?.highlights)
    ? raw.highlights
        .map((h: any) => (typeof h === 'string' ? h : h?.text || ''))
        .filter(Boolean)
    : [];

  return {
    roleSlug: raw?.slug || raw?.roleSlug || '',
    roleTitle: raw?.roleTitle || '',
    organization: raw?.organization || '',
    organizationShort: raw?.organizationShort || '',
    location: raw?.location || '',
    period: raw?.period || '',
    sortOrder: raw?.sortOrder ?? 99,
    logoPath: cleanLogo,
    trackHighlight: raw?.trackHighlight || '',
    highlights: bulletList,
  };
}

function buildFallbackGlobalData(): GlobalPageData {
  const profile = getFallbackProfile();
  const studio3d = getFallbackStudio3D();
  return {
    title: 'Matteo Casling — Senior Multimedia Producer & Communications Strategist',
    description:
      'Portfolio of Matteo Casling: Senior Multimedia Producer, 3D/Motion Systems Designer (Blender 3D, Unreal Engine 5, After Effects), and Strategic Communications Specialist (UN DESA, IAEA, FAO, IFAD, PBS News).',
    header: {
      monogram: 'MC',
      fullName: 'Matteo Casling',
      navItems: [
        { label: '01 SHOWREEL', href: '#showreel', isExternal: false, isButtonLink: false, type: 'GHOST' },
        { label: '02 CASE STUDIES', href: '#work', isExternal: false, isButtonLink: false, type: 'GHOST' },
        { label: '03 EXPERIENCE', href: '#experience', isExternal: false, isButtonLink: false, type: 'GHOST' },
        { label: '04 PUBLICATIONS', href: '#documents', isExternal: false, isButtonLink: false, type: 'GHOST' },
      ],
      cmsCta: null,
      primaryCta: {
        label: 'Contact',
        href: '#documents',
        isExternal: false,
        isButtonLink: true,
        type: 'PRIMARY',
      },
    },
    footer: {
      copyrightName: '© 2026 Matteo Casling · Senior Multimedia Producer & Communications Strategist',
      links: [
        { label: 'Back to Top', href: '#top', isExternal: false, isButtonLink: false, type: 'GHOST' },
        { label: 'Direct Email', href: `mailto:${profile.email}`, isExternal: false, isButtonLink: false, type: 'GHOST' },
        { label: 'CV (PDF)', href: '/documents/Matteo_Casling_CV.pdf', isExternal: true, isButtonLink: false, type: 'GHOST' },
        { label: 'Portfolio Book (PDF)', href: '/documents/Matteo_Casling_Portfolio_Book.pdf', isExternal: true, isButtonLink: false, type: 'GHOST' },
      ],
    },
    studio3d: {
      ...studio3d,
      showTopographicContours: true,
    },
  };
}

function buildFallbackLandingPage(): LandingPageData {
  const profile = getFallbackProfile();
  const blocks: BlockData[] = [
    {
      __component: 'blocks.hero-stratum',
      taglineBadge: profile.tagline,
      fullName: 'Matteo Casling',
      quoteText:
        'Six years translating global policy, development finance, and climate science into documentary cinema, Blender 3D animations, and Drupal 10 platforms.',
      portraitImageUrl: '/assets/matteo-portrait-cutout.webp',
      primaryCta: {
        label: 'Explore Case Studies',
        href: '#work',
        isExternal: false,
        isButtonLink: true,
        type: 'PRIMARY',
      },
      secondaryCta: {
        label: 'Download CV',
        href: '/documents/Matteo_Casling_CV.pdf',
        isExternal: true,
        isButtonLink: true,
        type: 'SECONDARY',
      },
      floatingArtifactTitle: '3D & Motion Showreel',
      floatingArtifactSubtitle: 'Blender 3D · Unreal 5 · GSAP',
      floatingArtifactHref: '#showreel',
      floatingArtifactImageUrl: '/assets/projects/locust-3d-sculpture.png',
    },
    {
      __component: 'blocks.logo-wall',
      ariaLabel: 'United Nations Agencies and Broadcast Partners',
      logos: [
        { name: 'UN DESA', alt: 'UN DESA', imageUrl: '/assets/logos/un-desa.png' },
        { name: 'FAO / IAEA', alt: 'Joint FAO/IAEA Centre', imageUrl: '/assets/logos/iaea-fao-navy.png' },
        { name: 'FAO', alt: 'FAO', imageUrl: '/assets/logos/fao.png' },
        { name: 'IFAD', alt: 'IFAD', imageUrl: '/assets/logos/ifad.png' },
        { name: 'CIME', alt: 'CIME', imageUrl: '/assets/logos/cime.png' },
        { name: 'PBS News', alt: 'PBS News', imageUrl: '/assets/logos/pbs.png' },
        { name: 'John Cabot University', alt: 'John Cabot University', imageUrl: '/assets/logos/jcu.png' },
      ],
    },
    {
      __component: 'blocks.horizontal-showreel',
      sectionId: 'showreel',
      eyebrow: '01 · Flagship Showreel',
      heading: 'Documentary Cinema & 3D Motion',
      subHeading:
        'Scroll horizontally through flagship UN documentaries, COP28 summit films, and Blender 3D scientific visualizations.',
      onlyFeatured: true,
    },
    {
      __component: 'blocks.portfolio-chapters',
      sectionId: 'work',
      eyebrow: '02 · Case Studies & Production Archive',
      heading: 'Selected Case Studies',
      subHeading:
        'Filter by medium or explore all five production chapters — each paired with plain-English summaries, mandate context, and production tools.',
      defaultTrackFilter: 'all',
    },
    {
      __component: 'blocks.card-grid',
      sectionId: 'capabilities',
      subHeading: 'Capabilities & How I Work',
      heading: 'Production Toolkit & Advisory Scope',
      stratumTheme: 'ice',
      cards: [
        {
          badge: '01 · DOCUMENTARY & FIELD PRODUCTION',
          heading: 'Documentary & Field Storytelling',
          subHeading: 'COP28, UN DESA & Broadcast Cinema',
          text: 'End-to-end location directing, multilingual field interviews, and high-retention policy documentaries for global summits and UN agencies.',
          href: '#chapter-01',
        },
        {
          badge: '02 · 2D/3D MOTION DIRECTION',
          heading: '2D/3D Motion & Scientific Visualization',
          subHeading: 'Blender 3D · Unreal Engine 5 · After Effects',
          text: 'Custom 3D modeling, procedural shaders, and modular motion graphics that turn complex technical and biological processes into clear visual narratives.',
          href: '#chapter-02',
        },
        {
          badge: '03 · DIGITAL PLATFORMS & CAMPAIGNS',
          heading: 'Digital Knowledge Portals & Strategy',
          subHeading: 'Drupal 10 · Astro · Multilingual Outreach',
          text: 'Full-stack institutional platforms, high-impact scrollytelling features (3M+ views), and data-driven communications strategies.',
          href: '#chapter-04',
        },
      ],
    },
    {
      __component: 'blocks.experience-cascade',
      sectionId: 'experience',
      heading: 'Work Experience',
      subHeading:
        'Six years of end-to-end multimedia production, location directing, 3D animation, and Drupal/WordPress web architecture across United Nations agencies and broadcast news.',
    },
    {
      __component: 'blocks.education-skills-stratum',
      sectionId: 'education-skills',
      metrics: profile.metrics.map((m, i) => ({
        ...m,
        theme: i % 2 === 0 ? 'paper' : 'cobalt',
      })),
      educationHeading: 'Education',
      educationItems: [
        {
          degree: 'MA Marketing, Buying Behaviour and Digital Communication',
          school: 'John Cabot University',
          years: '2019–2020',
        },
        {
          degree: 'Bachelor of Arts in Communications',
          school: 'John Cabot University',
          years: '2014–2017',
        },
      ],
      skillsHeading: 'Core Capabilities & Technical Stack',
      softwareMeters: profile.softwareMeters,
    },
    {
      __component: 'blocks.dossier-contact',
      sectionId: 'documents',
      heading: 'Publications, CVs & Direct Contact',
      description:
        "Download Matteo's styled PDF CVs and 13-page portfolio book, copy the direct studio email, or send a project inquiry below.",
      availabilityText:
        'Based in New York (EST) · Available for select UN P3/P4 consultancies, 3D motion direction, and senior roles',
      dossierCards: [
        {
          title: 'UN & Policy CV',
          subtitle: 'Styled Topographic PDF',
          href: '/documents/Matteo_Casling_CV.pdf',
          iconType: 'pdf',
        },
        {
          title: 'Motion & Tech CV',
          subtitle: 'Video / 3D / Code PDF',
          href: '/documents/Matteo_Casling_CV_Tech_Motion.pdf',
          iconType: 'film',
        },
        {
          title: 'Un-Portfolio Book',
          subtitle: '13-Page Editorial PDF',
          href: '/documents/Matteo_Casling_Portfolio_Book.pdf',
          iconType: 'browser',
        },
      ],
      contactHeading: 'Direct Contact',
      email: profile.email,
      phone: '',
      location: profile.location,
      linkedinLabel: 'in/matteo-louis-casling',
      linkedinUrl: 'https://www.linkedin.com/in/matteo-louis-casling-7285a8150/',
      primaryCta: {
        label: 'Email Matteo',
        href: `mailto:${profile.email}`,
        isExternal: false,
        isButtonLink: true,
        type: 'PRIMARY',
      },
      secondaryCta: {
        label: 'LinkedIn Profile',
        href: 'https://www.linkedin.com/in/matteo-louis-casling-7285a8150/',
        isExternal: true,
        isButtonLink: true,
        type: 'SECONDARY',
      },
    },
  ];

  const templateJson: PageBuilderTemplateJson = {
    root: {
      props: {
        title: 'Matteo Casling — Senior Multimedia Producer & Communications Strategist',
        showTopographicContours: 'true',
        cameraRigScale: 1.15,
        videoLightIntensity: 3.0,
        videoLightColor: '#d9ebf4',
      },
    },
    zones: {},
    content: [
      {
        type: 'HeaderNavigation',
        props: {
          id: 'HeaderNavigation-main',
          monogram: 'MC',
          fullName: 'Matteo Casling',
          homeHref: '/#top',
          navItems: [
            { label: '01 SHOWREEL', href: '#showreel', isExternal: 'false' },
            { label: '02 CASE STUDIES', href: '#work', isExternal: 'false' },
            { label: '03 EXPERIENCE', href: '#experience', isExternal: 'false' },
            { label: '04 PUBLICATIONS', href: '#documents', isExternal: 'false' },
          ],
          showCmsButton: 'false',
          cmsCta: {
            label: 'Strapi CMS',
            href: 'https://cms.matteocasling.com/admin',
            isExternal: 'true',
          },
          showPrimaryCta: 'true',
          primaryCta: {
            label: 'Contact',
            href: '#documents',
            isExternal: 'false',
          },
          isSticky: 'true',
        },
      },
      {
        type: 'HeroStratum',
        props: {
          id: 'HeroStratum-home-1',
          taglineBadge: profile.tagline,
          fullName: 'Matteo Casling',
          quoteText:
            'Six years translating global policy, development finance, and climate science into documentary cinema, Blender 3D animations, and Drupal 10 platforms.',
          portraitImage: '/assets/matteo-portrait-cutout.webp',
          primaryCta: {
            label: 'Explore Case Studies',
            href: '#work',
            isExternal: 'false',
          },
          secondaryCta: {
            label: 'Download CV',
            href: '/documents/Matteo_Casling_CV.pdf',
            isExternal: 'true',
          },
          floatingArtifactTitle: '3D & Motion Showreel',
          floatingArtifactSubtitle: 'Blender 3D · Unreal 5 · GSAP',
          floatingArtifactHref: '#showreel',
          floatingArtifactImage: '/assets/projects/locust-3d-sculpture.png',
        },
      },
      {
        type: 'LogoWall',
        props: {
          id: 'LogoWall-home-1',
          ariaLabel: 'United Nations Agencies and Broadcast Partners',
          logos: [
            { name: 'UN DESA', alt: 'UN DESA', imageUrl: '/assets/logos/un-desa.png' },
            { name: 'FAO / IAEA', alt: 'Joint FAO/IAEA Centre', imageUrl: '/assets/logos/iaea-fao-navy.png' },
            { name: 'FAO', alt: 'FAO', imageUrl: '/assets/logos/fao.png' },
            { name: 'IFAD', alt: 'IFAD', imageUrl: '/assets/logos/ifad.png' },
            { name: 'CIME', alt: 'CIME', imageUrl: '/assets/logos/cime.png' },
            { name: 'PBS News', alt: 'PBS News', imageUrl: '/assets/logos/pbs.png' },
            { name: 'John Cabot University', alt: 'John Cabot University', imageUrl: '/assets/logos/jcu.png' },
          ],
        },
      },
      {
        type: 'HorizontalShowreel',
        props: {
          id: 'HorizontalShowreel-home-1',
          sectionId: 'showreel',
          eyebrow: '01 · Flagship Showreel',
          heading: 'Documentary Cinema & 3D Motion',
          subHeading:
            'Scroll horizontally through flagship UN documentaries, COP28 summit films, and Blender 3D scientific visualizations.',
          onlyFeatured: 'true',
          pinnedProjects: [],
        },
      },
      {
        type: 'PortfolioChapters',
        props: {
          id: 'PortfolioChapters-home-1',
          sectionId: 'work',
          eyebrow: '02 · Case Studies & Production Archive',
          heading: 'Selected Case Studies',
          subHeading:
            'Filter by medium or explore all five production chapters — each paired with plain-English summaries, mandate context, and production tools.',
          defaultTrackFilter: 'all',
          chapters: [],
          pinnedProjects: [],
        },
      },
      {
        type: 'CardsGrid',
        props: {
          id: 'CardsGrid-capabilities',
          sectionId: 'capabilities',
          subHeading: 'Capabilities & How I Work',
          heading: 'Production Toolkit & Advisory Scope',
          stratumTheme: 'ice',
          cards: [
            {
              badge: '01 · DOCUMENTARY & FIELD PRODUCTION',
              heading: 'Documentary & Field Storytelling',
              subHeading: 'COP28, UN DESA & Broadcast Cinema',
              text: 'End-to-end location directing, multilingual field interviews, and high-retention policy documentaries for global summits and UN agencies.',
              href: '#chapter-01',
            },
            {
              badge: '02 · 2D/3D MOTION DIRECTION',
              heading: '2D/3D Motion & Scientific Visualization',
              subHeading: 'Blender 3D · Unreal Engine 5 · After Effects',
              text: 'Custom 3D modeling, procedural shaders, and modular motion graphics that turn complex technical and biological processes into clear visual narratives.',
              href: '#chapter-02',
            },
            {
              badge: '03 · DIGITAL PLATFORMS & CAMPAIGNS',
              heading: 'Digital Knowledge Portals & Strategy',
              subHeading: 'Drupal 10 · Astro · Multilingual Outreach',
              text: 'Full-stack institutional platforms, high-impact scrollytelling features (3M+ views), and data-driven communications strategies.',
              href: '#chapter-04',
            },
          ],
        },
      },
      {
        type: 'ExperienceCascade',
        props: {
          id: 'ExperienceCascade-home-1',
          sectionId: 'experience',
          heading: 'Work Experience',
          subHeading:
            'Six years of end-to-end multimedia production, location directing, 3D animation, and Drupal/WordPress web architecture across United Nations agencies and broadcast news.',
          pinnedExperiences: [],
        },
      },
      {
        type: 'EducationSkillsStratum',
        props: {
          id: 'EducationSkillsStratum-home-1',
          sectionId: 'education-skills',
          metrics: profile.metrics.map((m, i) => ({
            ...m,
            theme: i % 2 === 0 ? 'paper' : 'cobalt',
          })),
          educationHeading: 'Education',
          educationItems: [
            {
              degree: 'MA Marketing, Buying Behaviour and Digital Communication',
              school: 'John Cabot University',
              years: '2019–2020',
            },
            {
              degree: 'Bachelor of Arts in Communications',
              school: 'John Cabot University',
              years: '2014–2017',
            },
          ],
          skillsHeading: 'Core Capabilities & Technical Stack',
          softwareMeters: profile.softwareMeters,
        },
      },
      {
        type: 'DossierContact',
        props: {
          id: 'DossierContact-home-1',
          sectionId: 'documents',
          heading: 'Publications, CVs & Direct Contact',
          description:
            "Download Matteo's styled PDF CVs and 13-page portfolio book, copy the direct studio email, or send a project inquiry below.",
          availabilityText:
            'Based in New York (EST) · Available for select UN P3/P4 consultancies, 3D motion direction, and senior roles',
          dossierCards: [
            {
              title: 'UN & Policy CV',
              subtitle: 'Styled Topographic PDF',
              href: '/documents/Matteo_Casling_CV.pdf',
              iconType: 'pdf',
            },
            {
              title: 'Motion & Tech CV',
              subtitle: 'Video / 3D / Code PDF',
              href: '/documents/Matteo_Casling_CV_Tech_Motion.pdf',
              iconType: 'film',
            },
            {
              title: 'Un-Portfolio Book',
              subtitle: '13-Page Editorial PDF',
              href: '/documents/Matteo_Casling_Portfolio_Book.pdf',
              iconType: 'browser',
            },
          ],
          contactHeading: 'Direct Contact',
          email: profile.email,
          phone: '',
          location: profile.location,
          linkedinLabel: 'in/matteo-louis-casling',
          linkedinUrl: 'https://www.linkedin.com/in/matteo-louis-casling-7285a8150/',
          primaryCta: {
            label: 'Email Matteo',
            href: `mailto:${profile.email}`,
            isExternal: 'false',
          },
          secondaryCta: {
            label: 'LinkedIn Profile',
            href: 'https://www.linkedin.com/in/matteo-louis-casling-7285a8150/',
            isExternal: 'true',
          },
        },
      },
      {
        type: 'FooterBlock',
        props: {
          id: 'FooterBlock-main',
          copyrightName: '© 2026 Matteo Casling · Senior Multimedia Producer & Communications Strategist',
          links: [
            { label: 'Direct Email', href: `mailto:${profile.email}`, isExternal: 'false' },
            { label: 'Topographic CV (PDF)', href: '/documents/Matteo_Casling_CV.pdf', isExternal: 'true' },
            { label: 'Portfolio Book (PDF)', href: '/documents/Matteo_Casling_Portfolio_Book.pdf', isExternal: 'true' },
          ],
          showBackToTop: 'true',
        },
      },
    ],
  };

  return {
    title: 'Matteo Casling — Senior Multimedia Producer & Communications Strategist',
    description:
      'Six years translating global policy, development finance, and climate science into documentary cinema, Blender 3D animations, and Drupal 10 platforms.',
    blocks,
    templateId: 'fallback-landing-template',
    templateJson,
  };
}

export async function getGlobalPageData(): Promise<GlobalPageData> {
  try {
    const res = await strapiClient.single('global').find({
      populate: {
        header: {
          populate: {
            navItems: true,
            cmsCta: true,
            primaryCta: true,
          },
        },
        footer: {
          populate: {
            links: true,
          },
        },
        studio3d: true,
      },
    });
    const data = res?.data as any;
    if (!data) return buildFallbackGlobalData();

    const fallback = buildFallbackGlobalData();
    return {
      title: data.title || fallback.title,
      description: data.description || fallback.description,
      header: data.header || fallback.header,
      footer: data.footer || fallback.footer,
      studio3d: {
        ...fallback.studio3d,
        ...(data.studio3d || {}),
      },
    };
  } catch {
    return buildFallbackGlobalData();
  }
}

export async function getLandingPageData(): Promise<LandingPageData> {
  try {
    const res = await strapiClient.single('landing-page').find({
      populate: {
        template: true,
        blocks: blocksPopulate,
      },
    });
    const data = res?.data as any;
    const hasTemplate = Boolean(data?.template?.json && Array.isArray(data.template.json.content));
    const hasBlocks = Array.isArray(data?.blocks) && data.blocks.length > 0;
    if (!data || (!hasTemplate && !hasBlocks)) {
      return buildFallbackLandingPage();
    }
    return {
      title: data.title || '',
      description: data.description || '',
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      templateId: data.template?.documentId || null,
      templateJson: hasTemplate ? data.template.json : null,
    };
  } catch {
    return buildFallbackLandingPage();
  }
}

export async function getPageBySlug(slug: string): Promise<LandingPageData | null> {
  try {
    const res = await strapiClient.collection('pages').find({
      filters: { slug: { $eq: slug } },
      populate: {
        template: true,
        blocks: blocksPopulate,
      },
    });
    const entry = Array.isArray(res?.data) ? (res.data[0] as any) : null;
    if (!entry) return null;
    const hasTemplate = Boolean(entry?.template?.json && Array.isArray(entry.template.json.content));
    return {
      title: entry.title || slug,
      description: entry.description || '',
      blocks: Array.isArray(entry.blocks) ? entry.blocks : [],
      templateId: entry.template?.documentId || null,
      templateJson: hasTemplate ? entry.template.json : null,
    };
  } catch {
    return null;
  }
}

export async function getAllProjects(): Promise<ProjectItem[]> {
  try {
    const res = await strapiClient.collection('projects').find({
      sort: ['sortOrder:asc'],
      pagination: { pageSize: 50 },
      populate: {
        coverImage: {
          fields: ['url', 'alternativeText'],
        },
        tools: true,
      },
    });
    if (!Array.isArray(res?.data) || res.data.length === 0) {
      return getFallbackProjects();
    }
    return res.data.map(normalizeStrapiProject);
  } catch {
    return getFallbackProjects();
  }
}

export async function getAllExperiences(): Promise<ExperienceItem[]> {
  try {
    const res = await strapiClient.collection('experiences').find({
      sort: ['sortOrder:asc'],
      pagination: { pageSize: 50 },
      populate: {
        logoImage: {
          fields: ['url', 'alternativeText'],
        },
        highlights: true,
      },
    });
    if (!Array.isArray(res?.data) || res.data.length === 0) {
      return getFallbackExperiences();
    }
    return res.data.map(normalizeStrapiExperience);
  } catch {
    return getFallbackExperiences();
  }
}
