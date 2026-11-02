import React from 'react';
import type { ComponentConfig } from '@wecre8websites/strapi-page-builder-react';
import {
  FilePdf,
  FilmSlate,
  Browsers,
  EnvelopeSimple,
  Sliders,
} from '@phosphor-icons/react';
import { normalizePbExperience, pbProps } from '../helpers';
import type { ExperienceItem } from '../../lib/cms';
import { getReadableLogoUrl } from '../../utils/loaders';

const linkFields = {
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
} as const;

const isTrue = (v: any) => v === true || v === 'true';

export function createCareerAndContactBlocks(strapiImageUrl = 'http://localhost:1337') {
  const ExperienceCascade: ComponentConfig<any> = {
    label: 'Work Experience Cascade',
    fields: {
      sectionId: { type: 'text', label: 'Section Anchor ID' },
      heading: { type: 'text', label: 'Heading' },
      subHeading: { type: 'textarea', label: 'Sub-Heading' },
      pinnedExperiences: {
        type: 'array',
        label: 'Optional: Pick Specific Strapi Experiences (default: all)',
        getItemSummary: (item: any, idx?: number) =>
          item?.experience?.roleTitle || `Experience ${(idx ?? 0) + 1}`,
        arrayFields: {
          experience: {
            type: 'strapi',
            label: 'Select Strapi Experience',
            contentType: 'api::experience.experience',
            titleField: 'roleTitle',
          },
        },
      },
    },
    defaultProps: {
      sectionId: 'experience',
      heading: 'Work Experience',
      subHeading: '',
      pinnedExperiences: [],
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const all: ExperienceItem[] = rawProps.puck?.metadata?.experiences || [];
      const pinned: ExperienceItem[] = Array.isArray(data.pinnedExperiences)
        ? data.pinnedExperiences
            .map((e: any) => normalizePbExperience(e?.experience, strapiImageUrl))
            .filter((e: ExperienceItem | null): e is ExperienceItem => e !== null)
        : [];
      const expList = pinned.length > 0 ? pinned : all;

      return (
        <section id={data.sectionId || 'experience'} className="py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="mb-12 px-2">
              <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#172a3b]">
                {data.heading || 'Work Experience'}
              </h2>
              {data.subHeading && (
                <p className="text-base text-[#29323e] mt-2 max-w-[62ch]">{data.subHeading}</p>
              )}
            </div>

            <div className="space-y-8">
              {expList.map((exp, idx) => {
                const band = idx % 3 === 0 ? 'paper' : idx % 3 === 1 ? 'cobalt' : 'ice';
                const isCobalt = band === 'cobalt';
                const isIce = band === 'ice';
                const logo = getReadableLogoUrl(
                  exp.logoPath,
                  exp.organizationShort,
                  exp.organization
                );

                return (
                  <article
                    key={`${exp.roleSlug}-${idx}`}
                    className={`cv-wave-slab p-6 sm:p-9 md:p-10 transition-transform duration-300 hover:-translate-y-0.5 ${
                      isCobalt
                        ? 'cv-stratum-cobalt'
                        : isIce
                        ? 'cv-stratum-ice border border-white'
                        : 'cv-stratum-paper border border-[#d9ebf4]'
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-5 flex items-start gap-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center p-2.5 flex-shrink-0 shadow-md ${
                            isCobalt ? 'bg-white' : 'bg-[#f4f9fc] border border-[#304774]/20'
                          }`}
                        >
                          {logo && (
                            <img
                              src={logo}
                              alt={exp.organizationShort}
                              loading="lazy"
                              className="max-h-10 w-auto object-contain"
                            />
                          )}
                        </div>
                        <div>
                          <h3
                            className={`font-display font-bold text-lg md:text-xl leading-snug ${
                              isCobalt ? 'text-white' : 'text-[#172a3b]'
                            }`}
                          >
                            {exp.organization}
                          </h3>
                          <div
                            className={`font-mono-tech text-xs mt-1 ${
                              isCobalt ? 'text-[#d9ebf4]' : 'text-[#304774] font-semibold'
                            }`}
                          >
                            {exp.location} | {exp.period}
                          </div>
                          <div
                            className={`inline-block mt-2 px-3 py-1 rounded-full font-mono-tech text-xs font-bold ${
                              isCobalt ? 'bg-[#d9ebf4] text-[#172a3b]' : 'bg-[#304774] text-white'
                            }`}
                          >
                            {exp.roleTitle}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 space-y-2.5">
                        {exp.trackHighlight && (
                          <div
                            className={`font-mono-tech text-xs font-bold mb-2 ${
                              isCobalt ? 'text-[#fbd5cd]' : 'text-[#1c72b4]'
                            }`}
                          >
                            {exp.trackHighlight}
                          </div>
                        )}
                        <ul
                          className={`space-y-2 text-sm md:text-base leading-relaxed ${
                            isCobalt ? 'text-white/92' : 'text-[#29323e]'
                          }`}
                        >
                          {(exp.highlights || []).map((bullet, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2.5">
                              <span
                                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                  isCobalt ? 'bg-[#f29f8b]' : 'bg-[#304774]'
                                }`}
                              />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
  };

  // Faithful port of the existing DossierContact.astro block (design intentionally unchanged).
  const DossierContact: ComponentConfig<any> = {
    label: 'Dossier & Contact',
    fields: {
      sectionId: { type: 'text', label: 'Section Anchor ID' },
      heading: { type: 'text', label: 'Heading' },
      description: { type: 'textarea', label: 'Description' },
      dossierCards: {
        type: 'array',
        label: 'Dossier Cards',
        getItemSummary: (item: any) => item?.title || 'Dossier Card',
        arrayFields: {
          title: { type: 'text', label: 'Title' },
          subtitle: { type: 'text', label: 'Subtitle' },
          href: { type: 'text', label: 'File URL' },
          iconType: {
            type: 'select',
            label: 'Icon',
            options: [
              { label: 'PDF', value: 'pdf' },
              { label: 'Film', value: 'film' },
              { label: 'Browser', value: 'browser' },
            ],
          },
        },
      },
      contactHeading: { type: 'text', label: 'Contact Card Heading' },
      email: { type: 'text', label: 'Email' },
      phone: { type: 'text', label: 'Phone' },
      location: { type: 'text', label: 'Base Location' },
      linkedinLabel: { type: 'text', label: 'LinkedIn Label' },
      linkedinUrl: { type: 'text', label: 'LinkedIn URL' },
      cmsLabel: { type: 'text', label: 'CMS Link Label (Optional)' },
      cmsUrl: { type: 'text', label: 'CMS Link URL (Optional)' },
      primaryCta: { type: 'object', label: 'Primary CTA', objectFields: linkFields as any },
      secondaryCta: { type: 'object', label: 'Secondary CTA', objectFields: linkFields as any },
    },
    defaultProps: {
      sectionId: 'documents',
      heading: 'CV Dossiers & Direct Contact',
      description:
        "Download Matteo's original topographic PDF CVs and 13-page portfolio book, or connect directly for global communications strategy and digital production.",
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
      email: 'matteocasling@gmail.com',
      phone: '+1 332 262 9369',
      location: 'New York, USA · Vienna · Rome',
      linkedinLabel: 'in/matteo-louis-casling',
      linkedinUrl: 'https://www.linkedin.com/in/matteo-louis-casling-7285a8150/',
      cmsLabel: '',
      cmsUrl: '',
      primaryCta: { label: 'Send Email', href: 'mailto:matteocasling@gmail.com', isExternal: 'false' },
      secondaryCta: {
        label: 'LinkedIn Profile',
        href: 'https://www.linkedin.com/in/matteo-louis-casling-7285a8150/',
        isExternal: 'true',
      },
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const pExt = isTrue(data.primaryCta?.isExternal);
      const sExt = isTrue(data.secondaryCta?.isExternal);
      const displayHeading =
        (data.heading || '').replace('& Strapi Headless CMS', '& Direct Contact') ||
        'CV Dossiers & Direct Contact';
      const linkedinUrl =
        data.linkedinUrl || 'https://www.linkedin.com/in/matteo-louis-casling-7285a8150/';
      const linkedinLabel = data.linkedinLabel || 'in/matteo-louis-casling';
      const secondaryCtaHref =
        data.secondaryCta?.href && !data.secondaryCta.href.includes('1337/admin')
          ? data.secondaryCta.href
          : linkedinUrl;
      const secondaryCtaLabel =
        data.secondaryCta?.label && !data.secondaryCta.label.toLowerCase().includes('strapi')
          ? data.secondaryCta.label
          : 'LinkedIn Profile';

      return (
        <section id={data.sectionId || 'documents'} className="py-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="cv-wave-slab cv-stratum-cobalt p-8 sm:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                    {displayHeading}
                  </h2>
                  {data.description && (
                    <p className="text-base text-[#d9ebf4] leading-relaxed max-w-[60ch]">
                      {data.description}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {(data.dossierCards || []).map((card: any, idx: number) => (
                      <a
                        key={`${card?.title}-${idx}`}
                        href={card?.href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl p-5 bg-white text-[#172a3b] hover:bg-[#d9ebf4] transition-colors flex flex-col justify-between gap-4 shadow-md group"
                      >
                        {card?.iconType === 'film' ? (
                          <FilmSlate size={28} weight="duotone" className="text-[#304774]" />
                        ) : card?.iconType === 'browser' ? (
                          <Browsers size={28} weight="duotone" className="text-[#304774]" />
                        ) : (
                          <FilePdf size={28} weight="duotone" className="text-[#304774]" />
                        )}
                        <div>
                          <div className="font-display font-bold text-base group-hover:text-[#1c72b4]">
                            {card?.title}
                          </div>
                          <div className="font-mono-tech text-xs text-[#52637a] mt-1">
                            {card?.subtitle}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-[28px] bg-[#d9ebf4] text-[#172a3b] p-7 sm:p-8 space-y-5 shadow-xl">
                  <h3 className="font-display font-extrabold text-2xl text-[#172a3b]">
                    {data.contactHeading || 'Direct Contact'}
                  </h3>
                  <div className="space-y-3 font-mono-tech text-xs">
                    {data.email && (
                      <div className="flex items-center justify-between py-2 border-b border-[#304774]/15">
                        <span className="text-[#52637a]">EMAIL</span>
                        <a href={`mailto:${data.email}`} className="text-[#1c72b4] hover:underline font-bold">
                          {data.email}
                        </a>
                      </div>
                    )}
                    {data.phone && (
                      <div className="flex items-center justify-between py-2 border-b border-[#304774]/15">
                        <span className="text-[#52637a]">MOBILE</span>
                        <a href={`tel:${data.phone}`} className="text-[#172a3b] font-bold hover:text-[#1c72b4]">
                          {data.phone}
                        </a>
                      </div>
                    )}
                    {data.location && (
                      <div className="flex items-center justify-between py-2 border-b border-[#304774]/15">
                        <span className="text-[#52637a]">BASE</span>
                        <span className="text-[#172a3b] font-bold">{data.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-[#304774]/15">
                      <span className="text-[#52637a]">LINKEDIN</span>
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1c72b4] hover:underline font-bold truncate max-w-[240px]"
                      >
                        {linkedinLabel}
                      </a>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-3">
                    {data.primaryCta?.label && (
                      <a
                        href={data.primaryCta.href}
                        target={pExt ? '_blank' : undefined}
                        rel={pExt ? 'noreferrer' : undefined}
                        className="px-5 py-3 rounded-full bg-[#304774] text-white hover:bg-[#172a3b] font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors"
                      >
                        <EnvelopeSimple size={16} weight="bold" />
                        <span>{data.primaryCta.label}</span>
                      </a>
                    )}
                    {secondaryCtaLabel && (
                      <a
                        href={secondaryCtaHref}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 rounded-full bg-white border border-[#304774]/25 text-[#172a3b] hover:bg-[#304774] hover:text-white font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors"
                      >
                        <span>{secondaryCtaLabel}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    },
  };

  return { ExperienceCascade, DossierContact };
}
