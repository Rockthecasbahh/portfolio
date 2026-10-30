import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCardGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_card_grids';
  info: {
    description: 'Reusable grid of feature cards in CV topographic style';
    displayName: 'Card Grid';
  };
  attributes: {
    cards: Schema.Attribute.Component<'shared.card', true>;
    heading: Schema.Attribute.String;
    stratumTheme: Schema.Attribute.Enumeration<['ice', 'cobalt', 'paper']> &
      Schema.Attribute.DefaultTo<'ice'>;
    subHeading: Schema.Attribute.String;
  };
}

export interface BlocksContentWithImage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_content_with_images';
  info: {
    description: 'Two-column editorial text and image stratum';
    displayName: 'Content With Image';
  };
  attributes: {
    content: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    imageUrl: Schema.Attribute.String;
    link: Schema.Attribute.Component<'shared.link', false>;
    reversed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    stratumTheme: Schema.Attribute.Enumeration<['ice', 'cobalt', 'paper']> &
      Schema.Attribute.DefaultTo<'paper'>;
    subHeading: Schema.Attribute.String;
  };
}

export interface BlocksDossierContact extends Struct.ComponentSchema {
  collectionName: 'components_blocks_dossier_contacts';
  info: {
    description: 'Downloadable PDF CVs, Un-Portfolio Book, and Direct Contact stratum';
    displayName: 'Dossier & Contact';
  };
  attributes: {
    cmsLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Strapi v5 Admin'>;
    cmsUrl: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'http://localhost:1337/admin'>;
    contactHeading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Direct Contact'>;
    description: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<"Download Matteo's original topographic PDF CVs and 13-page portfolio book, or launch the Strapi v5 Admin Panel to manage page blocks, projects, career milestones, and 3D topographic scenes visually.">;
    dossierCards: Schema.Attribute.Component<'shared.dossier-card', true>;
    email: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'matteocasling@gmail.com'>;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'CV Dossiers & Strapi Headless CMS'>;
    location: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'New York, NY / Rome, Italy'>;
    phone: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'+39 327 662 4932'>;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    secondaryCta: Schema.Attribute.Component<'shared.link', false>;
    sectionId: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'documents'>;
  };
}

export interface BlocksEducationSkillsStratum extends Struct.ComponentSchema {
  collectionName: 'components_blocks_education_skills_strata';
  info: {
    description: '4-cell UN impact telemetry row + two-column Education and Software Meters stratum';
    displayName: 'Education & Skills Stratum';
  };
  attributes: {
    educationHeading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Education'>;
    educationItems: Schema.Attribute.Component<'shared.education-item', true>;
    metrics: Schema.Attribute.Component<'shared.impact-metric', true>;
    sectionId: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'education-skills'>;
    skillsHeading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Skills & 3D Pipeline'>;
    softwareMeters: Schema.Attribute.Component<'shared.software-meter', true>;
  };
}

export interface BlocksExperienceCascade extends Struct.ComponentSchema {
  collectionName: 'components_blocks_experience_cascades';
  info: {
    description: 'Alternating CV topographic wave strata for career timeline & UN missions';
    displayName: 'Experience Cascade';
  };
  attributes: {
    experiences: Schema.Attribute.Relation<
      'oneToMany',
      'api::experience.experience'
    >;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Work Experience'>;
    sectionId: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'experience'>;
    subHeading: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Six years of end-to-end multimedia production, location directing, 3D animation, and Drupal/WordPress web architecture across United Nations agencies and broadcast news.'>;
  };
}

export interface BlocksHeadingSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heading_sections';
  info: {
    description: 'Reusable section heading block';
    displayName: 'Heading Section';
  };
  attributes: {
    anchorLink: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    subHeading: Schema.Attribute.String;
  };
}

export interface BlocksHeroStratum extends Struct.ComponentSchema {
  collectionName: 'components_blocks_hero_strata';
  info: {
    description: 'CV-styled stepped topographic hero with portrait halo and 3D artifact badge';
    displayName: 'Hero Stratum';
  };
  attributes: {
    floatingArtifactHref: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#chapter-02'>;
    floatingArtifactImageUrl: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/assets/projects/locust-3d-sculpture.png'>;
    floatingArtifactSubtitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Blender + Three.js + GSAP'>;
    floatingArtifactTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'3D & Motion Layers'>;
    fullName: Schema.Attribute.String;
    portraitImage: Schema.Attribute.Media<'images'>;
    portraitImageUrl: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/assets/matteo-portrait-cutout.webp'>;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    quoteText: Schema.Attribute.Text;
    secondaryCta: Schema.Attribute.Component<'shared.link', false>;
    taglineBadge: Schema.Attribute.String;
  };
}

