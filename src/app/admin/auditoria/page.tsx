'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Shield, Search, Download, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  user_email: string;
  action_type: string;
  table_name: string;
  record_id: string;
  created_at: string;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, actionFilter]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (data) setLogs(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchQuery) {
      filtered = filtered.filter(
        l =>
          l.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.table_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(l => l.action_type === actionFilter);
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      INSERT: 'bg-green-600',
      UPDATE: 'bg-blue-600',
      DELETE: 'bg-red-600',
      LOGIN: 'bg-purple-600',
      LOGOUT: 'bg-gray-600',
      APPROVE: 'bg-teal-600',
      REJECT: 'bg-orange-600',
    };
    return colors[action] || 'bg-gray-600';
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-valle-navy-900">Auditoria do Sistema</h1>
          <p className="text-valle-silver-600 mt-2">Registros de todas as ações no sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['INSERT', 'UPDATE', 'DELETE', 'APPROVE'].map((action) => (
          <Card key={action}>
            <CardContent className="p-6 text-center">
              <Shield className={`w-8 h-8 mx-auto mb-2 ${getActionColor(action).replace('bg-', 'text-')}`} />
              <p className="text-2xl font-bold text-valle-navy-900">
                {logs.filter(l => l.action_type === action).length}
              </p>
              <p className="text-sm text-valle-silver-600">{action}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Registros de Auditoria</CardTitle>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-valle-silver-500" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-4 py-2 border border-valle-silver-300 rounded-lg bg-white"
              >
                <option value="all">Todas as ações</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="LOGIN">LOGIN</option>
                <option value="APPROVE">APPROVE</option>
                <option value="REJECT">REJECT</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-valle-silver-400 mx-auto mb-3" />
                <p className="text-valle-silver-600">Nenhum registro encontrado</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-3 bg-valle-silver-50 rounded-lg hover:bg-valle-blue-50 transition-colors"
                >
                  <Badge className={`${getActionColor(log.action_type)} text-white`}>
                    {log.action_type}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-valle-navy-900">
                      {log.user_email || 'Sistema'}
                    </p>
                    <p className="text-xs text-valle-silver-600">
                      {log.table_name} - {log.record_id}
                    </p>
                  </div>
                  <p className="text-xs text-valle-silver-500">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
