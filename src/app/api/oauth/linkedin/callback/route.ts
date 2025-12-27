import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';

export const dynamic = 'force-dynamic';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

function buildCallbackRedirect(params: { platform: string; ok: boolean; error?: string }) {
  const base = `${APP_URL || ''}/cliente/redes/callback`;
  const url = new URL(base);
  url.searchParams.set('platform', params.platform);
  url.searchParams.set('ok', params.ok ? '1' : '0');
  if (params.error) url.searchParams.set('error', params.error.slice(0, 180));
  return url.toString();
}

function parseState(raw: string | null) {
  if (!raw) return { clientId: null as string | null };
  try {
    const j = JSON.parse(raw);
    const clientId = j?.clientId ? String(j.clientId) : null;
    return { clientId };
  } catch {
    return { clientId: raw };
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!APP_URL) return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL não configurado' }, { status: 500 });
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      return NextResponse.redirect(buildCallbackRedirect({ platform: 'linkedin', ok: false, error: 'Credenciais do app não configuradas' }));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateRaw = searchParams.get('state');
    const { clientId } = parseState(stateRaw);

    if (!code) {
      return NextResponse.redirect(buildCallbackRedirect({ platform: 'linkedin', ok: false, error: 'Código de autorização não fornecido' }));
    }
    if (!clientId) {
      return NextResponse.redirect(buildCallbackRedirect({ platform: 'linkedin', ok: false, error: 'client_id ausente no state' }));
    }

    const redirectUri = `${APP_URL.replace(/\/+$/, '')}/api/oauth/linkedin/callback`;

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (tokenData?.error) {
      return NextResponse.redirect(
        buildCallbackRedirect({ platform: 'linkedin', ok: false, error: tokenData.error_description || tokenData.error || 'Erro token' })
      );
    }

    const accessToken = String(tokenData.access_token || '');
    const expiresIn = Number(tokenData.expires_in || 0);
    const expiresAtIso = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileData = await profileResponse.json();

    const externalId = String(profileData?.id || '');
    const displayName = `${profileData?.localizedFirstName || ''} ${profileData?.localizedLastName || ''}`.trim() || 'LinkedIn';

    const admin = getSupabaseAdmin();
    const { data: row, error: upErr } = await admin
      .from('social_connected_accounts')
      .upsert(
        {
          client_id: clientId,
          platform: 'linkedin',
          external_account_id: externalId || `li_${Date.now()}`,
          username: null,
          display_name: displayName,
          profile_picture_url: null,
          status: expiresAtIso ? 'active' : 'active',
          metadata: {},
        } as any,
        { onConflict: 'client_id,platform,external_account_id' }
      )
      .select('id')
      .single();
    if (upErr) throw upErr;

    await admin.from('social_connected_account_secrets').upsert(
      {
        account_id: row.id,
        access_token: accessToken || null,
        token_type: 'bearer',
        scopes: [],
        expires_at: expiresAtIso,
      } as any,
      { onConflict: 'account_id' }
    );

    return NextResponse.redirect(buildCallbackRedirect({ platform: 'linkedin', ok: true }));
  } catch (e: any) {
    return NextResponse.redirect(buildCallbackRedirect({ platform: 'linkedin', ok: false, error: e?.message || 'Erro no callback' }));
  }
}


