import type { Studio3DSettings, ProjectItem, ExperienceItem } from '../lib/cms';

export type { Studio3DSettings, ProjectItem, ExperienceItem };

export interface StrapiMedia {
  id?: number;
  documentId?: string;
  url?: string | null;
  alternativeText?: string | null;
}

export interface SharedLink {
  id?: number;
  label: string;
  href: string;
  isExternal?: boolean;
  isButtonLink?: boolean;
  type?: 'PRIMARY' | 'SECONDARY' | 'GHOST';
}

export interface PartnerLogo {
  id?: number;
  name?: string;
  alt: string;
  imageUrl?: string;
  darkBg?: boolean;
  image?: StrapiMedia | null;
}

export interface ImpactMetricItem {
  id?: number;
  value: string;
  label: string;
  agency: string;
  theme?: 'paper' | 'cobalt';
}

export interface EducationItem {
  id?: number;
  degree: string;
  school: string;
  years: string;
}

export interface SoftwareMeterItem {
  id?: number;
  name: string;
  subtitle: string;
  segmentsFilled: number;
}

export interface ChapterMetaItem {
  id?: number;
  chapterNumber: '01' | '02' | '03' | '04' | '05';
  title: string;
  subtitle: string;
}

export interface DossierCardItem {
  id?: number;
  title: string;
  subtitle: string;
  href: string;
  iconType?: 'pdf' | 'film' | 'browser';
}

export interface SharedCardItem {
  id?: number;
  heading: string;
  subHeading?: string;
  text: string;
  badge?: string;
  href?: string;
}

export type ComponentType =
  | 'blocks.hero-stratum'
  | 'blocks.logo-wall'
  | 'blocks.education-skills-stratum'
  | 'blocks.horizontal-showreel'
  | 'blocks.portfolio-chapters'
  | 'blocks.experience-cascade'
  | 'blocks.dossier-contact'
  | 'blocks.heading-section'
  | 'blocks.card-grid'
  | 'blocks.content-with-image'
  | 'blocks.markdown';

export interface BaseBlock {
  id?: number;
  __component: ComponentType;
}

export interface HeroStratumBlock extends BaseBlock {
  __component: 'blocks.hero-stratum';
  taglineBadge: string;
  fullName: string;
  quoteText: string;
  portraitImageUrl?: string;
  portraitImage?: StrapiMedia | null;
  primaryCta?: SharedLink | null;
  secondaryCta?: SharedLink | null;
  floatingArtifactTitle?: string;
  floatingArtifactSubtitle?: string;
  floatingArtifactHref?: string;
  floatingArtifactImageUrl?: string;
}

export interface LogoWallBlock extends BaseBlock {
  __component: 'blocks.logo-wall';
  ariaLabel?: string;
  logos: PartnerLogo[];
}

export interface EducationSkillsStratumBlock extends BaseBlock {
  __component: 'blocks.education-skills-stratum';
  sectionId?: string;
  metrics: ImpactMetricItem[];
  educationHeading?: string;
  educationItems: EducationItem[];
  skillsHeading?: string;
  softwareMeters: SoftwareMeterItem[];
}

export interface HorizontalShowreelBlock extends BaseBlock {
  __component: 'blocks.horizontal-showreel';
  sectionId?: string;
  eyebrow?: string;
  heading?: string;
  subHeading?: string;
  onlyFeatured?: boolean;
  projects?: ProjectItem[];
}

export interface PortfolioChaptersBlock extends BaseBlock {
  __component: 'blocks.portfolio-chapters';
  sectionId?: string;
  eyebrow?: string;
  heading?: string;
  subHeading?: string;
  defaultTrackFilter?: 'all' | 'un-policy' | 'tech-motion';
  chapters?: ChapterMetaItem[];
  projects?: ProjectItem[];
}

export interface ExperienceCascadeBlock extends BaseBlock {
  __component: 'blocks.experience-cascade';
  sectionId?: string;
  heading?: string;
  subHeading?: string;
  experiences?: ExperienceItem[];
}

export interface DossierContactBlock extends BaseBlock {
  __component: 'blocks.dossier-contact';
  sectionId?: string;
  heading?: string;
  description?: string;
  dossierCards: DossierCardItem[];
  contactHeading?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinLabel?: string;
  linkedinUrl?: string;
  cmsLabel?: string;
  cmsUrl?: string;
  primaryCta?: SharedLink | null;
  secondaryCta?: SharedLink | null;
}

export interface HeadingSectionBlock extends BaseBlock {
  __component: 'blocks.heading-section';
  heading: string;
  subHeading?: string;
  anchorLink?: string;
}

export interface CardGridBlock extends BaseBlock {
  __component: 'blocks.card-grid';
  heading?: string;
  subHeading?: string;
  stratumTheme?: 'ice' | 'cobalt' | 'paper';
  cards: SharedCardItem[];
}

export interface ContentWithImageBlock extends BaseBlock {
  __component: 'blocks.content-with-image';
  heading: string;
  subHeading?: string;
  content: string;
  imageUrl?: string;
  image?: StrapiMedia | null;
  reversed?: boolean;
  stratumTheme?: 'ice' | 'cobalt' | 'paper';
  link?: SharedLink | null;
}

export interface MarkdownBlock extends BaseBlock {
  __component: 'blocks.markdown';
  heading?: string;
  content: string;
  stratumTheme?: 'ice' | 'cobalt' | 'paper';
}

export type BlockData =
  | HeroStratumBlock
  | LogoWallBlock
  | EducationSkillsStratumBlock
  | HorizontalShowreelBlock
  | PortfolioChaptersBlock
  | ExperienceCascadeBlock
  | DossierContactBlock
  | HeadingSectionBlock
  | CardGridBlock
  | ContentWithImageBlock
  | MarkdownBlock;

export interface GlobalHeaderData {
  monogram: string;
  fullName: string;
  navItems: SharedLink[];
  cmsCta?: SharedLink | null;
  primaryCta?: SharedLink | null;
}

export interface GlobalFooterData {
  copyrightName: string;
  links: SharedLink[];
}

export interface GlobalPageData {
  title: string;
  description: string;
  header: GlobalHeaderData;
  footer: GlobalFooterData;
  studio3d: Studio3DSettings & {
    showTopographicContours?: boolean;
  };
}

export interface PageBuilderTemplateJson {
  root?: {
    props?: Record<string, any>;
  };
  content: Array<{
    type: string;
    props: Record<string, any>;
  }>;
  zones?: Record<string, Array<{ type: string; props: Record<string, any> }>>;
}

export interface LandingPageData {
  title: string;
  description: string;
  blocks: BlockData[];
  templateId?: string | null;
  templateJson?: PageBuilderTemplateJson | null;
}
