'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Play, Eye, KanbanSquare, RotateCcw } from 'lucide-react';

type WorkflowStatus = 'pending' | 'completed' | 'error';

type WorkflowTransitionRow = {
  id: string;
  from_area: string;
  to_area: string;
  trigger_event: string;
  data_payload: any;
  status: WorkflowStatus | string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  created_by: string | null;
};

type EventRow = {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  actor_user_id: string | null;
  payload: any;
  status: string;
  error_message: string | null;
  correlation_id: string | null;
  created_at: string;
  processed_at: string | null;
};

function statusBadge(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'pending') return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">Pendente</Badge>;
  if (s === 'completed' || s === 'processed') return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">OK</Badge>;
  if (s === 'error') return <Badge className="bg-red-500/10 text-red-700 border-red-500/30">Erro</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function normalizeStatusForTab(tab: 'transitions' | 'events', status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'all' || s === 'pending' || s === 'error') return s;
  if (tab === 'events') {
    if (s === 'completed') return 'processed';
    if (s === 'processed') return 'processed';
    return s;
  }
  // transitions
  if (s === 'processed') return 'completed';
  if (s === 'completed') return 'completed';
  return s;
}

function getKanbanLinkFromTransition(t: WorkflowTransitionRow): string | null {
  const p: any = t?.data_payload || {};
  const boardId = p.kanban_board_id || p.board_id;
  const taskId = p.kanban_task_id || p.task_id;
  if (!boardId || !taskId) return null;
  return `/admin/meu-kanban?boardId=${encodeURIComponent(String(boardId))}&taskId=${encodeURIComponent(String(taskId))}`;
}

function FluxosContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'transitions' | 'events'>('transitions');
  const [loading, setLoading] = useState(false);

  const [transitions, setTransitions] = useState<WorkflowTransitionRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);

  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterText, setFilterText] = useState('');

  const [openPayload, setOpenPayload] = useState<{ title: string; json: any } | null>(null);

  const filteredTransitions = useMemo(() => {
    const t = filterText.trim().toLowerCase();
    return (transitions || [])
      .filter((r) => (filterStatus === 'all' ? true : String(r.status).toLowerCase() === filterStatus))
      .filter((r) => {
        if (!t) return true;
        const payloadStr = (() => {
          try {
            return JSON.stringify(r.data_payload || {}).toLowerCase();
          } catch {
            return '';
          }
        })();
        return (
          String(r.from_area || '').toLowerCase().includes(t) ||
          String(r.to_area || '').toLowerCase().includes(t) ||
          String(r.trigger_event || '').toLowerCase().includes(t) ||
          String(r.error_message || '').toLowerCase().includes(t) ||
          payloadStr.includes(t)
        );
      });
  }, [transitions, filterStatus, filterText]);

  const filteredEvents = useMemo(() => {
    const t = filterText.trim().toLowerCase();
    return (events || [])
      .filter((r) => (filterStatus === 'all' ? true : String(r.status).toLowerCase() === filterStatus))
      .filter((r) => {
        if (!t) return true;
        const payloadStr = (() => {
          try {
            return JSON.stringify(r.payload || {}).toLowerCase();
          } catch {
            return '';
          }
        })();
        return (
          String(r.event_type || '').toLowerCase().includes(t) ||
          String(r.entity_type || '').toLowerCase().includes(t) ||
          String(r.error_message || '').toLowerCase().includes(t) ||
          payloadStr.includes(t)
        );
      });
  }, [events, filterStatus, filterText]);

  const stats = useMemo(() => {
    const t = transitions || [];
    const e = events || [];
    const count = (arr: any[], status: string) => arr.filter((x) => String(x.status).toLowerCase() === status).length;
    return {
      transitions: {
        pending: count(t, 'pending'),
        error: count(t, 'error'),
        completed: count(t, 'completed'),
        total: t.length,
      },
      events: {
        pending: count(e, 'pending'),
        error: count(e, 'error'),
        processed: count(e, 'processed'),
        total: e.length,
      },
    };
  }, [transitions, events]);

  const loadTransitions = useCallback(async () => {
    const res = await fetch(`/api/admin/workflow-transitions?limit=200`);
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || `Erro ao carregar fluxos [${res.status}]`);
    setTransitions(json?.transitions || []);
  }, []);

  const loadEvents = useCallback(async () => {
    const res = await fetch(`/api/admin/events?limit=200`);
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || `Erro ao carregar eventos [${res.status}]`);
    setEvents(json?.events || []);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadTransitions(), loadEvents()]);
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao atualizar');
    } finally {
      setLoading(false);
    }
  }, [loadTransitions, loadEvents]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Permite deep-link: /admin/fluxos?tab=events&status=error&q=invoice.paid
  useEffect(() => {
    const tabParam = (searchParams.get('tab') || '').toLowerCase();
    const statusParam = (searchParams.get('status') || '').toLowerCase();
    const qParam = searchParams.get('q') || '';

    if (tabParam === 'events' || tabParam === 'transitions') {
      setTab(tabParam as any);
    }
    if (statusParam) {
      const normalized = normalizeStatusForTab(
        (tabParam === 'events' || tabParam === 'transitions') ? (tabParam as any) : tab,
        statusParam
      );
      setFilterStatus(normalized);
    }
    if (qParam) {
      setFilterText(qParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Se o usuário trocar aba, ajustar status "OK" para o equivalente correto.
  useEffect(() => {
    setFilterStatus((prev) => normalizeStatusForTab(tab, prev));
  }, [tab]);

  const updateTransitionStatus = async (id: string, status: WorkflowStatus, error_message?: string) => {
    try {
      const res = await fetch('/api/admin/workflow-transitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, error_message }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `Falha ao atualizar [${res.status}]`);
      toast.success('Fluxo atualizado');
      await loadTransitions();
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao atualizar fluxo');
    }
  };

  const processPendingEvents = async () => {
    try {
      const res = await fetch('/api/admin/events/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 50 }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `Falha ao processar eventos [${res.status}]`);
      toast.success(`Eventos processados: ${json?.processed || 0} (falhas: ${json?.failed || 0})`);
      await refreshAll();
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao processar eventos');
    }
  };

  const reprocessEvent = async (id: string) => {
    try {
      const res = await fetch('/api/admin/events/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `Falha ao reprocessar [${res.status}]`);
      toast.success('Evento reprocessado');
      await refreshAll();
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao reprocessar evento');
    }
  };

  const sendTransitionToKanban = async (id: string) => {
    try {
      const res = await fetch('/api/admin/workflow-transitions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `Falha ao enviar para Kanban [${res.status}]`);
      toast.success('Enviado para Kanban e marcado como concluído');
      await refreshAll();
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao enviar para Kanban');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#001533] dark:text-white">Central de Fluxos</h1>
            <p className="text-[#001533]/60 dark:text-white/60">
              Visualize a conversa entre áreas (eventos → transições → execução).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refreshAll} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={processPendingEvents} disabled={loading}>
              <Play className="w-4 h-4 mr-2" />
              Processar eventos pendentes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[#001533]/10 dark:border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#001533]/70 dark:text-white/70">Transições</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold text-[#001533] dark:text-white">{stats.transitions.total}</div>
              <div className="flex gap-2">
                {statusBadge('pending')}
                <span className="text-sm text-[#001533]/60 dark:text-white/60">{stats.transitions.pending}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#001533]/10 dark:border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#001533]/70 dark:text-white/70">Eventos</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold text-[#001533] dark:text-white">{stats.events.total}</div>
              <div className="flex gap-2">
                {statusBadge('pending')}
                <span className="text-sm text-[#001533]/60 dark:text-white/60">{stats.events.pending}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#001533]/10 dark:border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#001533]/70 dark:text-white/70">Erros</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold text-[#001533] dark:text-white">
                {stats.transitions.error + stats.events.error}
              </div>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('pending')}
            >
              Pendentes
            </Button>
            <Button
              variant={filterStatus === 'error' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('error')}
            >
              Erros
            </Button>
            <Button
              variant={filterStatus === 'completed' || filterStatus === 'processed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus(tab === 'transitions' ? 'completed' : 'processed')}
            >
              OK
            </Button>
            <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>
              Todos
            </Button>
          </div>
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar (área, evento, erro...)"
            className="max-w-md"
          />
        </div>

        <Tabs
          value={tab}
          defaultValue={tab}
          onValueChange={(v) => setTab(v as 'events' | 'transitions')}
        >
          <TabsList>
            <TabsTrigger value="transitions">Transições</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="transitions" className="mt-4">
            <Card className="border-[#001533]/10 dark:border-white/10">
              <CardHeader>
                <CardTitle>Workflow Transitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredTransitions.length === 0 ? (
                  <div className="text-sm text-[#001533]/60 dark:text-white/60">Nenhuma transição encontrada.</div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransitions.map((t) => (
                      (() => {
                        const kanbanLink = getKanbanLinkFromTransition(t);
                        return (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl border border-[#001533]/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#001533] dark:text-white">
                              {t.from_area} → {t.to_area}
                            </span>
                            {statusBadge(String(t.status))}
                            <Badge variant="outline">{t.trigger_event}</Badge>
                          </div>
                          <div className="text-xs text-[#001533]/60 dark:text-white/60">
                            {new Date(t.created_at).toLocaleString('pt-BR')}
                            {t.error_message ? ` • ${t.error_message}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setOpenPayload({ title: `Payload • ${t.trigger_event}`, json: t.data_payload })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Payload
                          </Button>
                          {kanbanLink ? (
                            <Button variant="outline" onClick={() => window.location.assign(kanbanLink)}>
                              <KanbanSquare className="w-4 h-4 mr-2" />
                              Abrir no Kanban
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            onClick={() => sendTransitionToKanban(t.id)}
                            disabled={String(t.status).toLowerCase() !== 'pending'}
                          >
                            <KanbanSquare className="w-4 h-4 mr-2" />
                            Enviar para Kanban
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => updateTransitionStatus(t.id, 'completed')}
                            disabled={String(t.status).toLowerCase() === 'completed'}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Concluir
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => updateTransitionStatus(t.id, 'error', 'Marcado como erro no Admin')}
                            disabled={String(t.status).toLowerCase() === 'error'}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Erro
                          </Button>
                        </div>
                      </div>
                        );
                      })()
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <Card className="border-[#001533]/10 dark:border-white/10">
              <CardHeader>
                <CardTitle>Event Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredEvents.length === 0 ? (
                  <div className="text-sm text-[#001533]/60 dark:text-white/60">Nenhum evento encontrado.</div>
                ) : (
                  <div className="space-y-2">
                    {filteredEvents.map((e) => (
                      <div
                        key={e.id}
                        className="p-4 rounded-xl border border-[#001533]/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#001533] dark:text-white">{e.event_type}</span>
                            {statusBadge(String(e.status))}
                            {e.entity_type ? <Badge variant="outline">{e.entity_type}</Badge> : null}
                          </div>
                          <div className="text-xs text-[#001533]/60 dark:text-white/60">
                            {new Date(e.created_at).toLocaleString('pt-BR')}
                            {e.error_message ? ` • ${e.error_message}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setOpenPayload({ title: `Payload • ${e.event_type}`, json: e.payload })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Payload
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => reprocessEvent(e.id)}
                            disabled={String(e.status).toLowerCase() !== 'error'}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reprocessar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!openPayload} onOpenChange={(o) => (!o ? setOpenPayload(null) : null)}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>{openPayload?.title || 'Payload'}</DialogTitle>
            </DialogHeader>
            <pre className="text-xs bg-black/5 dark:bg-white/5 rounded-lg p-4 overflow-auto max-h-[70vh]">
{JSON.stringify(openPayload?.json ?? {}, null, 2)}
            </pre>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function FluxosPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#001533]/60 dark:text-white/60">Carregando…</div>}>
      <FluxosContent />
    </Suspense>
  );
}


