import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { SendGridClient } from '@/lib/integrations/email/sendgrid';

export const dynamic = 'force-dynamic';

function getSendGridClientOrNull() {
  const apiKey = process.env.SENDGRID_API_KEY || 'mailto';
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@valle360.com.br';
  const fromName = process.env.SENDGRID_FROM_NAME || 'Valle 360';
  return new SendGridClient({ apiKey, fromEmail, fromName });
}

/**
 * POST /api/admin/outbound/email
 * body: { toEmail, toName?, subject, html?, text? }
 */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  const client = getSendGridClientOrNull();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido (JSON)' }, { status: 400 });
  }

  const toEmail = String(body?.toEmail || '').trim();
  const toName = body?.toName ? String(body.toName) : undefined;
  const subject = String(body?.subject || '').trim();
  const html = body?.html ? String(body.html) : undefined;
  const text = body?.text ? String(body.text) : undefined;

  if (!toEmail) return NextResponse.json({ success: false, error: 'toEmail é obrigatório' }, { status: 400 });
  if (!subject) return NextResponse.json({ success: false, error: 'subject é obrigatório' }, { status: 400 });
  if (!html && !text) return NextResponse.json({ success: false, error: 'html ou text é obrigatório' }, { status: 400 });

  const resp = await client.sendEmail({
    to: { email: toEmail, name: toName },
    subject,
    html,
    text,
    categories: ['valle360', 'superadmin', 'qualified_lead'],
    customArgs: { actor_user_id: gate.userId },
  });

  if (!resp.success) {
    return NextResponse.json({ success: false, configured: true, error: resp.error || 'Falha ao preparar email' }, { status: 502 });
  }

  return NextResponse.json({ success: true, configured: true, mailtoUrl: resp.mailtoUrl });
}




