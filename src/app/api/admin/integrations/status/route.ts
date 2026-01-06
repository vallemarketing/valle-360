import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

function isSendGridConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
}

function isWhatsAppConfigured() {
  return Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  return NextResponse.json({
    sendgrid: {
      configured: isSendGridConfigured(),
      fromEmail: process.env.SENDGRID_FROM_EMAIL ? String(process.env.SENDGRID_FROM_EMAIL) : null,
    },
    whatsapp: {
      configured: isWhatsAppConfigured(),
    },
  });
}



