import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CreditosPage() {
  const balance = 8500;
  const lowBalance = balance < 5000;

  const transactions = [
    { id: 1, type: 'purchase', amount: 5000, date: '2025-11-01', description: 'Compra de créditos' },
    { id: 2, type: 'usage', amount: -1200, date: '2025-11-05', description: 'Campanha Instagram Ads' },
    { id: 3, type: 'usage', amount: -800, date: '2025-11-10', description: 'Google Ads - Novembro' },
    { id: 4, type: 'purchase', amount: 10000, date: '2025-10-15', description: 'Compra de créditos' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Créditos</h1>
        <p className="text-foreground/70">Gerencie seu saldo e adicione créditos</p>
      </div>

      {lowBalance && (
        <Card className="border-yellow-600 bg-yellow-600/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Saldo Baixo</p>
              <p className="text-sm text-foreground/70">
                Seu saldo está abaixo de R$ 5.000. Considere adicionar créditos.
              </p>
            </div>
            <Button variant="default">Adicionar Agora</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/70">Saldo Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-valle-blue">{formatCurrency(balance)}</div>
            <Button className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Créditos
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/70">Gasto no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(2000)}</div>
            <p className="text-xs text-foreground/60 mt-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              -15% vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/70">Previsão de Duração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">4.2 meses</div>
            <p className="text-xs text-foreground/60 mt-2">Com base no consumo atual</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-valle-navy/30 hover:bg-valle-navy/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <p className="text-sm text-foreground/60">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'purchase' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {transaction.type === 'purchase' ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <Badge variant={transaction.type === 'purchase' ? 'success' : 'outline'}>
                    {transaction.type === 'purchase' ? 'Compra' : 'Uso'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
