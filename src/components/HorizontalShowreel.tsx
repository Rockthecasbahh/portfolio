import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, ArrowUpRight, FilmStrip, X } from '@phosphor-icons/react';
import type { ProjectItem } from '../lib/cms';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  projects: ProjectItem[];
  sectionId?: string;
  eyebrow?: string;
  heading?: string;
  subHeading?: string;
  onlyFeatured?: boolean;
  disablePin?: boolean;
}

export default function HorizontalShowreel({
  projects,
  sectionId = 'showreel',
  eyebrow,
  heading = 'Motion & 3D Showreel',
  subHeading = 'Scroll horizontally through flagship UN documentaries, COP28 cinema, and 3D Blender animations.',
  onlyFeatured = true,
  disablePin = false,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeVideoProject, setActiveVideoProject] = useState<ProjectItem | null>(null);

  const reelProjects = onlyFeatured ? projects.filter((p) => p.featuredInReel) : projects;

  useEffect(() => {
    if (disablePin) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth + 96);
      };

      gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(track.scrollWidth - window.innerWidth, 800)}`,
          pin: true,
          scrub: 0.75,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => {
      mm.revert();
    };
  }, [reelProjects.length]);

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full flex flex-col justify-center overflow-hidden py-16 lg:py-0"
    >
      {/* Stepped Ice-Blue Backing Stratum behind Slate-Cobalt Wave Band */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 relative">
        <div
          aria-hidden="true"
          className="cv-wave-slab bg-[#d9ebf4] absolute -inset-x-2 -top-4 -bottom-4 opacity-85 pointer-events-none"
        />

        <div className="relative cv-wave-slab cv-stratum-cobalt py-10 md:py-12 overflow-hidden">
          <div className="px-6 md:px-12 mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#d9ebf4] text-[#172a3b] flex items-center justify-center shadow-md flex-shrink-0">
                <FilmStrip size={24} weight="duotone" />
              </div>
              <div>
                {eyebrow && (
                  <div className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#fbd5cd] mb-1">
                    {eyebrow}
                  </div>
                )}
                <h2 className="font-display font-extrabold text-2xl md:text-4xl text-white">
                  {heading}
                </h2>
                <p className="text-sm md:text-base text-[#d9ebf4]/90 max-w-[58ch]">
                  {subHeading}
                </p>
              </div>
            </div>
          </div>

          <div
            ref={trackRef}
            className="flex flex-col lg:flex-row items-stretch gap-7 px-6 md:px-12 lg:w-max"
          >
            {reelProjects.map((project) => (
              <article
                key={project.slug}
                className="w-full lg:w-[520px] xl:w-[560px] flex-shrink-0 rounded-[28px] bg-white text-[#172a3b] shadow-xl border border-[#d9ebf4] flex flex-col justify-between group relative overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="px-6 py-3.5 bg-[#d9ebf4]/65 border-b border-[#304774]/10 flex items-center justify-between font-mono-tech text-xs">
                  <span className="font-bold text-[#304774]">{project.madeFor}</span>
                  <span className="text-[#52637a]">{project.location}</span>
                </div>

                <div className="relative aspect-video w-full overflow-hidden bg-[#172a3b]">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172a3b]/70 via-transparent to-transparent" />

                  {project.videoYoutubeId ? (
                    <button
                      type="button"
                      onClick={() => setActiveVideoProject(project)}
                      aria-label={`Play ${project.title}`}
                      className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#f29f8b] text-[#172a3b] hover:bg-[#304774] hover:text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xl cursor-pointer active:scale-95"
                    >
                      <Play size={22} weight="fill" />
                    </button>
                  ) : (
                    <a
                      href={project.externalUrl || `#project-${project.slug}`}
                      target={project.externalUrl?.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      aria-label={`Open ${project.title}`}
                      className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#304774] text-white hover:bg-[#f29f8b] hover:text-[#172a3b] flex items-center justify-center transition-colors duration-300 shadow-xl"
                    >
                      <ArrowUpRight size={22} weight="bold" />
                    </a>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    {project.impactMetric && (
                      <div className="mb-1.5 font-mono-tech text-xs font-bold text-[#1c72b4]">
                        {project.impactMetric}
                      </div>
                    )}
                    <h3 className="font-display font-bold text-xl text-[#172a3b] leading-snug mb-3">
                      {project.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-3 py-2.5 px-3.5 rounded-2xl bg-[#f4f9fc] border border-[#d9ebf4] mb-3 font-mono-tech text-xs">
                      <div>
                        <span className="text-[#52637a]">MADE FOR:</span>{' '}
                        <span className="text-[#172a3b] font-bold">{project.madeFor}</span>
                      </div>
                      <div>
                        <span className="text-[#52637a]">YEAR:</span>{' '}
                        <span className="text-[#172a3b] font-bold">{project.year}</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#29323e] leading-relaxed line-clamp-3">
                      {project.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#d9ebf4] flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tools.slice(0, 4).map((tool) => (
                        <span
                          key={tool}
                          className="font-mono-tech text-[11px] px-2.5 py-0.5 rounded-full bg-[#d9ebf4]/60 text-[#304774] font-medium"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    {project.videoYoutubeId ? (
                      <button
                        type="button"
                        onClick={() => setActiveVideoProject(project)}
                        className="font-mono-tech text-xs font-bold text-[#1c72b4] hover:text-[#304774] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Play Video</span>
                        <Play size={13} weight="fill" />
                      </button>
                    ) : (
                      <a
                        href={project.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono-tech text-xs font-bold text-[#1c72b4] hover:text-[#304774] inline-flex items-center gap-1"
                      >
                        <span>{project.externalLabel}</span>
                        <ArrowUpRight size={14} weight="bold" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {activeVideoProject && (
        <div
          className="fixed inset-0 z-50 bg-[#172a3b]/85 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={activeVideoProject.title}
        >
          <div className="max-w-5xl w-full rounded-[32px] border border-[#d9ebf4] bg-white text-[#172a3b] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#d9ebf4] flex items-center justify-between bg-[#d9ebf4]/55">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#304774] text-white font-mono-tech text-xs font-bold">
                  {activeVideoProject.madeFor} ({activeVideoProject.year})
                </span>
                <h4 className="font-display font-bold text-base md:text-lg text-[#172a3b] truncate max-w-xl">
                  {activeVideoProject.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoProject(null)}
                className="p-1.5 rounded-full text-[#304774] hover:bg-[#304774] hover:text-white transition-colors cursor-pointer"
                aria-label="Close Video Player"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoProject.videoYoutubeId}?autoplay=1&rel=0`}
                title={activeVideoProject.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f4f9fc]">
              <div>
                <div className="font-mono-tech text-xs font-bold text-[#304774] mb-1">
                  Mandate & Challenge
                </div>
                <p className="text-xs md:text-sm text-[#29323e] leading-relaxed">
                  {activeVideoProject.mandateChallenge}
                </p>
              </div>
              <div>
                <div className="font-mono-tech text-xs font-bold text-[#304774] mb-1">
                  Production Pipeline
                </div>
                <p className="text-xs md:text-sm text-[#29323e] leading-relaxed">
                  {activeVideoProject.executionCraft}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
