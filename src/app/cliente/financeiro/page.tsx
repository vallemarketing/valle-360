'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PaymentCheckoutModal } from '@/components/payment/PaymentCheckoutModal';
import { cn } from '@/lib/utils';

export default function ClienteFinanceiroPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const invoices = [
    { id: 1, number: 'INV-2025-12', amount: 5000, status: 'pending', dueDate: '2025-12-15', paidDate: null },
    { id: 2, number: 'INV-2025-11', amount: 5000, status: 'paid', dueDate: '2025-11-15', paidDate: '2025-11-10' },
    { id: 3, number: 'INV-2025-10', amount: 5000, status: 'paid', dueDate: '2025-10-15', paidDate: '2025-10-12' },
    { id: 4, number: 'INV-2025-09', amount: 4500, status: 'paid', dueDate: '2025-09-15', paidDate: '2025-09-14' },
  ];

  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[#001533] dark:text-white mb-2">Financeiro</h1>
        <p className="text-[#001533]/60 dark:text-white/60">Gerencie suas faturas e pagamentos</p>
      </motion.div>

      {/* Alerta de Fatura Pendente */}
      {pendingInvoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30"
        >
          <AlertCircle className="size-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Você tem <strong>{pendingInvoices.length} fatura(s) pendente(s)</strong>. 
            Próximo vencimento em {new Date(pendingInvoices[0].dueDate).toLocaleDateString('pt-BR')}.
          </p>
        </motion.div>
      )}

      {/* Cards de Resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card className="hover:shadow-xl transition-shadow border-[#001533]/10 dark:border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#001533]/60 dark:text-white/60 flex items-center gap-2">
              <DollarSign className="size-4" />
              Valor do Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#001533] dark:text-white">{formatCurrency(5000)}</div>
            <p className="text-sm text-[#001533]/60 dark:text-white/60 mt-1">Por mês</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow border-[#001533]/10 dark:border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#001533]/60 dark:text-white/60 flex items-center gap-2">
              <Calendar className="size-4" />
              Próximo Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#001533] dark:text-white">15 Dez</div>
            <p className="text-sm text-[#001533]/60 dark:text-white/60 mt-1">{formatCurrency(5000)}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Histórico de Faturas - Design Azul */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#1672d6] to-[#1672d6]/80 text-white">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Histórico de Faturas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#1672d6]/10">
              {invoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-4",
                    "bg-[#1672d6]/5 hover:bg-[#1672d6]/10 transition-colors"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      invoice.status === 'paid' 
                        ? "bg-emerald-500/10 text-emerald-600" 
                        : "bg-orange-500/10 text-orange-600"
                    )}>
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="size-5" />
                      ) : (
                        <AlertCircle className="size-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#001533] dark:text-white">{invoice.number}</p>
                      <p className="text-sm text-[#001533]/60 dark:text-white/60">
                        Vencimento: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                        {invoice.paidDate && (
                          <span className="ml-2 text-emerald-600">
                            • Pago em: {new Date(invoice.paidDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#001533] dark:text-white">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <Badge 
                        variant="outline"
                        className={cn(
                          invoice.status === 'paid' 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
                            : "bg-orange-500/10 text-orange-600 border-orange-500/30"
                        )}
                      >
                        {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-[#1672d6]/30 text-[#1672d6] hover:bg-[#1672d6]/10">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button
                          size="sm"
                          className="bg-[#1672d6] hover:bg-[#1260b5] text-white"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pagar à Vista
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Formas de Pagamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-[#001533]/5 dark:bg-white/5 border border-[#001533]/10 dark:border-white/10"
      >
        <h3 className="font-semibold text-[#001533] dark:text-white mb-2">Formas de Pagamento Aceitas</h3>
        <p className="text-sm text-[#001533]/60 dark:text-white/60">
          Cartão de Crédito (pagamento à vista) • Pix • Boleto Bancário
        </p>
      </motion.div>

      {selectedInvoice && (
        <PaymentCheckoutModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
