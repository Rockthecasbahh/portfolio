import React from 'react';
import Handlebars from 'handlebars';
import type { ProjectItem, ExperienceItem } from '../lib/cms';

export function resolvePbMediaUrl(
  src: string | null | undefined,
  strapiImageUrl = 'http://localhost:1337'
): string {
  if (!src || typeof src !== 'string') return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  if (src.startsWith('/uploads/')) {
    return `${strapiImageUrl.replace(/\/$/, '')}${src}`;
  }
  return src;
}

export function normalizePbProject(
  raw: any,
  strapiImageUrl = 'http://localhost:1337'
): ProjectItem | null {
  if (!raw || typeof raw !== 'object' || !raw.title) return null;

  const coverUrl = raw?.coverImage?.url
    ? resolvePbMediaUrl(raw.coverImage.url, strapiImageUrl)
    : resolvePbMediaUrl(raw?.thumbnail, strapiImageUrl);

  const toolsList: string[] = Array.isArray(raw?.tools)
    ? raw.tools
        .map((t: any) => (typeof t === 'string' ? t : t?.name || ''))
        .filter(Boolean)
    : [];

  return {
    slug: raw?.slug || raw?.documentId || '',
    title: raw?.title || '',
    chapterNumber: raw?.chapterNumber || '01',
    category: raw?.category || 'video',
    madeFor: raw?.madeFor || '',
    year: raw?.year || '2024',
    location: raw?.location || '',
    track: raw?.track || 'both',
    featuredInReel: Boolean(raw?.featuredInReel),
    sortOrder: raw?.sortOrder ?? 99,
    shortDescription: raw?.shortDescription || '',
    mandateChallenge: raw?.mandateChallenge || '',
    executionCraft: raw?.executionCraft || '',
    impactMetric: raw?.impactMetric || '',
    thumbnail: coverUrl || '',
    secondaryImage: resolvePbMediaUrl(raw?.secondaryImage, strapiImageUrl),
    videoYoutubeId: raw?.videoYoutubeId || '',
    externalUrl: raw?.externalUrl || '',
    externalLabel: raw?.externalLabel || 'View Project',
    tools: toolsList,
  };
}

export function normalizePbExperience(
  raw: any,
  strapiImageUrl = 'http://localhost:1337'
): ExperienceItem | null {
  if (!raw || typeof raw !== 'object' || !raw.roleTitle) return null;

  const rawLogo = raw?.logoImage?.url
    ? resolvePbMediaUrl(raw.logoImage.url, strapiImageUrl)
    : resolvePbMediaUrl(raw?.logoPath, strapiImageUrl);

  const cleanLogo =
    rawLogo === '/assets/logos/iaea-fao-white.png'
      ? '/assets/logos/iaea-fao-navy.png'
      : rawLogo.replace('-white.png', '.png');

  const bulletList: string[] = Array.isArray(raw?.highlights)
    ? raw.highlights
        .map((h: any) => (typeof h === 'string' ? h : h?.text || ''))
        .filter(Boolean)
    : [];

  return {
    roleSlug: raw?.slug || raw?.roleSlug || raw?.documentId || '',
    roleTitle: raw?.roleTitle || '',
    organization: raw?.organization || '',
    organizationShort: raw?.organizationShort || '',
    location: raw?.location || '',
    period: raw?.period || '',
    sortOrder: raw?.sortOrder ?? 99,
    logoPath: cleanLogo,
    trackHighlight: raw?.trackHighlight || '',
    highlights: bulletList,
  };
}

