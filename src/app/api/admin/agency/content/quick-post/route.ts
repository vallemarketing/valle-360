/**
 * API Route: Quick Post Generation (simplified)
 * POST /api/admin/agency/content/quick-post
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { quickPost } from '@/lib/agency/crews/contentCrew';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Body inválido (JSON)' },
      { status: 400 }
    );
  }

  const clientId = String(body?.client_id || '').trim();
  const topic = String(body?.topic || '').trim();
  const platform = body?.platform || 'instagram';

  if (!clientId) {
    return NextResponse.json(
      { success: false, error: 'client_id é obrigatório' },
      { status: 400 }
    );
  }

  if (!topic) {
    return NextResponse.json(
      { success: false, error: 'topic é obrigatório' },
      { status: 400 }
    );
  }

  const validPlatforms = ['instagram', 'linkedin', 'tiktok', 'twitter'];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json(
      { success: false, error: `platform inválida. Use: ${validPlatforms.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const result = await quickPost(
      clientId,
      topic,
      platform as 'instagram' | 'linkedin' | 'tiktok' | 'twitter'
    );

    return NextResponse.json({
      success: true,
      post: {
        copy: result.copy,
        hashtags: result.hashtags,
      },
    });
  } catch (e: any) {
    console.error('[agency/content/quick-post] Error:', e);
    return NextResponse.json(
      { success: false, error: String(e?.message || 'Falha ao gerar post') },
      { status: 500 }
    );
  }
}
