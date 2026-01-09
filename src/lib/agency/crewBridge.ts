type CrewCallResult<T = any> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: any };

function getCrewBaseUrl(): string {
  const v = String(process.env.CREW_SERVICE_URL || '').trim().replace(/\/+$/, '');
  if (!v) throw new Error('CREW_SERVICE_URL não configurada');
  return v;
}

function getCrewBridgeSecret(): string | null {
  const v = String(process.env.CREW_SERVICE_BRIDGE_SECRET || '').trim();
  return v || null;
}

export async function callCrewService<T = any>(
  path: string,
  init: { method?: string; body?: any; timeoutMs?: number } = {}
): Promise<CrewCallResult<T>> {
  const baseUrl = getCrewBaseUrl();
  const secret = getCrewBridgeSecret();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? 25_000);

  try {
    const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const res = await fetch(url, {
      method: init.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'x-bridge-secret': secret } : {}),
      },
      body: init.body != null ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, status: res.status, error: String(json?.detail || json?.error || 'Falha no Crew service'), data: json };
    }
    return { ok: true, status: res.status, data: (json ?? {}) as T };
  } catch (e: any) {
    const msg = String(e?.name === 'AbortError' ? 'Timeout ao chamar Crew service' : e?.message || 'Falha ao chamar Crew service');
    return { ok: false, status: 500, error: msg };
  } finally {
    clearTimeout(timeout);
  }
}

