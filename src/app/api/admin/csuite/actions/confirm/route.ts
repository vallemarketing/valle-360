import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { executeActionDraft } from '@/lib/csuite/actionDraftExecutor';

export const dynamic = 'force-dynamic';

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido (JSON)' }, { status: 400 });
  }

  const draftId = String(body?.draft_id || '').trim();
  if (!draftId || !isUuid(draftId)) return NextResponse.json({ success: false, error: 'draft_id inválido' }, { status: 400 });

  const exec = await executeActionDraft({ draftId, actorUserId: gate.userId });
  if (!exec.ok) return NextResponse.json({ success: false, error: exec.executionResult?.error || 'Falha' }, { status: 400 });
  return NextResponse.json({ success: true, executed_at: exec.executedAt, execution_result: exec.executionResult });
}

