import React, { useState } from 'react';
import {
  Play,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  CheckCircle,
  VideoCamera,
  Cube,
  BookOpenText,
  Globe,
  MicrophoneStage,
  Headphones,
} from '@phosphor-icons/react';
import type { ProjectItem } from '../lib/cms';
import { useNativeModalDialog } from '../utils/dialog';

interface CustomChapterInput {
  chapterNumber: '01' | '02' | '03' | '04' | '05';
  title: string;
  subtitle: string;
}

type CategoryFilter = 'all' | 'film-motion' | '3d' | 'web-portals' | 'print-audio';

interface Props {
  projects: ProjectItem[];
  sectionId?: string;
  eyebrow?: string;
  heading?: string;
  subHeading?: string;
  defaultTrackFilter?: 'all' | 'un-policy' | 'tech-motion';
  customChapters?: CustomChapterInput[];
}

interface ChapterMeta {
  number: '01' | '02' | '03' | '04' | '05';
  title: string;
  subtitle: string;
  editorialIntro: string;
  stratumStyle: 'paper' | 'ice' | 'cobalt';
}

const CHAPTERS: ChapterMeta[] = [
  {
    number: '01',
    title: 'Videos',
    subtitle: 'Documentary Direction, Location Cinematography & Summit Cinema',
    editorialIntro:
      'From climate advocacy at COP28 and COP29 to sovereign development financing in the Dominican Republic, these films translate complex mandates into high-retention cinema.',
    stratumStyle: 'paper',
  },
  {
    number: '02',
    title: 'Animation & 3D',
    subtitle: 'Blender 3D Visualization, Unreal Engine 5 & After Effects Motion Systems',
    editorialIntro:
      'Animation and 3D modeling clarify technical systems and biological processes that cameras cannot capture, combining custom 3D sculpting in Blender and Unreal Engine 5 with modular After Effects rigging.',
    stratumStyle: 'ice',
  },
  {
    number: '03',
    title: 'Brochures & Manuals',
    subtitle: 'Editorial Publications, Technical SOP Manuals & Visual Identities',
    editorialIntro:
      'Publication design grounded in typographic clarity, custom vector schematics, and zero-errata print engineering for flagship COP28 brochures and global safety manuals.',
    stratumStyle: 'cobalt',
  },
  {
    number: '04',
    title: 'Websites & Portals',
    subtitle: 'Drupal 10, WordPress, Astro & Interactive Knowledge Architecture',
    editorialIntro:
      'Full-stack digital platforms architected from zero, structuring high-traffic UN knowledge portals, interactive video repositories, and modern CMS ecosystems.',
    stratumStyle: 'paper',
  },
  {
    number: '05',
    title: 'Podcasts & Stories',
    subtitle: 'Interactive Scrollytelling, World Water Day Features & Multi-Track Audio',
    editorialIntro:
      'Narrative case studies, high-impact scrollytelling (3M+ views), and multi-track mastered podcast series (Roots on Spotify and Apple Podcasts) putting human voices at the center of policy.',
    stratumStyle: 'ice',
  },
];

const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'film-motion', label: 'Film & Motion' },
  { id: '3d', label: '3D' },
  { id: 'web-portals', label: 'Web & Portals' },
  { id: 'print-audio', label: 'Print & Audio' },
];

function getMediumBadge(category: ProjectItem['category']): string {
  switch (category) {
    case 'video':
      return 'Field Documentary';
    case 'animation':
      return '3D & Motion';
    case 'design':
      return 'Editorial Print';
    case 'web':
      return 'Web & Portals';
    case 'podcast':
      return 'Audio Podcast';
    case 'story':
      return 'Interactive Story';
  }
}

function matchesCategory(project: ProjectItem, filter: CategoryFilter): boolean {
  if (filter === 'all') return true;
  switch (filter) {
    case 'film-motion':
      return (
        project.category === 'video' ||
        project.category === 'animation' ||
        project.chapterNumber === '01' ||
        project.chapterNumber === '02'
      );
    case '3d':
      return (
        project.category === 'animation' ||
        project.chapterNumber === '02' ||
        (project.tools || []).some((t) => /3d|blender|unreal/i.test(t))
      );
    case 'web-portals':
      return project.category === 'web' || project.chapterNumber === '04';
    case 'print-audio':
      return (
        project.category === 'design' ||
        project.category === 'podcast' ||
        project.category === 'story' ||
        project.chapterNumber === '03' ||
        project.chapterNumber === '05'
      );
  }
}

