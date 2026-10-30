import React from 'react';
import { marked } from 'marked';
import type { ComponentConfig } from '@wecre8websites/strapi-page-builder-react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { resolvePbMediaUrl, RichTextBlocksRenderer, pbProps } from '../helpers';

const themeField = {
  type: 'select',
  label: 'Topographic Stratum Theme',
  options: [
    { label: 'Glacier Ice (#d9ebf4)', value: 'ice' },
    { label: 'Slate Cobalt (#304774)', value: 'cobalt' },
    { label: 'Paper White (#ffffff)', value: 'paper' },
  ],
} as const;

const stratumClass = (theme?: string) =>
  theme === 'cobalt'
    ? 'cv-stratum-cobalt'
    : theme === 'ice'
    ? 'cv-stratum-ice border border-white'
    : 'cv-stratum-paper border border-[#d9ebf4]';

export function createContentAndLayoutBlocks(strapiImageUrl = 'http://localhost:1337') {
  const SectionHeading: ComponentConfig<any> = {
    label: 'Section Heading',
    fields: {
      anchorLink: { type: 'text', label: 'Anchor ID (optional)' },
      subHeading: { type: 'text', label: 'Eyebrow / Sub-Heading' },
      heading: { type: 'text', label: 'Heading (supports {{title}})' },
    },
    defaultProps: { anchorLink: '', subHeading: 'Section Eyebrow', heading: 'New Section' },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      return (
        <section id={data.anchorLink || undefined} className="pt-16 pb-4">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            {data.subHeading && (
              <div className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#1c72b4] mb-1.5">
                {data.subHeading}
              </div>
            )}
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#172a3b]">
              {data.heading}
            </h2>
          </div>
        </section>
      );
    },
  };

  const CardsGrid: ComponentConfig<any> = {
    label: 'Cards Grid',
    fields: {
      subHeading: { type: 'text', label: 'Eyebrow' },
      heading: { type: 'text', label: 'Heading' },
      stratumTheme: themeField as any,
      cards: {
        type: 'array',
        label: 'Cards',
        getItemSummary: (item: any) => item?.heading || 'Card',
        arrayFields: {
          badge: { type: 'text', label: 'Badge' },
          heading: { type: 'text', label: 'Heading' },
          subHeading: { type: 'text', label: 'Sub-Heading' },
          text: { type: 'textarea', label: 'Body Text' },
          href: { type: 'text', label: 'Link URL (optional)' },
        },
      },
    },
    defaultProps: {
      subHeading: '',
      heading: 'Featured Highlights',
      stratumTheme: 'ice',
      cards: [{ badge: 'NEW', heading: 'Card title', subHeading: '', text: 'Card body text.', href: '' }],
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const isCobalt = data.stratumTheme === 'cobalt';
      return (
        <section className="py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className={`cv-wave-slab p-7 sm:p-10 md:p-12 ${stratumClass(data.stratumTheme)}`}>
              {(data.heading || data.subHeading) && (
                <div className="mb-8">
                  {data.subHeading && (
                    <div className={`font-mono-tech text-xs font-bold uppercase tracking-wider mb-1 ${isCobalt ? 'text-[#fbd5cd]' : 'text-[#1c72b4]'}`}>
                      {data.subHeading}
                    </div>
                  )}
                  {data.heading && (
                    <h2 className={`font-display font-extrabold text-2xl md:text-4xl ${isCobalt ? 'text-white' : 'text-[#172a3b]'}`}>
                      {data.heading}
                    </h2>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(data.cards || []).map((card: any, idx: number) => (
                  <div key={idx} className="rounded-2xl bg-white/90 text-[#172a3b] p-6 border border-[#d9ebf4] shadow-sm flex flex-col justify-between gap-3">
                    <div>
                      {card?.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#304774] text-white font-mono-tech text-[11px] font-bold mb-2">
                          {card.badge}
                        </span>
                      )}
                      <h3 className="font-display font-bold text-lg text-[#172a3b]">{card?.heading}</h3>
                      {card?.subHeading && (
                        <div className="font-mono-tech text-xs text-[#304774] font-semibold mt-0.5">{card.subHeading}</div>
                      )}
                      <p className="text-sm text-[#29323e] leading-relaxed mt-2">{card?.text}</p>
                    </div>
                    {card?.href && (
                      <a href={card.href} className="font-mono-tech text-xs font-bold text-[#1c72b4] hover:underline mt-2 inline-block">
                        Learn more →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },
  };

  const ContentWithImage: ComponentConfig<any> = {
    label: 'Content With Image',
    fields: {
      subHeading: { type: 'text', label: 'Eyebrow' },
      heading: { type: 'text', label: 'Heading' },
      content: { type: 'richtext', label: 'Body (Rich Text)' },
      image: { type: 'media', mediaType: 'image', label: 'Image' },
      reversed: {
        type: 'radio',
        label: 'Image Position',
        options: [
          { label: 'Right', value: 'false' },
          { label: 'Left', value: 'true' },
        ],
      },
      stratumTheme: themeField as any,
      link: {
        type: 'object',
        label: 'Button',
        objectFields: {
          label: { type: 'text', label: 'Label' },
          href: { type: 'text', label: 'URL' },
        },
      },
    },
    defaultProps: {
      subHeading: '',
      heading: 'Content heading',
      content: 'Write your story here.',
      image: '',
      reversed: 'false',
      stratumTheme: 'paper',
      link: { label: '', href: '' },
    },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const isCobalt = data.stratumTheme === 'cobalt';
      const reversed = data.reversed === 'true' || data.reversed === true;
      const imgSrc = resolvePbMediaUrl(data.image, strapiImageUrl);
      const isExternal = typeof data.link?.href === 'string' && data.link.href.startsWith('http');
      return (
        <section className="py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className={`cv-wave-slab p-7 sm:p-10 md:p-12 ${stratumClass(data.stratumTheme)}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className={`lg:col-span-7 space-y-4 ${reversed ? 'lg:order-2' : ''}`}>
                  {data.subHeading && (
                    <div className={`font-mono-tech text-xs font-bold uppercase tracking-wider ${isCobalt ? 'text-[#fbd5cd]' : 'text-[#1c72b4]'}`}>
                      {data.subHeading}
                    </div>
                  )}
                  <h2 className={`font-display font-extrabold text-2xl md:text-4xl ${isCobalt ? 'text-white' : 'text-[#172a3b]'}`}>
                    {data.heading}
                  </h2>
                  <RichTextBlocksRenderer content={data.content} isCobalt={isCobalt} />
                  {data.link?.label && data.link?.href && (
                    <div className="pt-2">
                      <a
                        href={data.link.href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noreferrer' : undefined}
                        className={`px-5 py-3 rounded-full font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors ${
                          isCobalt ? 'bg-white text-[#172a3b] hover:bg-[#d9ebf4]' : 'bg-[#304774] text-white hover:bg-[#172a3b]'
                        }`}
                      >
                        <span>{data.link.label}</span>
                        <ArrowUpRight size={15} weight="bold" />
                      </a>
                    </div>
                  )}
                </div>
                {imgSrc && (
                  <div className={`lg:col-span-5 ${reversed ? 'lg:order-1' : ''}`}>
                    <img src={imgSrc} alt={data.heading || ''} loading="lazy" className="w-full rounded-2xl object-cover shadow-lg border border-white/40" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    },
  };

  const MarkdownBlock: ComponentConfig<any> = {
    label: 'Markdown Text',
    fields: {
      heading: { type: 'text', label: 'Heading' },
      content: { type: 'textarea', label: 'Markdown Content' },
      stratumTheme: themeField as any,
    },
    defaultProps: { heading: '', content: '## Hello\n\nWrite **markdown** here.', stratumTheme: 'paper' },
    render: (rawProps) => {
      const data = pbProps(rawProps);
      const isCobalt = data.stratumTheme === 'cobalt';
      const html = marked.parse(String(data.content || ''), { async: false }) as string;
      return (
        <section className="py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className={`cv-wave-slab p-7 sm:p-10 md:p-12 ${stratumClass(data.stratumTheme)}`}>
              {data.heading && (
                <h2 className={`font-display font-extrabold text-2xl md:text-4xl mb-4 ${isCobalt ? 'text-white' : 'text-[#172a3b]'}`}>
                  {data.heading}
                </h2>
              )}
              <div
                className={`prose max-w-none leading-relaxed space-y-4 ${isCobalt ? 'text-white/90' : 'text-[#29323e]'}`}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </section>
      );
    },
  };

  // Layout: two drop zones inside a topographic stratum (Elementor-style columns).
  const TopoColumns: ComponentConfig<any> = {
    label: 'Two-Column Stratum (Drop Zones)',
    fields: {
      ratio: {
        type: 'select',
        label: 'Column Ratio',
        options: [
          { label: '50 / 50', value: '6-6' },
          { label: '60 / 40', value: '7-5' },
          { label: '40 / 60', value: '5-7' },
          { label: '33 / 67', value: '4-8' },
        ],
      },
      stratumTheme: {
        type: 'select',
        label: 'Background',
        options: [
          { label: 'Transparent', value: 'none' },
          { label: 'Glacier Ice', value: 'ice' },
          { label: 'Slate Cobalt', value: 'cobalt' },
          { label: 'Paper White', value: 'paper' },
        ],
      },
      left: { type: 'slot', label: 'Left Column' },
      right: { type: 'slot', label: 'Right Column' },
    },
    defaultProps: { ratio: '6-6', stratumTheme: 'none', left: [], right: [] },
    render: ({ ratio, stratumTheme, left: Left, right: Right }: any) => {
      const [l, r] = String(ratio || '6-6').split('-');
      const spans: Record<string, string> = {
        '4': 'lg:col-span-4', '5': 'lg:col-span-5', '6': 'lg:col-span-6', '7': 'lg:col-span-7', '8': 'lg:col-span-8',
      };
      const wrapper = stratumTheme && stratumTheme !== 'none' ? `cv-wave-slab p-6 sm:p-8 ${stratumClass(stratumTheme)}` : '';
      return (
        <section className="py-8">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className={wrapper}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className={spans[l] || 'lg:col-span-6'}>{Left ? <Left minEmptyHeight={120} /> : null}</div>
                <div className={spans[r] || 'lg:col-span-6'}>{Right ? <Right minEmptyHeight={120} /> : null}</div>
              </div>
            </div>
          </div>
        </section>
      );
    },
  };

  const Spacer: ComponentConfig<any> = {
    label: 'Vertical Spacer',
    fields: { height: { type: 'slider', label: 'Height (px)', min: 8, max: 240, step: 8 } },
    defaultProps: { height: 48 },
    render: ({ height }: any) => <div aria-hidden="true" style={{ height: `${Number(height) || 48}px` }} />,
  };

  return { SectionHeading, CardsGrid, ContentWithImage, MarkdownBlock, TopoColumns, Spacer };
}
