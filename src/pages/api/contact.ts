import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid request payload.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Anti-bot honeypot check: bots fill hidden fields; real users leave it empty
    if (body.website_url && String(body.website_url).trim().length > 0) {
      return new Response(
        JSON.stringify({ ok: true, referenceCode: 'TOPO-FILTERED' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const name = String(body.name || '').trim().slice(0, 120);
    const senderEmail = String(body.senderEmail || '').trim().slice(0, 160);
    const organization = String(body.organization || '').trim().slice(0, 160);
    const discipline = String(body.discipline || '3D & Scientific Animation').trim().slice(0, 120);
    const timeline = String(body.timeline || 'Q1 / Flexible').trim().slice(0, 80);
    const message = String(body.message || '').trim().slice(0, 4000);

    if (!name || !senderEmail || ! senderEmail.includes('@') || !message) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Please provide your name, a valid email address, and a brief project message.',
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const referenceCode = `TOPO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const submissionRecord = {
      referenceCode,
      createdAt: new Date().toISOString(),
      name,
      senderEmail,
      organization: organization || 'Independent / Direct Inquiry',
      discipline,
      timeline,
      message,
    };

    // Persist privately on the backend filesystem (never exposed publicly)
    try {
      const storageDir = path.resolve(process.cwd(), 'server', '.tmp');
      fs.mkdirSync(storageDir, { recursive: true });
      const submissionsFile = path.join(storageDir, 'contact-submissions.json');
      const existing = fs.existsSync(submissionsFile)
        ? JSON.parse(fs.readFileSync(submissionsFile, 'utf-8'))
        : [];
      const updated = Array.isArray(existing) ? [submissionRecord, ...existing] : [submissionRecord];
      fs.writeFileSync(submissionsFile, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // Non-fatal if filesystem is read-only in a serverless environment
    }

    return new Response(
      JSON.stringify({
        ok: true,
        referenceCode,
        receivedAt: submissionRecord.createdAt,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Unable to process your message right now. Please try again shortly.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
