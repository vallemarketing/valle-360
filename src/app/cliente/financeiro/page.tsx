'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PaymentCheckoutModal } from '@/components/payment/PaymentCheckoutModal';

export default function ClienteFinanceiroPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const invoices = [
    { id: 1, number: 'INV-2025-12', amount: 5000, status: 'pending', dueDate: '2025-12-15', paidDate: null },
    { id: 2, number: 'INV-2025-11', amount: 5000, status: 'paid', dueDate: '2025-11-15', paidDate: '2025-11-10' },
    { id: 3, number: 'INV-2025-10', amount: 5000, status: 'paid', dueDate: '2025-10-15', paidDate: '2025-10-12' },
    { id: 4, number: 'INV-2025-09', amount: 4500, status: 'paid', dueDate: '2025-09-15', paidDate: '2025-09-14' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#001533] dark:text-white mb-2">Financeiro</h1>
        <p className="text-[#001533]/60 dark:text-white/60">Faturas e pagamentos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/70">Valor do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(5000)}</div>
            <p className="text-xs text-foreground/60 mt-1">Por mês</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/70">Próximo Vencimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">15 Dez</div>
            <p className="text-xs text-foreground/60 mt-1">{formatCurrency(5000)}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm text-foreground/70">Total Pago em 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(55000)}</div>
            <p className="text-xs text-foreground/60 mt-1">11 meses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-lg bg-valle-navy/30 hover:bg-valle-navy/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{invoice.number}</p>
                  <p className="text-sm text-foreground/60">
                    Vencimento: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                    {invoice.paidDate && (
                      <span className="ml-2">
                        • Pago em: {new Date(invoice.paidDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                      {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    {invoice.status !== 'paid' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        Pagar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <PaymentCheckoutModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