export interface BlocksHorizontalShowreel extends Struct.ComponentSchema {
  collectionName: 'components_blocks_horizontal_showreels';
  info: {
    description: 'GSAP ScrollTrigger horizontal 3D & documentary cinema showreel';
    displayName: 'Horizontal Showreel';
  };
  attributes: {
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'GSAP ScrollTrigger Horizontal Cinema'>;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'3D & Motion Showreel'>;
    onlyFeatured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    projects: Schema.Attribute.Relation<'oneToMany', 'api::project.project'>;
    sectionId: Schema.Attribute.String & Schema.Attribute.DefaultTo<'showreel'>;
    subHeading: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Scroll to scrub through selected UN documentary films, Blender 3D scientific visualizations, and motion graphics.'>;
  };
}

export interface BlocksLogoWall extends Struct.ComponentSchema {
  collectionName: 'components_blocks_logo_walls';
  info: {
    description: 'United Nations agencies and broadcast partner logo strip';
    displayName: 'Logo Wall';
  };
  attributes: {
    ariaLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'United Nations Agencies and Broadcast Partners'>;
    logos: Schema.Attribute.Component<'shared.partner-logo', true>;
  };
}

export interface BlocksMarkdown extends Struct.ComponentSchema {
  collectionName: 'components_blocks_markdowns';
  info: {
    description: 'Rich text / Markdown block in a CV topographic wave stratum';
    displayName: 'Markdown Block';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    heading: Schema.Attribute.String;
    stratumTheme: Schema.Attribute.Enumeration<['ice', 'cobalt', 'paper']> &
      Schema.Attribute.DefaultTo<'paper'>;
  };
}

export interface BlocksPortfolioChapters extends Struct.ComponentSchema {
  collectionName: 'components_blocks_portfolio_chapters';
  info: {
    description: 'Curated Un-Portfolio Chapters 01-05 with dual-track audience filter';
    displayName: 'Portfolio Chapters';
  };
  attributes: {
    chapters: Schema.Attribute.Component<'shared.chapter-meta', true>;
    defaultTrackFilter: Schema.Attribute.Enumeration<
      ['all', 'un-policy', 'tech-motion']
    > &
      Schema.Attribute.DefaultTo<'all'>;
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Curated Un-Portfolio Index (Chapters 01 - 05)'>;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Work Samples & Production Archive'>;
    projects: Schema.Attribute.Relation<'oneToMany', 'api::project.project'>;
    sectionId: Schema.Attribute.String & Schema.Attribute.DefaultTo<'work'>;
    subHeading: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<"Filter by audience focus or jump directly across the five chapters of Matteo's portfolio.">;
  };
}

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    description: 'Global site footer';
    displayName: 'Footer';
  };
  attributes: {
    copyrightName: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Matteo Louis Casling'>;
    links: Schema.Attribute.Component<'shared.link', true>;
  };
}

export interface LayoutHeader extends Struct.ComponentSchema {
  collectionName: 'components_layout_headers';
  info: {
    description: 'Global fixed navigation header';
    displayName: 'Header';
  };
  attributes: {
    cmsCta: Schema.Attribute.Component<'shared.link', false>;
    fullName: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Matteo Louis Casling'>;
    monogram: Schema.Attribute.String & Schema.Attribute.DefaultTo<'MC'>;
    navItems: Schema.Attribute.Component<'shared.link', true>;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
  };
}

export interface LayoutStudio3DSettings extends Struct.ComponentSchema {
  collectionName: 'components_layout_studio_3d_settings';
  info: {
    description: 'Three.js Topographic Strata, Cinema Camera & Video Light Rig settings';
    displayName: 'Studio 3D Settings';
  };
  attributes: {
    cameraRigScale: Schema.Attribute.Float & Schema.Attribute.DefaultTo<1.15>;
    cobaltHex: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#304774'>;
    coralAccentHex: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#f29f8b'>;
    deepNavyHex: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#172a3b'>;
    engineMode: Schema.Attribute.Enumeration<
      ['procedural-sculpture', 'spline', 'glb']
    > &
      Schema.Attribute.DefaultTo<'procedural-sculpture'>;
    glbPath: Schema.Attribute.String & Schema.Attribute.DefaultTo<''>;
    iceBlueHex: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#d9ebf4'>;
    sceneOffsetX: Schema.Attribute.Float & Schema.Attribute.DefaultTo<2.55>;
    sceneOffsetY: Schema.Attribute.Float & Schema.Attribute.DefaultTo<-0.1>;
    scrollMorphIntensity: Schema.Attribute.Float &
      Schema.Attribute.DefaultTo<1.15>;
    showTopographicContours: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    splineUrl: Schema.Attribute.String & Schema.Attribute.DefaultTo<''>;
    strataSpread: Schema.Attribute.Float & Schema.Attribute.DefaultTo<1.15>;
    videoLightColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#d9ebf4'>;
    videoLightIntensity: Schema.Attribute.Float & Schema.Attribute.DefaultTo<3>;
  };
}

