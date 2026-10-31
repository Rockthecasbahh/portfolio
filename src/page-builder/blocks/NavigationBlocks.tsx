import React from 'react';
import type { ComponentConfig } from '@wecre8websites/strapi-page-builder-react';
import { Sliders, EnvelopeSimple, ArrowUp } from '@phosphor-icons/react';
import { pbProps } from '../helpers';

const isTrue = (v: any) => v === true || v === 'true';

export function createNavigationBlocks() {
  const HeaderNavigation: ComponentConfig<any> = {
    label: 'Main Navigation Header',
    fields: {
      monogram: { type: 'text', label: 'Brand Monogram (e.g. MC)' },
      fullName: { type: 'text', label: 'Full Name' },
      homeHref: { type: 'text', label: 'Home Link URL' },
      navItems: {
        type: 'array',
        label: 'Navigation Links',
        getItemSummary: (item: any) => item?.label || 'Nav Link',
        arrayFields: {
          label: { type: 'text', label: 'Menu Item Label' },
          href: { type: 'text', label: 'Target URL / Anchor (#work, #experience, etc.)' },
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
      showCmsButton: {
        type: 'radio',
        label: 'Show Strapi CMS Button',
        options: [
          { label: 'Show', value: 'true' },
          { label: 'Hide', value: 'false' },
        ],
      },
      cmsCta: {
        type: 'object',
        label: 'CMS Button Settings',
        objectFields: {
          label: { type: 'text', label: 'Button Label' },
          href: { type: 'text', label: 'Button URL' },
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
      showPrimaryCta: {
        type: 'radio',
        label: 'Show Contact CTA Button',
        options: [
          { label: 'Show', value: 'true' },
          { label: 'Hide', value: 'false' },
        ],
      },
      primaryCta: {
        type: 'object',
        label: 'Contact Button Settings',
        objectFields: {
          label: { type: 'text', label: 'Button Label' },
          href: { type: 'text', label: 'Button URL / mailto:' },
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
      isSticky: {
        type: 'radio',
        label: 'Header Positioning',
        options: [
          { label: 'Fixed Sticky Top', value: 'true' },
          { label: 'Static Top', value: 'false' },
        ],
      },
    },
    defaultProps: {
      monogram: 'MC',
      fullName: 'Matteo Louis Casling',
      homeHref: '/#top',
      navItems: [
        { label: '01 CINEMA', href: '#showreel', isExternal: 'false' },
        { label: '02 PORTFOLIO', href: '#work', isExternal: 'false' },
        { label: '03 EXPERIENCE', href: '#experience', isExternal: 'false' },
        { label: '04 DOSSIERS', href: '#documents', isExternal: 'false' },
      ],
      showCmsButton: 'true',
      cmsCta: {
        label: 'Strapi CMS',
        href: 'https://cms.matteocasling.com/admin',
        isExternal: 'true',
      },
      showPrimaryCta: 'true',
      primaryCta: {
        label: 'Contact',
        href: 'mailto:matteocasling@gmail.com',
        isExternal: 'false',
      },
      isSticky: 'true',
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const isEditing = Boolean(rawProps.puck?.isEditing);
      const stickyClass = isTrue(data.isSticky) && !isEditing ? 'fixed top-0 inset-x-0' : 'relative';
      const showCms = isTrue(data.showCmsButton) && data.cmsCta?.label;
      const showContact = isTrue(data.showPrimaryCta) && data.primaryCta?.label;
      const cmsExt = isTrue(data.cmsCta?.isExternal);
      const contactExt = isTrue(data.primaryCta?.isExternal);

      return (
        <header
          className={`${stickyClass} z-40 h-[68px] bg-white/90 backdrop-blur-md border-b border-[#304774]/15 shadow-xs transition-all`}
        >
          <div className="max-w-[1440px] h-full mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between gap-4">
            <a href={data.homeHref || '/#top'} className="flex items-center gap-3 group">
              <span className="w-9 h-9 rounded-full bg-[#304774] text-white font-display font-extrabold text-sm flex items-center justify-center shadow-sm">
                {data.monogram || 'MC'}
              </span>
              <span className="font-display font-extrabold text-base md:text-lg text-[#172a3b] group-hover:text-[#304774] transition-colors">
                {data.fullName || 'Matteo Louis Casling'}
              </span>
            </a>

            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-6 xl:gap-8 font-mono-tech text-xs font-semibold text-[#29323e]"
            >
              {(data.navItems || []).map((item: any, idx: number) => {
                const ext = isTrue(item.isExternal);
                return (
                  <a
                    key={`${item.label}-${idx}`}
                    href={item.href}
                    target={ext ? '_blank' : undefined}
                    rel={ext ? 'noreferrer' : undefined}
                    className="hover:text-[#1c72b4] transition-colors py-1"
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5">
              {showCms && (
                <a
                  href={data.cmsCta.href}
                  target={cmsExt ? '_blank' : undefined}
                  rel={cmsExt ? 'noreferrer' : undefined}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#304774]/25 bg-[#d9ebf4]/55 hover:bg-[#304774] text-[#172a3b] hover:text-white font-mono-tech text-xs font-semibold transition-colors"
                >
                  <Sliders size={14} weight="bold" />
                  <span>{data.cmsCta.label}</span>
                </a>
              )}
              {showContact && (
                <a
                  href={data.primaryCta.href}
                  target={contactExt ? '_blank' : undefined}
                  rel={contactExt ? 'noreferrer' : undefined}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#304774] text-white hover:bg-[#172a3b] font-mono-tech text-xs font-bold transition-colors shadow-sm active:scale-95"
                >
                  <EnvelopeSimple size={15} weight="bold" />
                  <span>{data.primaryCta.label}</span>
                </a>
              )}
            </div>
          </div>
        </header>
      );
    },
  };

  const FooterBlock: ComponentConfig<any> = {
    label: 'Global Footer & Copyright',
    fields: {
      copyrightName: { type: 'text', label: 'Copyright Statement' },
      links: {
        type: 'array',
        label: 'Footer Links',
        getItemSummary: (item: any) => item?.label || 'Link',
        arrayFields: {
          label: { type: 'text', label: 'Link Label' },
          href: { type: 'text', label: 'URL / mailto:' },
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
      showBackToTop: {
        type: 'radio',
        label: 'Show Back to Top Link',
        options: [
          { label: 'Show', value: 'true' },
          { label: 'Hide', value: 'false' },
        ],
      },
    },
    defaultProps: {
      copyrightName: '© 2026 Matteo Louis Casling · UN Multimedia Producer & 3D Motion Strategist',
      links: [
        { label: 'Direct Email', href: 'mailto:matteocasling@gmail.com', isExternal: 'false' },
        { label: 'Topographic CV (PDF)', href: '/documents/Matteo_Casling_CV.pdf', isExternal: 'true' },
        { label: 'Portfolio Book (PDF)', href: '/documents/Matteo_Casling_Portfolio_Book.pdf', isExternal: 'true' },
        { label: 'Strapi Admin Panel', href: 'https://cms.matteocasling.com/admin', isExternal: 'true' },
      ],
      showBackToTop: 'true',
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const showTop = isTrue(data.showBackToTop);

      return (
        <footer className="relative z-10 py-10 border-t border-[#304774]/15 bg-white/80 backdrop-blur-sm">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 flex flex-wrap items-center justify-between gap-5 font-mono-tech text-xs text-[#52637a]">
            <div className="font-bold text-[#172a3b]">{data.copyrightName}</div>
            <div className="flex flex-wrap items-center gap-6">
              {(data.links || []).map((link: any, idx: number) => {
                const ext = isTrue(link.isExternal);
                return (
                  <a
                    key={`${link.label}-${idx}`}
                    href={link.href}
                    target={ext ? '_blank' : undefined}
                    rel={ext ? 'noreferrer' : undefined}
                    className="hover:text-[#304774] transition-colors"
                  >
                    {link.label}
                  </a>
                );
              })}
              {showTop && (
                <a
                  href="#top"
                  className="inline-flex items-center gap-1 font-bold text-[#304774] hover:text-[#1c72b4] transition-colors ml-2"
                >
                  <span>TOP</span>
                  <ArrowUp size={13} weight="bold" />
                </a>
              )}
            </div>
          </div>
        </footer>
      );
    },
  };

  return {
    HeaderNavigation,
    FooterBlock,
  };
}
