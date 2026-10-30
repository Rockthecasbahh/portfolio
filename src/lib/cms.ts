import fs from 'node:fs';
import path from 'node:path';

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

const contentRoot = path.resolve(process.cwd(), 'src/content');
const dataRoot = path.resolve(process.cwd(), 'src/data');

export function getProfile(): ProfileData {
  const filePath = path.join(contentRoot, 'profile/index.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getVisualOverrides(): VisualOverridesData {
  const filePath = path.join(dataRoot, 'visual-overrides.json');
  if (!fs.existsSync(filePath)) {
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
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getStudio3DSettings(): Studio3DSettings {
  const filePath = path.join(contentRoot, 'studio3d/index.json');
  const base = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const overrides = getVisualOverrides().studio3dOverrides || {};
  return {
    ...base,
    ...overrides,
  };
}

export function getProjects(): ProjectItem[] {
  const dirPath = path.join(contentRoot, 'projects');
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  const items: ProjectItem[] = files.map((file) => {
    const slug = file.replace(/\.json$/, '');
    const raw = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf-8'));
    return {
      slug,
      ...raw,
    };
  });
  return items.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
}

export function getExperiences(): ExperienceItem[] {
  const dirPath = path.join(contentRoot, 'experiences');
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  const items: ExperienceItem[] = files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf-8'));
    return raw;
  });
  return items.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
}