export interface SharedCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_cards';
  info: {
    description: 'Generic feature card for CardGrid blocks';
    displayName: 'Card';
  };
  attributes: {
    badge: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    href: Schema.Attribute.String;
    subHeading: Schema.Attribute.String;
    text: Schema.Attribute.Text;
  };
}

export interface SharedChapterMeta extends Struct.ComponentSchema {
  collectionName: 'components_shared_chapter_metas';
  info: {
    description: 'Un-Portfolio chapter index definition (01-05)';
    displayName: 'Chapter Meta';
  };
  attributes: {
    chapterNumber: Schema.Attribute.String & Schema.Attribute.DefaultTo<'01'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedDossierCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_dossier_cards';
  info: {
    description: 'Downloadable CV or Portfolio PDF card';
    displayName: 'Dossier Card';
  };
  attributes: {
    href: Schema.Attribute.String;
    iconType: Schema.Attribute.Enumeration<['pdf', 'film', 'browser']> &
      Schema.Attribute.DefaultTo<'pdf'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedEducationItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_education_items';
  info: {
    description: 'Degree, university/school, and academic years';
    displayName: 'Education Item';
  };
  attributes: {
    degree: Schema.Attribute.String;
    school: Schema.Attribute.String;
    years: Schema.Attribute.String;
  };
}

export interface SharedHighlightBullet extends Struct.ComponentSchema {
  collectionName: 'components_shared_highlight_bullets';
  info: {
    description: 'Individual bullet point in a career experience card';
    displayName: 'Highlight Bullet';
  };
  attributes: {
    text: Schema.Attribute.Text;
  };
}

export interface SharedImpactMetric extends Struct.ComponentSchema {
  collectionName: 'components_shared_impact_metrics';
  info: {
    description: 'Verified UN or production impact telemetry card';
    displayName: 'Impact Metric';
  };
  attributes: {
    agency: Schema.Attribute.String;
    label: Schema.Attribute.String;
    theme: Schema.Attribute.Enumeration<['paper', 'cobalt']> &
      Schema.Attribute.DefaultTo<'paper'>;
    value: Schema.Attribute.String;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    description: 'Reusable link or CTA button';
    displayName: 'Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    isButtonLink: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['PRIMARY', 'SECONDARY', 'GHOST']> &
      Schema.Attribute.DefaultTo<'PRIMARY'>;
  };
}

export interface SharedPartnerLogo extends Struct.ComponentSchema {
  collectionName: 'components_shared_partner_logos';
  info: {
    description: 'UN Agency or Broadcast Partner Logo';
    displayName: 'Partner Logo';
  };
  attributes: {
    alt: Schema.Attribute.String;
    darkBg: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    image: Schema.Attribute.Media<'images'>;
    imageUrl: Schema.Attribute.String;
    name: Schema.Attribute.String;
  };
}

export interface SharedSoftwareMeter extends Struct.ComponentSchema {
  collectionName: 'components_shared_software_meters';
  info: {
    description: 'Production tool & proficiency meter (1-8 segments)';
    displayName: 'Software Meter';
  };
  attributes: {
    name: Schema.Attribute.String;
    segmentsFilled: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 8;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<8>;
    subtitle: Schema.Attribute.String;
  };
}

export interface SharedToolTag extends Struct.ComponentSchema {
  collectionName: 'components_shared_tool_tags';
  info: {
    description: 'Software or production tool tag on a project';
    displayName: 'Tool Tag';
  };
  attributes: {
    name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'blocks.card-grid': BlocksCardGrid;
      'blocks.content-with-image': BlocksContentWithImage;
      'blocks.dossier-contact': BlocksDossierContact;
      'blocks.education-skills-stratum': BlocksEducationSkillsStratum;
      'blocks.experience-cascade': BlocksExperienceCascade;
      'blocks.heading-section': BlocksHeadingSection;
      'blocks.hero-stratum': BlocksHeroStratum;
      'blocks.horizontal-showreel': BlocksHorizontalShowreel;
      'blocks.logo-wall': BlocksLogoWall;
      'blocks.markdown': BlocksMarkdown;
      'blocks.portfolio-chapters': BlocksPortfolioChapters;
      'layout.footer': LayoutFooter;
      'layout.header': LayoutHeader;
      'layout.studio-3d-settings': LayoutStudio3DSettings;
      'shared.card': SharedCard;
      'shared.chapter-meta': SharedChapterMeta;
      'shared.dossier-card': SharedDossierCard;
      'shared.education-item': SharedEducationItem;
      'shared.highlight-bullet': SharedHighlightBullet;
      'shared.impact-metric': SharedImpactMetric;
      'shared.link': SharedLink;
      'shared.partner-logo': SharedPartnerLogo;
      'shared.software-meter': SharedSoftwareMeter;
      'shared.tool-tag': SharedToolTag;
    }
  }
}
