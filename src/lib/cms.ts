import profileJson from '../content/profile/index.json';
import studio3dJson from '../content/studio3d/index.json';

export interface SoftwareMeter {
  name: string;
  subtitle: string;
  segmentsFilled: number;
}

export interface ImpactMetric {
  value: string;
  label: string;
  agency: string;
}

export interface ProfileData {
  name: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  welcomeHeadline: string;
  welcomeBody: string;
  dualTrackUnSummary: string;
  dualTrackTechSummary: string;
  softwareMeters: SoftwareMeter[];
  metrics: ImpactMetric[];
}

export interface Studio3DSettings {
  engineMode: 'procedural-sculpture' | 'spline' | 'glb';
  splineUrl: string;
  glbPath: string;
  primaryGoldHex: string;
  deepNavyHex: string;
  iceBlueHex: string;
  showWireframeCage: boolean;
  scrollMorphIntensity: number;
  cameraRigScale?: number;
  videoLightIntensity?: number;
  videoLightColor?: string;
  strataSpread?: number;
  sceneOffsetX?: number;
  sceneOffsetY?: number;
}

export interface ElementOverride {
  text?: string;
  href?: string;
  src?: string;
  alt?: string;
  hidden?: boolean;
  styles?: Record<string, string>;
}

export interface CustomPageBlock {
  id: string;
  type: 'callout' | 'two-col' | 'custom-html';
  afterSection: string;
  heading: string;
  subheading: string;
  body: string;
  buttonText?: string;
  buttonHref?: string;
  imageSrc?: string;
  theme: 'ice' | 'cobalt' | 'paper' | 'coral';
  customHtml?: string;
}

export interface VisualOverridesData {
  elementEdits: Record<string, ElementOverride>;
  sectionOrder: string[];
  hiddenSections: string[];
  customBlocks: CustomPageBlock[];
  studio3dOverrides?: {
    cameraRigScale?: number;
    videoLightIntensity?: number;
    videoLightColor?: string;
    strataSpread?: number;
    sceneOffsetX?: number;
    sceneOffsetY?: number;
  };
}

export interface ProjectItem {
  slug: string;
  title: string;
  chapterNumber: '01' | '02' | '03' | '04' | '05';
  category: 'video' | 'animation' | 'design' | 'web' | 'story' | 'podcast';
  madeFor: string;
  year: string;
  location: string;
  track: 'both' | 'un-policy' | 'tech-motion';
  featuredInReel: boolean;
  sortOrder: number;
  shortDescription: string;
  mandateChallenge: string;
  executionCraft: string;
  impactMetric: string;
  thumbnail?: string | null;
  secondaryImage?: string | null;
  videoYoutubeId: string;
  externalUrl: string;
  externalLabel: string;
  tools: string[];
}

export interface ExperienceItem {
  roleSlug: string;
  roleTitle: string;
  organization: string;
  organizationShort: string;
  location: string;
  period: string;
  sortOrder: number;
  logoPath: string;
  trackHighlight: string;
  highlights: string[];
}

export function getProfile(): ProfileData {
  return profileJson as unknown as ProfileData;
}

export function getVisualOverrides(): VisualOverridesData {
  return {
    elementEdits: {},
    sectionOrder: [
      'hero-section',
      'logos-section',
      'education-skills',
      'showreel',
      'work',
      'experience',
      'documents',
    ],
    hiddenSections: [],
    customBlocks: [],
    studio3dOverrides: {},
  };
}

export function getStudio3DSettings(): Studio3DSettings {
  return studio3dJson as unknown as Studio3DSettings;
}

const rawProjects = import.meta.glob('../content/projects/*.json', { eager: true });
export function getProjects(): ProjectItem[] {
  const items: ProjectItem[] = [];
  for (const [pathKey, mod] of Object.entries(rawProjects)) {
    const slug = pathKey.split('/').pop()?.replace(/\.json$/, '') || '';
    const raw = (mod as any).default || mod;
    items.push({
      slug,
      ...raw,
    });
  }
  return items.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
}

const rawExperiences = import.meta.glob('../content/experiences/*.json', { eager: true });
export function getExperiences(): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  for (const [, mod] of Object.entries(rawExperiences)) {
    const raw = (mod as any).default || mod;
    items.push(raw);
  }
  return items.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
}
