import React from 'react';
import type { ComponentConfig } from '@wecre8websites/strapi-page-builder-react';
import {
  ArrowUpRight,
  FilePdf,
  Quotes,
  GraduationCap,
  Lightning,
  Play,
} from '@phosphor-icons/react';
import HorizontalShowreel from '../../components/HorizontalShowreel';
import PortfolioChapters from '../../components/PortfolioChapters';
import { resolvePbMediaUrl, normalizePbProject, pbProps } from '../helpers';
import type { ProjectItem } from '../../lib/cms';

export function createIdentityAndPortfolioBlocks(strapiImageUrl = 'http://localhost:1337') {
  const HeroStratum: ComponentConfig<any> = {
    label: 'Hero Stratum (CV Portrait & 3D Badge)',
    fields: {
      taglineBadge: { type: 'text', label: 'Tagline Pill Badge' },
      fullName: { type: 'text', label: 'Full Name (supports {{title}})' },
      quoteText: { type: 'textarea', label: 'Hero Quote Statement' },
      portraitImage: { type: 'media', mediaType: 'image', label: 'Portrait Cutout Image' },
      primaryCta: {
        type: 'object',
        label: 'Primary CTA Button',
        objectFields: {
          label: { type: 'text', label: 'Label' },
          href: { type: 'text', label: 'URL / Anchor' },
          isExternal: {
            type: 'radio',
            label: 'Open in New Tab',
            options: [
              { label: 'No', value: 'false' },
              { label: 'Yes', value: 'true' },
            ],
          },
        },
      },
      secondaryCta: {
        type: 'object',
        label: 'Secondary CTA Button',
        objectFields: {
          label: { type: 'text', label: 'Label' },
          href: { type: 'text', label: 'URL / Anchor' },
          isExternal: {
            type: 'radio',
            label: 'Open in New Tab',
            options: [
              { label: 'No', value: 'false' },
              { label: 'Yes', value: 'true' },
            ],
          },
        },
      },
      floatingArtifactTitle: { type: 'text', label: '3D Floating Card Title' },
      floatingArtifactSubtitle: { type: 'text', label: '3D Floating Card Subtitle' },
      floatingArtifactHref: { type: 'text', label: '3D Floating Card Link' },
      floatingArtifactImage: { type: 'media', mediaType: 'image', label: '3D Floating Card Thumbnail' },
    },
    defaultProps: {
      taglineBadge: 'Senior Multimedia Producer, 3D Motion Designer & UN Communications Strategist',
      fullName: 'Matteo Louis Casling',
      quoteText:
        'Six years translating global policy, development finance, and climate science into documentary cinema, Blender 3D animations, and Drupal 10 platforms.',
      portraitImage: '/assets/matteo-portrait-cutout.webp',
      primaryCta: { label: 'Explore Work', href: '#work', isExternal: 'false' },
      secondaryCta: {
        label: 'Download Styled CV',
        href: '/documents/Matteo_Casling_CV.pdf',
        isExternal: 'true',
      },
      floatingArtifactTitle: '3D & Motion Layers',
      floatingArtifactSubtitle: 'Blender + Three.js + GSAP',
      floatingArtifactHref: '#chapter-02',
      floatingArtifactImage: '/assets/projects/locust-3d-sculpture.png',
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const portraitSrc =
        resolvePbMediaUrl(data.portraitImage, strapiImageUrl) ||
        '/assets/matteo-portrait-cutout.webp';
      const artifactSrc =
        resolvePbMediaUrl(data.floatingArtifactImage, strapiImageUrl) ||
        '/assets/projects/locust-3d-sculpture.png';
      const primaryExt = data.primaryCta?.isExternal === 'true' || data.primaryCta?.isExternal === true;
      const secondaryExt =
        data.secondaryCta?.isExternal === 'true' || data.secondaryCta?.isExternal === true;

      return (
        <section className="min-h-[100dvh] pt-24 pb-10 flex items-center">
          <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -left-2 sm:-left-4 -top-3 bottom-6 w-[88%] rounded-tl-[72px] rounded-br-[56px] rounded-tr-2xl rounded-bl-2xl bg-[#304774] shadow-xl pointer-events-none"
              />
              <div className="relative ml-3 sm:ml-7 cv-hero-slab cv-stratum-ice p-6 sm:p-10 lg:p-12 border border-white/80">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    {data.taglineBadge && (
                      <div className="inline-block px-3.5 py-1 rounded-full bg-[#304774] text-white font-mono-tech text-xs uppercase tracking-[0.14em]">
                        {data.taglineBadge}
                      </div>
                    )}
                    <h1 className="font-display font-extrabold text-4xl sm:text-5xl xl:text-6xl tracking-tight leading-[1.04] text-[#172a3b]">
                      {data.fullName}
                    </h1>
                    {data.quoteText && (
                      <div className="relative bg-white/75 backdrop-blur-sm rounded-[28px] p-5 sm:p-6 border border-white shadow-sm">
                        <Quotes size={28} weight="fill" className="text-[#304774] mb-1 opacity-85" />
                        <p className="text-base md:text-lg text-[#172a3b] leading-relaxed max-w-[56ch]">
                          {data.quoteText}
                        </p>
                      </div>
                    )}
                    <div className="pt-1 flex flex-wrap items-center gap-3.5">
                      {data.primaryCta?.label && (
                        <a
                          href={data.primaryCta.href || '#work'}
                          target={primaryExt ? '_blank' : undefined}
                          rel={primaryExt ? 'noreferrer' : undefined}
                          className="px-6 py-3.5 rounded-full bg-[#304774] text-white hover:bg-[#172a3b] font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-md active:scale-95"
                        >
                          <span>{data.primaryCta.label}</span>
                          <ArrowUpRight size={16} weight="bold" />
                        </a>
                      )}
                      {data.secondaryCta?.label && (
                        <a
                          href={data.secondaryCta.href || '#documents'}
                          target={secondaryExt ? '_blank' : undefined}
                          rel={secondaryExt ? 'noreferrer' : undefined}
                          className="px-5 py-3.5 rounded-full bg-white border border-[#304774]/25 text-[#172a3b] hover:border-[#304774] font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-xs"
                        >
                          <FilePdf size={16} weight="duotone" className="text-[#1c72b4]" />
                          <span>{data.secondaryCta.label}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
                    <div className="relative">
                      <div
                        aria-hidden="true"
                        className="w-60 h-60 sm:w-72 sm:h-72 rounded-full border-2 border-dashed border-[#304774]/35 absolute -inset-3 animate-[spin_45s_linear_infinite] pointer-events-none"
                      />
                      <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full cv-portrait-halo border-4 border-white overflow-hidden flex items-end justify-center">
                        <img
                          src={portraitSrc}
                          alt={data.fullName || 'Portrait'}
                          className="w-full h-[108%] object-cover object-top drop-shadow-xl"
                        />
                      </div>
                      {data.floatingArtifactTitle && (
                        <a
                          href={data.floatingArtifactHref || '#chapter-02'}
                          className="mt-4 sm:mt-0 sm:absolute sm:-bottom-4 sm:-left-10 bg-white/95 backdrop-blur-md border border-[#304774]/20 rounded-2xl p-2.5 shadow-xl flex items-center gap-3 hover:border-[#304774] transition-colors"
                        >
                          <img
                            src={artifactSrc}
                            alt={data.floatingArtifactTitle}
                            className="w-14 h-12 rounded-xl object-cover"
                          />
                          <div className="pr-2">
                            <div className="font-display font-bold text-xs text-[#172a3b]">
                              {data.floatingArtifactTitle}
                            </div>
                            <div className="font-mono-tech text-[11px] text-[#1c72b4]">
                              {data.floatingArtifactSubtitle}
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    },
  };

  const LogoWall: ComponentConfig<any> = {
    label: 'Partner & UN Agency Logo Wall',
    fields: {
      ariaLabel: { type: 'text', label: 'Accessibility Label' },
      logos: {
        type: 'array',
        label: 'Partner Logos',
        getItemSummary: (item: any) => item?.name || 'Partner Logo',
        arrayFields: {
          name: { type: 'text', label: 'Partner Name' },
          alt: { type: 'text', label: 'Alt Description' },
          imageUrl: { type: 'media', mediaType: 'image', label: 'Logo Image' },
        },
      },
    },
    defaultProps: {
      ariaLabel: 'United Nations Agencies and Broadcast Partners',
      logos: [
        { name: 'UN DESA', alt: 'UN DESA', imageUrl: '/assets/logos/un-desa.png' },
        { name: 'FAO / IAEA', alt: 'Joint FAO/IAEA Centre', imageUrl: '/assets/logos/iaea-fao-navy.png' },
        { name: 'FAO', alt: 'FAO', imageUrl: '/assets/logos/fao.png' },
        { name: 'IFAD', alt: 'IFAD', imageUrl: '/assets/logos/ifad.png' },
      ],
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      return (
        <section
          aria-label={data.ariaLabel || 'United Nations Agencies and Broadcast Partners'}
          className="py-6"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="rounded-[32px] bg-white/90 backdrop-blur-md border border-[#d9ebf4] shadow-sm px-6 md:px-12 py-6 flex flex-wrap items-center justify-between gap-8">
              {(data.logos || []).map((logo: any, idx: number) => {
                const src = resolvePbMediaUrl(logo?.imageUrl, strapiImageUrl);
                if (!src) return null;
                return (
                  <div
                    key={`${logo?.name || 'logo'}-${idx}`}
                    className="h-10 sm:h-11 flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity"
                  >
                    <img
                      src={src}
                      alt={logo?.alt || logo?.name || 'Partner Logo'}
                      loading="lazy"
                      className="max-h-9 sm:max-h-10 w-auto object-contain"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
  };

  const EducationSkillsStratum: ComponentConfig<any> = {
    label: 'Education, Metrics & 3D Pipeline Skills',
    fields: {
      sectionId: { type: 'text', label: 'Section Anchor ID' },
      metrics: {
        type: 'array',
        label: 'Impact Metrics Row',
        getItemSummary: (item: any) => `${item?.value || ''} ${item?.label || ''}`.trim() || 'Metric',
        arrayFields: {
          value: { type: 'text', label: 'Stat Value (e.g. 500K+)' },
          label: { type: 'text', label: 'Metric Label' },
          agency: { type: 'text', label: 'Agency / Context' },
          theme: {
            type: 'select',
            label: 'Card Theme',
            options: [
              { label: 'Paper White', value: 'paper' },
              { label: 'Slate Cobalt', value: 'cobalt' },
            ],
          },
        },
      },
      educationHeading: { type: 'text', label: 'Education Column Heading' },
      educationItems: {
        type: 'array',
        label: 'Education Degrees',
        getItemSummary: (item: any) => item?.degree || 'Degree',
        arrayFields: {
          degree: { type: 'text', label: 'Degree Title' },
          school: { type: 'text', label: 'University / Institution' },
          years: { type: 'text', label: 'Years' },
        },
      },
      skillsHeading: { type: 'text', label: 'Skills Column Heading' },
      softwareMeters: {
        type: 'array',
        label: 'Software & 3D Pipeline Meters',
        getItemSummary: (item: any) => item?.name || 'Software',
        arrayFields: {
          name: { type: 'text', label: 'Software / Pipeline Name' },
          subtitle: { type: 'text', label: 'Capabilities Subtitle' },
          segmentsFilled: {
            type: 'slider',
            label: 'Proficiency Score (out of 8)',
            min: 1,
            max: 8,
            step: 1,
          },
        },
      },
    },
    defaultProps: {
      sectionId: 'education-skills',
      metrics: [],
      educationHeading: 'Education',
      educationItems: [],
      skillsHeading: 'Skills & 3D Pipeline',
      softwareMeters: [],
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      return (
        <section id={data.sectionId || 'education-skills'} className="py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-10">
            {(data.metrics || []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {data.metrics.map((metric: any, i: number) => {
                  const isPaper = metric?.theme ? metric.theme === 'paper' : i % 2 === 0;
                  return (
                    <div
                      key={`${metric?.value}-${i}`}
                      className={`rounded-[28px] p-6 border shadow-md transition-transform hover:-translate-y-0.5 ${
                        isPaper
                          ? 'bg-white border-[#d9ebf4] text-[#172a3b]'
                          : 'bg-[#304774] border-[#304774] text-white'
                      }`}
                    >
                      <div
                        className={`font-display font-extrabold text-3xl md:text-4xl ${
                          isPaper ? 'text-[#304774]' : 'text-[#d9ebf4]'
                        }`}
                      >
                        {metric?.value}
                      </div>
                      <div className="font-sans font-bold text-sm mt-1.5 leading-snug">
                        {metric?.label}
                      </div>
                      <div
                        className={`font-mono-tech text-xs mt-2 ${
                          isPaper ? 'text-[#1c72b4]' : 'text-[#fbd5cd]'
                        }`}
                      >
                        {metric?.agency}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <div
                aria-hidden="true"
                className="cv-wave-slab bg-[#304774] absolute -left-3 right-4 -top-3 bottom-3 opacity-90 pointer-events-none"
              />
              <div className="relative ml-2 sm:ml-5 cv-wave-slab cv-stratum-ice p-7 sm:p-10 md:p-12 border border-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-[#172a3b]">
                      <GraduationCap size={28} weight="duotone" className="text-[#304774]" />
                      <h2 className="font-display font-extrabold text-2xl md:text-3xl text-[#172a3b]">
                        {data.educationHeading || 'Education'}
                      </h2>
                    </div>
                    <div className="space-y-5">
                      {(data.educationItems || []).map((edu: any, idx: number) => (
                        <div
                          key={`${edu?.degree}-${idx}`}
                          className="bg-white/80 rounded-2xl p-5 border border-white shadow-xs"
                        >
                          <h3 className="font-display font-bold text-base md:text-lg text-[#172a3b] leading-snug">
                            {edu?.degree}
                          </h3>
                          <div className="text-sm font-semibold text-[#304774] mt-1">
                            {edu?.school}
                          </div>
                          <div className="font-mono-tech text-xs text-[#52637a] mt-0.5">
                            {edu?.years}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-[#172a3b]">
                      <Lightning size={28} weight="duotone" className="text-[#304774]" />
                      <h2 className="font-display font-extrabold text-2xl md:text-3xl text-[#172a3b]">
                        {data.skillsHeading || 'Skills & 3D Pipeline'}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(data.softwareMeters || []).map((sw: any, idx: number) => (
                        <div
                          key={`${sw?.name}-${idx}`}
                          className="bg-white/85 rounded-2xl p-4 border border-white shadow-xs flex flex-col justify-between gap-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display font-bold text-sm text-[#172a3b]">
                              {sw?.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#304774] text-white font-mono-tech text-[11px] font-bold">
                              {sw?.segmentsFilled ?? 8}/8
                            </span>
                          </div>
                          <p className="text-xs text-[#29323e] leading-relaxed">{sw?.subtitle}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    },
  };

  const HorizontalShowreelBlock: ComponentConfig<any> = {
    label: '3D & Motion Horizontal Showreel (GSAP)',
    fields: {
      sectionId: { type: 'text', label: 'Section Anchor ID' },
      eyebrow: { type: 'text', label: 'Eyebrow Label' },
      heading: { type: 'text', label: 'Heading' },
      subHeading: { type: 'textarea', label: 'Sub-Heading' },
      onlyFeatured: {
        type: 'radio',
        label: 'Filter Mode (when no custom projects pinned below)',
        options: [
          { label: 'Featured Reel Projects Only', value: 'true' },
          { label: 'All Strapi Projects', value: 'false' },
        ],
      },
      pinnedProjects: {
        type: 'array',
        label: 'Optional: Pin Specific Strapi Projects',
        getItemSummary: (item: any, idx?: number) =>
          item?.project?.title || `Pinned Project ${(idx ?? 0) + 1}`,
        arrayFields: {
          project: {
            type: 'strapi',
            label: 'Select Strapi Project',
            contentType: 'api::project.project',
            titleField: 'title',
          },
        },
      },
    },
    defaultProps: {
      sectionId: 'showreel',
      eyebrow: 'GSAP ScrollTrigger Horizontal Cinema',
      heading: '3D & Motion Showreel',
      subHeading:
        'Scroll to scrub through selected UN documentary films, Blender 3D scientific visualizations, and motion graphics.',
      onlyFeatured: 'true',
      pinnedProjects: [],
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const isEditing = Boolean(rawProps.puck?.isEditing);
      const allProjects: ProjectItem[] = rawProps.puck?.metadata?.projects || [];

      const resolvedPinned: ProjectItem[] = Array.isArray(data.pinnedProjects)
        ? data.pinnedProjects
            .map((entry: any) => normalizePbProject(entry?.project, strapiImageUrl))
            .filter((p: ProjectItem | null): p is ProjectItem => p !== null)
        : [];

      const usingPinned = resolvedPinned.length > 0;
      const projectsToPass = usingPinned ? resolvedPinned : allProjects;
      const onlyFeaturedFlag = usingPinned
        ? false
        : data.onlyFeatured !== 'false' && data.onlyFeatured !== false;

      return (
        <HorizontalShowreel
          projects={projectsToPass}
          sectionId={data.sectionId || 'showreel'}
          eyebrow={data.eyebrow}
          heading={data.heading}
          subHeading={data.subHeading}
          onlyFeatured={onlyFeaturedFlag}
          disablePin={isEditing}
        />
      );
    },
  };

  const PortfolioChaptersBlock: ComponentConfig<any> = {
    label: 'Un-Portfolio Chapters Archive (01 - 05)',
    fields: {
      sectionId: { type: 'text', label: 'Section Anchor ID' },
      eyebrow: { type: 'text', label: 'Eyebrow Label' },
      heading: { type: 'text', label: 'Heading' },
      subHeading: { type: 'textarea', label: 'Sub-Heading' },
      defaultTrackFilter: {
        type: 'select',
        label: 'Default Audience Filter',
        options: [
          { label: 'All Projects (12)', value: 'all' },
          { label: 'UN & Policy Comms', value: 'un-policy' },
          { label: '3D, Motion & Web Tech', value: 'tech-motion' },
        ],
      },
      chapters: {
        type: 'array',
        label: 'Chapters (01 - 05)',
        getItemSummary: (item: any) =>
          item?.chapterNumber ? `Ch. ${item.chapterNumber}: ${item.title || ''}` : 'Chapter',
        arrayFields: {
          chapterNumber: {
            type: 'select',
            label: 'Chapter Number',
            options: [
              { label: '01 - Videos', value: '01' },
              { label: '02 - Animations & 3D', value: '02' },
              { label: '03 - Editorial Design', value: '03' },
              { label: '04 - Websites & Platforms', value: '04' },
              { label: '05 - Stories & Podcasts', value: '05' },
            ],
          },
          title: { type: 'text', label: 'Chapter Title' },
          subtitle: { type: 'textarea', label: 'Chapter Subtitle' },
        },
      },
      pinnedProjects: {
        type: 'array',
        label: 'Optional: Override with Specific Strapi Projects',
        getItemSummary: (item: any, idx?: number) =>
          item?.project?.title || `Selected Project ${(idx ?? 0) + 1}`,
        arrayFields: {
          project: {
            type: 'strapi',
            label: 'Select Strapi Project',
            contentType: 'api::project.project',
            titleField: 'title',
          },
        },
      },
    },
    defaultProps: {
      sectionId: 'work',
      eyebrow: 'Curated Un-Portfolio Index (Chapters 01 - 05)',
      heading: 'Work Samples & Production Archive',
      subHeading:
        "Filter by audience focus or jump directly across the five chapters of Matteo's portfolio.",
      defaultTrackFilter: 'all',
      chapters: [],
      pinnedProjects: [],
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const allProjects: ProjectItem[] = rawProps.puck?.metadata?.projects || [];

      const resolvedPinned: ProjectItem[] = Array.isArray(data.pinnedProjects)
        ? data.pinnedProjects
            .map((entry: any) => normalizePbProject(entry?.project, strapiImageUrl))
            .filter((p: ProjectItem | null): p is ProjectItem => p !== null)
        : [];

      const projectsToPass = resolvedPinned.length > 0 ? resolvedPinned : allProjects;
      const customChapters =
        Array.isArray(data.chapters) && data.chapters.length > 0 ? data.chapters : undefined;

      return (
        <PortfolioChapters
          projects={projectsToPass}
          sectionId={data.sectionId || 'work'}
          eyebrow={data.eyebrow}
          heading={data.heading}
          subHeading={data.subHeading}
          defaultTrackFilter={data.defaultTrackFilter || 'all'}
          customChapters={customChapters}
        />
      );
    },
  };

  const SingleProjectSpotlight: ComponentConfig<any> = {
    label: 'Single Strapi Project Spotlight',
    fields: {
      eyebrow: { type: 'text', label: 'Spotlight Badge' },
      stratumTheme: {
        type: 'select',
        label: 'Topographic Stratum Theme',
        options: [
          { label: 'Slate Cobalt (#304774)', value: 'cobalt' },
          { label: 'Glacier Ice (#d9ebf4)', value: 'ice' },
          { label: 'Paper White (#ffffff)', value: 'paper' },
        ],
      },
      project: {
        type: 'strapi',
        label: 'Pick Project from Strapi Collection',
        contentType: 'api::project.project',
        titleField: 'title',
      },
    },
    defaultProps: {
      eyebrow: 'Featured Production Case Study',
      stratumTheme: 'cobalt',
      project: null,
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const fallbackFirst = (rawProps.puck?.metadata?.projects || [])[0] || null;
      const proj = normalizePbProject(data.project, strapiImageUrl) || fallbackFirst;
      const isCobalt = data.stratumTheme === 'cobalt';
      const isIce = data.stratumTheme === 'ice';

      if (!proj) {
        return (
          <section className="py-10">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
              <div className="cv-wave-slab cv-stratum-ice p-8 text-center font-mono-tech text-xs text-[#304774]">
                Select a Strapi Project in the Page Builder sidebar to display a spotlight case study.
              </div>
            </div>
          </section>
        );
      }

      return (
        <section className="py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div
              className={`cv-wave-slab p-7 sm:p-10 md:p-12 ${
                isCobalt
                  ? 'cv-stratum-cobalt'
                  : isIce
                  ? 'cv-stratum-ice border border-white'
                  : 'cv-stratum-paper border border-[#d9ebf4]'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full font-mono-tech text-xs font-bold ${
                        isCobalt ? 'bg-[#d9ebf4] text-[#172a3b]' : 'bg-[#304774] text-white'
                      }`}
                    >
                      CH.{proj.chapterNumber} · {proj.madeFor}
                    </span>
                    {data.eyebrow && (
                      <span
                        className={`font-mono-tech text-xs font-semibold ${
                          isCobalt ? 'text-[#fbd5cd]' : 'text-[#1c72b4]'
                        }`}
                      >
                        {data.eyebrow}
                      </span>
                    )}
                  </div>
                  <h2
                    className={`font-display font-extrabold text-2xl md:text-4xl ${
                      isCobalt ? 'text-white' : 'text-[#172a3b]'
                    }`}
                  >
                    {proj.title}
                  </h2>
                  <p
                    className={`text-base leading-relaxed ${
                      isCobalt ? 'text-white/90' : 'text-[#29323e]'
                    }`}
                  >
                    {proj.shortDescription}
                  </p>
                  {proj.impactMetric && (
                    <div
                      className={`font-mono-tech text-xs font-bold ${
                        isCobalt ? 'text-[#f29f8b]' : 'text-[#304774]'
                      }`}
                    >
                      IMPACT: {proj.impactMetric}
                    </div>
                  )}
                  {proj.externalUrl && (
                    <div className="pt-2">
                      <a
                        href={proj.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-5 py-3 rounded-full font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors ${
                          isCobalt
                            ? 'bg-white text-[#172a3b] hover:bg-[#d9ebf4]'
                            : 'bg-[#304774] text-white hover:bg-[#172a3b]'
                        }`}
                      >
                        <Play size={15} weight="fill" />
                        <span>{proj.externalLabel || 'View Project'}</span>
                      </a>
                    </div>
                  )}
                </div>
                {proj.thumbnail && (
                  <div className="lg:col-span-6">
                    <img
                      src={proj.thumbnail}
                      alt={proj.title}
                      className="w-full h-72 sm:h-80 object-cover rounded-2xl shadow-lg border border-white/30"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    },
  };

  return {
    HeroStratum,
    LogoWall,
    EducationSkillsStratum,
    HorizontalShowreel: HorizontalShowreelBlock,
    PortfolioChapters: PortfolioChaptersBlock,
    SingleProjectSpotlight,
  };
}