function renderInlineChildren(children: any[]): React.ReactNode {
  if (!Array.isArray(children)) return null;
  return children.map((child, idx) => {
    if (!child) return null;
    if (child.type === 'link') {
      return (
        <a
          key={idx}
          href={child.url || '#'}
          className="text-[#1c72b4] underline font-semibold"
          target={child.url?.startsWith('http') ? '_blank' : undefined}
          rel={child.url?.startsWith('http') ? 'noreferrer' : undefined}
        >
          {renderInlineChildren(child.children || [])}
        </a>
      );
    }

    let node: React.ReactNode = child.text ?? '';
    if (child.bold) node = <strong key={`b-${idx}`}>{node}</strong>;
    if (child.italic) node = <em key={`i-${idx}`}>{node}</em>;
    if (child.underline) node = <u key={`u-${idx}`}>{node}</u>;
    if (child.code) {
      node = (
        <code
          key={`c-${idx}`}
          className="px-1.5 py-0.5 rounded bg-[#d9ebf4]/60 font-mono-tech text-xs"
        >
          {node}
        </code>
      );
    }
    return <React.Fragment key={idx}>{node}</React.Fragment>;
  });
}

export function RichTextBlocksRenderer({
  content,
  isCobalt = false,
}: {
  content: any;
  isCobalt?: boolean;
}) {
  if (!content) return null;

  if (typeof content === 'string') {
    return (
      <div
        className={`space-y-4 leading-relaxed whitespace-pre-line ${
          isCobalt ? 'text-white/90' : 'text-[#29323e]'
        }`}
      >
        {content}
      </div>
    );
  }

  if (!Array.isArray(content)) return null;

  return (
    <div className={`space-y-4 leading-relaxed ${isCobalt ? 'text-white/90' : 'text-[#29323e]'}`}>
      {content.map((block: any, idx: number) => {
        if (!block) return null;
        switch (block.type) {
          case 'heading': {
            const level = block.level || 3;
            const cls = `font-display font-bold ${
              isCobalt ? 'text-white' : 'text-[#172a3b]'
            } ${level <= 2 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`;
            return (
              <h3 key={idx} className={cls}>
                {renderInlineChildren(block.children)}
              </h3>
            );
          }
          case 'list': {
            const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag
                key={idx}
                className={`pl-5 space-y-1.5 ${
                  block.format === 'ordered' ? 'list-decimal' : 'list-disc'
                }`}
              >
                {(block.children || []).map((li: any, liIdx: number) => (
                  <li key={liIdx}>{renderInlineChildren(li?.children || [])}</li>
                ))}
              </ListTag>
            );
          }
          case 'quote':
            return (
              <blockquote
                key={idx}
                className={`border-l-4 pl-4 italic ${
                  isCobalt ? 'border-[#f29f8b] text-[#d9ebf4]' : 'border-[#304774] text-[#172a3b]'
                }`}
              >
                {renderInlineChildren(block.children)}
              </blockquote>
            );
          case 'code':
            return (
              <pre
                key={idx}
                className="p-4 rounded-2xl bg-[#172a3b] text-[#d9ebf4] font-mono-tech text-xs overflow-x-auto"
              >
                <code>{renderInlineChildren(block.children)}</code>
              </pre>
            );
          default:
            return <p key={idx}>{renderInlineChildren(block.children)}</p>;
        }
      })}
    </div>
  );
}

export function interpolateTemplateValue(value: any, context: Record<string, any> | undefined): any {
  if (!context || value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (value.includes('{{') && value.includes('}}')) {
      try {
        return Handlebars.compile(value)(context);
      } catch {
        return value;
      }
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateTemplateValue(item, context));
  }

  if (typeof value === 'object') {
    // Preserve React elements, Dates, RegExps, etc. untouched
    if (React.isValidElement(value) || value instanceof Date || value instanceof RegExp) {
      return value;
    }
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = interpolateTemplateValue(v, context);
    }
    return out;
  }

  return value;
}

/**
 * Applies Page Builder handlebars substitution ({{title}} etc.) to a block's own props,
 * without deep-copying Puck's internal `puck` context, React slot elements, or corrupting primitive arrays.
 */
export function pbProps(rawProps: any): any {
  if (!rawProps || typeof rawProps !== 'object') return {};
  const { puck, ...rest } = rawProps;
  return interpolateTemplateValue(rest, puck?.metadata);
}
