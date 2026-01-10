/**
 * API Route: Generate Content with AI Crew
 * POST /api/admin/agency/content/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { runContentCrew, ContentCrewInput } from '@/lib/agency/crews/contentCrew';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Crews podem demorar

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
  const contentType = body?.content_type || 'post';

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

  const validTypes = ['post', 'carousel', 'reels', 'stories'];
  if (!validTypes.includes(contentType)) {
    return NextResponse.json(
      { success: false, error: `content_type inválido. Use: ${validTypes.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const input: ContentCrewInput = {
      clientId,
      topic,
      platform: platform as ContentCrewInput['platform'],
      contentType: contentType as ContentCrewInput['contentType'],
      objective: body?.objective,
      additionalContext: body?.additional_context,
    };

    const result = await runContentCrew(input, false);

    return NextResponse.json({
      success: true,
      content: {
        strategy: result.strategy,
        copy: result.copy,
        visual_concept: result.visualConcept,
        hashtags: result.hashtags,
        best_time: result.bestTime,
      },
    });
  } catch (e: any) {
    console.error('[agency/content/generate] Error:', e);
    return NextResponse.json(
      { success: false, error: String(e?.message || 'Falha ao gerar conteúdo') },
      { status: 500 }
    );
  }
}
