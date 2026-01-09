import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { callCrewService } from '@/lib/agency/crewBridge';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido (JSON)' }, { status: 400 });
  }

  const result = await callCrewService('/v1/brand/search', { method: 'POST', body });
  if (!result.ok) return NextResponse.json({ success: false, error: result.error, data: result.data }, { status: result.status || 500 });
  return NextResponse.json(result.data);
}

