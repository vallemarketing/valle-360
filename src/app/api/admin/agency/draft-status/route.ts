import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { callCrewService } from '@/lib/agency/crewBridge';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  const { searchParams } = new URL(request.url);
  const draftId = String(searchParams.get('draft_id') || '').trim();
  if (!draftId) return NextResponse.json({ success: false, error: 'draft_id é obrigatório' }, { status: 400 });

  const result = await callCrewService(`/v1/approval/draft-status?draft_id=${encodeURIComponent(draftId)}`, { method: 'GET', body: undefined });
  if (!result.ok) return NextResponse.json({ success: false, error: result.error, data: result.data }, { status: result.status || 500 });
  return NextResponse.json(result.data);
}