function normalizeText(text: string): string {
  return text.replace(/\b3d\b/gi, '3D').replace(/\bdelIver\b/g, 'deliver');
}

function getChapterIcon(number: ChapterMeta['number']) {
  switch (number) {
    case '01':
      return <VideoCamera size={26} weight="duotone" />;
    case '02':
      return <Cube size={26} weight="duotone" />;
    case '03':
      return <BookOpenText size={26} weight="duotone" />;
    case '04':
      return <Globe size={26} weight="duotone" />;
    case '05':
      return <MicrophoneStage size={26} weight="duotone" />;
  }
}

export default function PortfolioChapters({
  projects,
  sectionId = 'work',
  eyebrow,
  heading,
  subHeading,
  customChapters,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [activeVideo, setActiveVideo] = useState<ProjectItem | null>(null);
  const [selectedWebSlug, setSelectedWebSlug] = useState<string | null>(null);

  const videoDialogRef = useNativeModalDialog(Boolean(activeVideo), () => setActiveVideo(null));

  const chaptersList: ChapterMeta[] = CHAPTERS.map((base) => {
    const override = customChapters?.find((c) => c.chapterNumber === base.number);
    return override
      ? {
          ...base,
          title: normalizeText(override.title || base.title),
          subtitle: normalizeText(override.subtitle || base.subtitle),
        }
      : base;
  });

  const filteredProjects = projects.filter((p) => matchesCategory(p, activeCategory));

  return (
    <div id={sectionId} className="relative z-10 py-20">
      {heading && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mb-8">
          {eyebrow && (
            <div className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#1c72b4] mb-1.5">
              {eyebrow}
            </div>
          )}
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#172a3b]">
            {heading}
          </h2>
          {subHeading && (
            <p className="text-base text-[#29323e] mt-2 max-w-[62ch]">
              {subHeading}
            </p>
          )}
        </div>
      )}

      {/* Sticky Category Filter Bar (Single Horizontal Row) */}
      <div className="sticky top-[68px] z-30 bg-white/90 backdrop-blur-md border-y border-[#304774]/15 py-3.5 px-6 md:px-12 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 max-w-full">
            <SlidersHorizontal size={18} className="text-[#304774] flex-shrink-0" />
            <span className="font-mono-tech text-xs font-semibold text-[#172a3b] flex-shrink-0 hidden sm:inline">
              Filter by Medium:
            </span>
            <div
              className="flex items-center gap-2 overflow-x-auto flex-nowrap py-1"
              role="group"
              aria-label="Filter case studies by medium"
            >
              {CATEGORY_FILTERS.map((tab) => {
                const isSelected = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={(e) => {
                      setActiveCategory(tab.id);
                      e.currentTarget.scrollIntoView({
                        block: 'nearest',
                        inline: 'nearest',
                      });
                    }}
                    className={`relative flex-none px-4 py-1.5 rounded-full font-mono-tech text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#304774] text-white font-bold shadow-sm after:content-[""] after:absolute after:inset-x-3 after:bottom-0.5 after:border-b-2 after:border-[#f29f8b]'
                        : 'bg-[#d9ebf4]/60 text-[#172a3b] hover:bg-[#d9ebf4]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 font-mono-tech text-xs">
            {chaptersList.map((ch) => (
              <a
                key={ch.number}
                href={`#chapter-${ch.number}`}
                className="px-3 py-1 rounded-full border border-[#304774]/20 text-[#304774] hover:bg-[#304774] hover:text-white transition-colors"
              >
                {ch.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Alternating Stepped Topographic Strata */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-16 mt-12">
        {chaptersList.map((chapter) => {
          const chapterProjects = filteredProjects.filter(
            (p) => p.chapterNumber === chapter.number
          );
          if (chapterProjects.length === 0) return null;

          const isCobalt = chapter.stratumStyle === 'cobalt';
          const isIce = chapter.stratumStyle === 'ice';
          const isChapter04 = chapter.number === '04';

          const activeWebSlug = isChapter04
            ? selectedWebSlug === 'all' || chapterProjects.some((p) => p.slug === selectedWebSlug)
              ? selectedWebSlug
              : chapterProjects[0]?.slug
            : null;

          const displayedProjects =
            isChapter04 && activeWebSlug && activeWebSlug !== 'all'
              ? chapterProjects.filter((p) => p.slug === activeWebSlug)
              : chapterProjects;

          return (
            <section
              key={chapter.number}
              id={`chapter-${chapter.number}`}
              className="relative scroll-mt-32"
            >
              <div
                aria-hidden="true"
                className={`cv-wave-slab absolute -inset-x-2 -top-3 -bottom-3 pointer-events-none ${
                  isCobalt
                    ? 'bg-[#d9ebf4]'
                    : isIce
                    ? 'bg-[#304774]/90'
                    : 'bg-[#d9ebf4]/85'
                }`}
              />

              <div
                className={`relative cv-wave-slab p-6 sm:p-10 md:p-12 ${
                  isCobalt
                    ? 'cv-stratum-cobalt'
                    : isIce
                    ? 'cv-stratum-ice'
                    : 'cv-stratum-paper'
                }`}
              >
                <div
                  className={`pb-8 mb-10 border-b ${
                    isCobalt ? 'border-white/20' : 'border-[#304774]/15'
                  } flex flex-col md:flex-row md:items-center justify-between gap-6`}
                >
                  <div className="flex items-start sm:items-center gap-5">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                        isCobalt
                          ? 'bg-[#d9ebf4] text-[#172a3b]'
                          : 'bg-[#304774] text-white'
                      }`}
                    >
                      {getChapterIcon(chapter.number)}
                    </div>
                    <div>
                      <h2
                        className={`font-display font-extrabold text-3xl md:text-4xl ${
                          isCobalt ? 'text-white' : 'text-[#172a3b]'
                        }`}
                      >
                        {chapter.title}
                      </h2>
                      <p
                        className={`italic text-sm md:text-base leading-[1.2] pb-1 mt-1 ${
                          isCobalt ? 'text-[#d9ebf4]' : 'text-[#304774] font-semibold'
                        }`}
                      >
                        {chapter.subtitle}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`text-sm md:text-base max-w-[54ch] leading-relaxed ${
                      isCobalt ? 'text-white/90' : 'text-[#29323e]'
                    }`}
                  >
                    {chapter.editorialIntro}
                  </p>
                </div>

                {/* Digital Platform Tabs for Chapter 04 */}
                {isChapter04 && chapterProjects.length > 1 && (
                  <div className="mb-8 p-3 rounded-2xl bg-white/70 border border-[#304774]/15 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                    <div
                      className="flex items-center gap-2 flex-wrap"
                      role="tablist"
                      aria-label="Digital Platforms"
                    >
                      <span className="font-mono-tech text-xs font-bold text-[#304774] px-2.5 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe size={16} weight="duotone" />
                        <span>Platform Tabs:</span>
                      </span>
                      {chapterProjects.map((proj) => {
                        const isSelected = activeWebSlug === proj.slug;
                        return (
                          <button
                            key={proj.slug}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => setSelectedWebSlug(proj.slug)}
                            className={`px-4 py-2 rounded-full font-mono-tech text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-[#304774] text-white shadow-md scale-[1.01]'
                                : 'bg-[#d9ebf4]/60 text-[#172a3b] hover:bg-[#d9ebf4] hover:text-[#1c72b4]'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-[#c9a345]' : 'bg-[#304774]/30'
                              }`}
                            />
                            <span>{proj.title}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedWebSlug('all')}
                      className={`px-3.5 py-1.5 rounded-full font-mono-tech text-xs transition-colors cursor-pointer ${
                        activeWebSlug === 'all'
                          ? 'bg-[#304774] text-white font-bold'
                          : 'text-[#304774] hover:bg-[#d9ebf4]/50 font-semibold'
                      }`}
                    >
                      View Both / All ({chapterProjects.length})
                    </button>
                  </div>
                )}

                {/* Project Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {displayedProjects.map((project, index) => {
                    const isFeaturedSpan = displayedProjects.length % 2 === 1 && index === 0;
                    const activeImgSrc = project.thumbnail;
                    const normalizedTools = (project.tools || []).map((t) => normalizeText(t));

                    return (
                      <article
                        key={project.slug}
                        id={`project-${project.slug}`}
                        className={`${
                          isFeaturedSpan
                            ? 'lg:col-span-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
                            : 'flex flex-col justify-between'
                        } rounded-[28px] bg-white text-[#172a3b] border border-[#304774]/15 shadow-lg p-6 md:p-8 transition-transform duration-300 hover:-translate-y-0.5`}
                      >
                        <div className={isFeaturedSpan ? 'lg:col-span-7' : 'mb-6'}>
                          <div className="relative overflow-hidden rounded-[20px] border border-[#d9ebf4] bg-[#172a3b] group">
                            <img
                              src={activeImgSrc || ''}
                              alt={project.title}
                              loading="lazy"
                              className={`w-full ${
                                project.category === 'design'
                                  ? 'max-h-[460px] object-contain bg-[#f4f9fc] p-4'
                                  : 'aspect-video object-cover'
                              } transition-transform duration-700 group-hover:scale-[1.02]`}
                            />
                          </div>

                          {project.impactMetric && (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="inline-flex items-center gap-1.5 font-mono-tech text-xs text-[#1c72b4] font-bold">
                                <CheckCircle
                                  size={16}
                                  weight="fill"
                                  className="text-[#c9a345]"
                                />
                                <span>{project.impactMetric}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div
                          className={`${
                            isFeaturedSpan ? 'lg:col-span-5' : ''
                          } flex flex-col justify-between flex-1 space-y-5`}
                        >
                          <div>
                            {/* Medium & Top Tool Tags */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#304774] text-white font-mono-tech text-[11px] font-bold">
                                {getMediumBadge(project.category)}
                              </span>
                              {normalizedTools.slice(0, 3).map((tool) => (
                                <span
                                  key={tool}
                                  className="font-mono-tech text-[11px] px-2.5 py-0.5 rounded-full bg-[#d9ebf4]/75 text-[#172a3b] font-semibold"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>

                            <div className="font-mono-tech text-xs text-[#52637a] mb-1">
                              {project.location}
                            </div>
                            <h3 className="font-display font-bold text-2xl text-[#172a3b] leading-tight mb-3">
                              {project.title}
                            </h3>

                            {/* Plain-English 1-sentence hook */}
                            <p className="rounded-2xl bg-[#f4f9fc] border-l-4 border-[#304774] p-4 text-sm md:text-base font-medium text-[#172a3b] leading-relaxed mb-4">
                              {normalizeText(project.shortDescription)}
                            </p>

                            <div className="rounded-2xl bg-[#f4f9fc] border border-[#d9ebf4] p-3.5 space-y-2 mb-4">
                              <div className="flex items-center justify-between font-mono-tech text-xs">
                                <span className="leader-line text-[#52637a]">MADE FOR:</span>
                                <span className="text-[#172a3b] font-bold">{project.madeFor}</span>
                              </div>
                              <div className="flex items-center justify-between font-mono-tech text-xs border-t border-[#d9ebf4] pt-2">
                                <span className="leader-line text-[#52637a]">YEAR:</span>
                                <span className="text-[#172a3b] font-bold">{project.year}</span>
                              </div>
                            </div>

                            {/* Lightweight Audio & Podcast Listen Card */}
                            {project.category === 'podcast' && (
                              <div className="mb-4 rounded-2xl bg-[#d9ebf4]/45 border border-[#304774]/20 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="inline-flex items-center gap-2 font-mono-tech text-xs font-bold text-[#304774]">
                                    <Headphones size={16} weight="duotone" />
                                    <span>Audio Series Preview</span>
                                  </div>
                                  <span className="font-mono-tech text-[11px] text-[#52637a]">
                                    Multi-Track Mastered
                                  </span>
                                </div>
                                <audio
                                  controls
                                  preload="none"
                                  aria-label={`Audio preview for ${project.title}`}
                                  className="w-full h-9"
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                  {project.externalUrl && (
                                    <a
                                      href={project.externalUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1 rounded-full bg-[#304774] text-white hover:bg-[#172a3b] font-mono-tech text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                                    >
                                      <span>IFAD Podcasts</span>
                                      <ArrowUpRight size={12} weight="bold" />
                                    </a>
                                  )}
                                  <a
                                    href="https://open.spotify.com/search/Roots%20IFAD"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 rounded-full bg-white border border-[#304774]/20 text-[#172a3b] hover:border-[#304774] font-mono-tech text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                                  >
                                    <span>Spotify</span>
                                    <ArrowUpRight size={12} weight="bold" />
                                  </a>
                                  <a
                                    href="https://podcasts.apple.com/us/search?term=Roots%20IFAD"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 rounded-full bg-white border border-[#304774]/20 text-[#172a3b] hover:border-[#304774] font-mono-tech text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                                  >
                                    <span>Apple Podcasts</span>
                                    <ArrowUpRight size={12} weight="bold" />
                                  </a>
                                </div>
                              </div>
                            )}

                            <div className="space-y-3 pt-3 border-t border-[#d9ebf4] text-xs md:text-sm">
                              <div>
                                <span className="font-mono-tech text-xs font-bold text-[#304774] block mb-0.5">
                                  Mandate & Objective
                                </span>
                                <p className="text-[#29323e] leading-relaxed">
                                  {project.mandateChallenge}
                                </p>
                              </div>
                              <div>
                                <span className="font-mono-tech text-xs font-bold text-[#304774] block mb-0.5">
                                  Production Pipeline
                                </span>
                                <p className="text-[#29323e] leading-relaxed">
                                  {project.executionCraft}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-[#d9ebf4] space-y-4">
                            <div className="flex flex-wrap gap-1.5">
                              {normalizedTools.map((tool) => (
                                <span
                                  key={tool}
                                  className="font-mono-tech text-[11px] px-2.5 py-0.5 rounded-full bg-[#d9ebf4]/65 text-[#304774] font-medium"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              {project.videoYoutubeId && (
                                <button
                                  type="button"
                                  onClick={() => setActiveVideo(project)}
                                  className="px-4 py-2.5 rounded-full bg-[#304774] text-white hover:bg-[#172a3b] font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
                                >
                                  <Play size={15} weight="fill" />
                                  <span>Play Video</span>
                                </button>
                              )}
                              {project.externalUrl && (
                                <a
                                  href={project.externalUrl}
                                  target={
                                    project.externalUrl.startsWith('http')
                                      ? '_blank'
                                      : undefined
                                  }
                                  rel="noreferrer"
                                  className="px-4 py-2.5 rounded-full border border-[#1c72b4] text-[#1c72b4] hover:bg-[#1c72b4] hover:text-white font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors"
                                >
                                  <span>{project.externalLabel}</span>
                                  <ArrowUpRight size={15} weight="bold" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Native Modal Dialog for Video Playback */}
      <dialog
        ref={videoDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="portfolio-video-dialog-title"
        onClose={() => setActiveVideo(null)}
        className="m-auto max-w-5xl w-[calc(100%-2rem)] rounded-[32px] border border-[#d9ebf4] bg-white text-[#172a3b] shadow-2xl overflow-hidden p-0"
      >
        {activeVideo && (
          <div>
            <div className="px-6 py-4 border-b border-[#d9ebf4] flex items-center justify-between bg-[#d9ebf4]/55">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-3 py-1 rounded-full bg-[#304774] text-white font-mono-tech text-xs font-bold flex-shrink-0">
                  {activeVideo.madeFor} ({activeVideo.year})
                </span>
                <h4
                  id="portfolio-video-dialog-title"
                  className="font-display font-bold text-base md:text-lg text-[#172a3b] truncate max-w-xl"
                >
                  {activeVideo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => videoDialogRef.current?.close()}
                className="p-1.5 rounded-full text-[#304774] hover:bg-[#304774] hover:text-white cursor-pointer flex-shrink-0"
                aria-label="Close modal"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoYoutubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
