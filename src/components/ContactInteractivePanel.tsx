import React, { useId, useRef, useState } from 'react';
import { Copy, Check, PaperPlaneRight, EnvelopeSimple } from '@phosphor-icons/react';

interface Props {
  email: string;
  location?: string;
  linkedinUrl?: string;
  linkedinLabel?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

function legacyCopy(text: string): boolean {
  const field = Object.assign(document.createElement('textarea'), { value: text });
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } finally {
    field.remove();
  }
}

export default function ContactInteractivePanel({
  email,
  location = 'New York, NY (EST) · Available Worldwide',
  linkedinUrl = 'https://www.linkedin.com/in/matteo-louis-casling-7285a8150/',
  linkedinLabel = 'in/matteo-louis-casling',
  primaryCtaLabel = 'Email Matteo',
  primaryCtaHref,
  secondaryCtaLabel = 'LinkedIn Profile',
  secondaryCtaHref,
}: Props) {
  const emailId = useId();
  const timerRef = useRef<number | null>(null);
  const lastAnnouncementRef = useRef<string>('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [announcement, setAnnouncement] = useState<string>('');

  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formResult, setFormResult] = useState<{
    ok: boolean;
    referenceCode?: string;
    error?: string;
  } | null>(null);

  const safeEmail =
    email && !/matteocasling@gmail\.com/i.test(email) ? email : 'matteo@matteocasling.com';
  const mailHref =
    primaryCtaHref && !/matteocasling@gmail\.com/i.test(primaryCtaHref)
      ? primaryCtaHref
      : `mailto:${safeEmail}`;
  const linkedHref = secondaryCtaHref || linkedinUrl;

  const triggerFeedback = (ok: boolean) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setCopyState('idle');
    let nextMessage = ok ? 'Copied' : 'Copy failed';
    if (nextMessage === lastAnnouncementRef.current) {
      nextMessage += '\u00A0';
    }
    lastAnnouncementRef.current = nextMessage;
    setCopyState(ok ? 'copied' : 'failed');
    setAnnouncement(nextMessage);

    timerRef.current = window.setTimeout(() => {
      setCopyState('idle');
      setAnnouncement('');
    }, 2000);
  };

  const handleCopyEmail = async () => {
    const targetEl = document.getElementById(emailId);
    const text = targetEl ? targetEl.innerText.trim() : safeEmail;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      triggerFeedback(true);
    } catch {
      if (legacyCopy(text)) {
        triggerFeedback(true);
      } else {
        triggerFeedback(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormResult(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          senderEmail,
          organization,
          message,
          website_url: honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        referenceCode?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setFormResult({
          ok: false,
          error: data.error || 'Please check your inputs and try again.',
        });
      } else {
        setFormResult({ ok: true, referenceCode: data.referenceCode });
        setName('');
        setSenderEmail('');
        setOrganization('');
        setMessage('');
      }
    } catch {
      setFormResult({
        ok: false,
        error: 'Network error while sending your message. Please email directly.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3 font-mono-tech text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[#304774]/15">
          <span className="text-[#52637a]">EMAIL</span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <a
              id={emailId}
              href={`mailto:${safeEmail}`}
              className="text-[#1c72b4] hover:underline font-bold"
            >
              {safeEmail}
            </a>
            <span className="relative inline-flex items-center">
              <button
                type="button"
                onClick={handleCopyEmail}
                data-copied={copyState === 'copied' ? '' : undefined}
                data-failed={copyState === 'failed' ? '' : undefined}
                aria-label={`Copy ${safeEmail}`}
                className="copy-button min-w-[24px] min-h-[24px] inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#304774]/25 text-[#172a3b] hover:border-[#304774] font-mono-tech text-[11px] font-bold transition-colors cursor-pointer"
              >
                {copyState === 'copied' ? (
                  <Check size={13} weight="bold" aria-hidden="true" />
                ) : (
                  <Copy size={13} weight="bold" aria-hidden="true" />
                )}
                <span>Copy Email</span>
              </button>
              <span
                role="status"
                className={`tip absolute -top-8 right-0 px-2.5 py-0.5 rounded-full bg-[#172a3b] text-white text-[11px] font-bold whitespace-nowrap transition-opacity duration-150 pointer-events-none ${
                  copyState === 'idle' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {announcement}
              </span>
            </span>
          </div>
        </div>

        {location && (
          <div className="flex items-center justify-between gap-2 py-2 border-b border-[#304774]/15">
            <span className="text-[#52637a]">BASE</span>
            <span className="text-[#172a3b] font-bold text-right">{location}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 py-2 border-b border-[#304774]/15">
          <span className="text-[#52637a]">LINKEDIN</span>
          <a
            href={linkedHref}
            target="_blank"
            rel="noreferrer"
            className="text-[#1c72b4] hover:underline font-bold truncate max-w-[240px]"
          >
            {linkedinLabel}
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div className="font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#304774]">
          Direct Project Inquiry
        </div>

        {/* Honeypot field for bot filtering */}
        <input
          type="text"
          name="website_url"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            aria-label="Your Name"
            className="w-full rounded-xl bg-white/90 border border-[#304774]/20 px-3 py-2 text-xs text-[#172a3b] placeholder:text-[#52637a] focus:outline-none focus:border-[#304774]"
          />
          <input
            type="email"
            required
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="Your Email"
            aria-label="Your Email"
            className="w-full rounded-xl bg-white/90 border border-[#304774]/20 px-3 py-2 text-xs text-[#172a3b] placeholder:text-[#52637a] focus:outline-none focus:border-[#304774]"
          />
        </div>

        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Organization / Team (Optional)"
          aria-label="Organization or Team"
          className="w-full rounded-xl bg-white/90 border border-[#304774]/20 px-3 py-2 text-xs text-[#172a3b] placeholder:text-[#52637a] focus:outline-none focus:border-[#304774]"
        />

        <textarea
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Brief scope, timeline, or role details..."
          aria-label="Message"
          className="w-full rounded-xl bg-white/90 border border-[#304774]/20 px-3 py-2 text-xs text-[#172a3b] placeholder:text-[#52637a] focus:outline-none focus:border-[#304774] resize-y"
        />

        {formResult && (
          <div
            role="status"
            className={`rounded-xl px-3 py-2 font-mono-tech text-xs font-semibold ${
              formResult.ok
                ? 'bg-white text-[#172a3b] border border-[#304774]/25'
                : 'bg-[#fbd5cd] text-[#172a3b] border border-[#f29f8b]'
            }`}
          >
            {formResult.ok
              ? `Inquiry logged cleanly. Reference: ${formResult.referenceCode}`
              : formResult.error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-full bg-[#304774] text-white hover:bg-[#172a3b] font-mono-tech text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            <PaperPlaneRight size={15} weight="bold" />
            <span>{submitting ? 'Sending...' : 'Send Inquiry'}</span>
          </button>
          <a
            href={mailHref}
            className="px-4 py-2.5 rounded-full bg-white border border-[#304774]/25 text-[#172a3b] hover:bg-[#304774] hover:text-white font-mono-tech text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <EnvelopeSimple size={15} weight="bold" />
            <span>{primaryCtaLabel}</span>
          </a>
          {secondaryCtaLabel && linkedHref && (
            <a
              href={linkedHref}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full bg-white border border-[#304774]/25 text-[#172a3b] hover:bg-[#304774] hover:text-white font-mono-tech text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{secondaryCtaLabel}</span>
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
