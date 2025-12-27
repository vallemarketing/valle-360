import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';
import { publishMetaPost } from '@/lib/social/metaPublisher';

export const dynamic = 'force-dynamic';

function requireCronAuth(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV !== 'production') return null;
  if (!cronSecret) return null;
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const auth = requireCronAuth(request);
  if (auth) return auth;

  const admin = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  // Buscar posts meta agendados e aprovados
  const { data: posts, error } = await admin
    .from('instagram_posts')
    .select('*')
    .eq('backend', 'meta')
    .eq('status', 'scheduled')
    .eq('is_draft', false)
    .eq('approval_status', 'approved')
    .lte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })
    .limit(25);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  if (!posts || posts.length === 0) return NextResponse.json({ success: true, processed: 0, published: 0, failed: 0 });

  let publishedCount = 0;
  let failedCount = 0;

  for (const p of posts) {
    // marca como "publishing" para evitar concorrência
    await admin.from('instagram_posts').update({ status: 'publishing' }).eq('id', p.id);

    const published = await publishMetaPost({ post: p });
    const nextStatus = published.ok ? 'published' : 'failed';

    await admin
      .from('instagram_posts')
      .update({
        status: nextStatus,
        published_at: published.ok ? new Date().toISOString() : null,
        error_message: published.ok ? null : published.error || 'Falha ao publicar',
        raw_payload: { ...(p as any)?.raw_payload, publish_results: published.results },
      } as any)
      .eq('id', p.id);

    if (published.ok) publishedCount++;
    else failedCount++;
  }

  return NextResponse.json({ success: true, processed: posts.length, published: publishedCount, failed: failedCount });
}


