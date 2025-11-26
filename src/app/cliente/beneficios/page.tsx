'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Star, Share2, Trophy, Copy, Check, Users, Calendar, DollarSign } from 'lucide-react';

interface Referral {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'active' | 'paid';
  signedUpAt: string;
  earnings: number;
}

export default function BeneficiosPage() {
  const [copied, setCopied] = useState(false);

  const referrals: Referral[] = [
    {
      id: 1,
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      status: 'paid',
      signedUpAt: '2025-09-15',
      earnings: 500,
    },
    {
      id: 2,
      name: 'João Santos',
      email: 'joao@exemplo.com',
      status: 'active',
      signedUpAt: '2025-10-01',
      earnings: 500,
    },
    {
      id: 3,
      name: 'Ana Costa',
      email: 'ana@exemplo.com',
      status: 'active',
      signedUpAt: '2025-10-10',
      earnings: 500,
    },
    {
      id: 4,
      name: 'Pedro Oliveira',
      email: 'pedro@exemplo.com',
      status: 'active',
      signedUpAt: '2025-10-20',
      earnings: 500,
    },
    {
      id: 5,
      name: 'Carla Mendes',
      email: 'carla@exemplo.com',
      status: 'pending',
      signedUpAt: '2025-10-28',
      earnings: 0,
    },
  ];

  const totalEarnings = referrals.filter((r) => r.status !== 'pending').reduce((sum, r) => sum + r.earnings, 0);
  const activeReferrals = referrals.filter((r) => r.status === 'active' || r.status === 'paid').length;

  const handleCopy = () => {
    navigator.clipboard.writeText('https://valle360.com/ref/GUILHERME2024');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: Referral['status']) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
      active: { label: 'Ativo', className: 'bg-green-100 text-green-700' },
      paid: { label: 'Pago', className: 'bg-blue-100 text-blue-700' },
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Benefícios</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Programa de indicações e vantagens exclusivas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">
              Total de Indicações
            </CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{activeReferrals}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Clientes ativos indicados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">
              Ganhos Totais
            </CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              R$ {totalEarnings.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Em créditos acumulados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">Nível</CardTitle>
            <Trophy className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">Gold</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              5% de desconto em serviços
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-orange-600" />
            <CardTitle>Seu Link de Indicação</CardTitle>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Compartilhe e ganhe <span className="font-bold text-orange-600">R$ 500</span> em créditos
            para cada cliente que se tornar ativo!
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value="https://valle360.com/ref/GUILHERME2024"
              readOnly
              className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
            <Button
              onClick={handleCopy}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suas Indicações</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Acompanhe o status de cada indicação
          </p>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Nenhuma indicação ainda</p>
              <p className="text-sm mt-1">Compartilhe seu link para começar a ganhar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {referral.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {referral.email}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(referral.signedUpAt).toLocaleDateString('pt-BR')}
                        </div>
                        {referral.status !== 'pending' && (
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <DollarSign className="w-3 h-3" />
                            R$ {referral.earnings}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(referral.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefícios Disponíveis</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Use seus créditos para resgatar vantagens
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Consultoria Gratuita</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  1 hora de consultoria estratégica
                </p>
                <Badge variant="outline" className="mt-1">
                  R$ 1.000 em créditos
                </Badge>
              </div>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">Resgatar</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Design Gráfico Extra</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  2 artes adicionais no mês
                </p>
                <Badge variant="outline" className="mt-1">
                  R$ 500 em créditos
                </Badge>
              </div>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">Resgatar</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Upgrade de Plano</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  1 mês de plano premium
                </p>
                <Badge variant="outline" className="mt-1">
                  R$ 2.500 em créditos
                </Badge>
              </div>
            </div>
            <Button variant="outline" disabled>
              Em breve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
