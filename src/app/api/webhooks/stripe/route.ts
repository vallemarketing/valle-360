import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { constructWebhookEvent } from '@/lib/integrations/stripe/client';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Desabilitar body parsing do Next.js para webhooks
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Criar cliente Supabase com service role para operações de backend
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase não configurado');
      return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar webhook secret
    const { data: config } = await supabase
      .from('integration_configs')
      .select('webhook_secret')
      .eq('integration_id', 'stripe')
      .single();

    const webhookSecret = config?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret não configurado');
      return NextResponse.json({ error: 'Webhook não configurado' }, { status: 400 });
    }

    // Obter body raw e signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature ausente' }, { status: 400 });
    }

    // Verificar e construir evento
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Erro na verificação do webhook:', err.message);
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 });
    }

    // Processar evento
    const result = await processStripeEvent(event, supabase);

    // Registrar log
    await supabase.from('integration_logs').insert({
      integration_id: 'stripe',
      action: `webhook_${event.type}`,
      status: result.success ? 'success' : 'error',
      request_data: { eventId: event.id, eventType: event.type },
      response_data: result,
      error_message: result.error
    });

    return NextResponse.json({ received: true, processed: result.success });

  } catch (error: any) {
    console.error('Erro no webhook Stripe:', error);
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error.message 
    }, { status: 500 });
  }
}

async function processStripeEvent(
  event: Stripe.Event, 
  supabase: any
): Promise<{ success: boolean; action?: string; error?: string }> {
  
  try {
    switch (event.type) {
      // ========== CHECKOUT ==========
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Atualizar status do pagamento/assinatura
        if (session.mode === 'subscription') {
          // Criar registro de assinatura
          await supabase.from('subscriptions').upsert({
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            user_id: session.metadata?.userId,
            status: 'active',
            created_at: new Date().toISOString()
          });
        } else {
          // Registrar pagamento único
          await supabase.from('payments').insert({
            stripe_payment_intent_id: session.payment_intent,
            stripe_customer_id: session.customer,
            user_id: session.metadata?.userId,
            amount: session.amount_total,
            currency: session.currency,
            status: 'completed',
            created_at: new Date().toISOString()
          });
        }
        
        return { success: true, action: 'checkout_completed' };
      }

      // ========== PAGAMENTOS ==========
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await supabase.from('payments').upsert({
          stripe_payment_intent_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          updated_at: new Date().toISOString()
        }, { onConflict: 'stripe_payment_intent_id' });
        
        return { success: true, action: 'payment_succeeded' };
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await supabase.from('payments').upsert({
          stripe_payment_intent_id: paymentIntent.id,
          status: 'failed',
          error_message: paymentIntent.last_payment_error?.message,
          updated_at: new Date().toISOString()
        }, { onConflict: 'stripe_payment_intent_id' });
        
        return { success: true, action: 'payment_failed' };
      }

      // ========== ASSINATURAS ==========
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase.from('subscriptions').upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString()
        }, { onConflict: 'stripe_subscription_id' });
        
        return { success: true, action: 'subscription_created' };
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase.from('subscriptions').update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        }).eq('stripe_subscription_id', subscription.id);
        
        return { success: true, action: 'subscription_updated' };
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase.from('subscriptions').update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('stripe_subscription_id', subscription.id);
        
        return { success: true, action: 'subscription_canceled' };
      }

      // ========== FATURAS ==========
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        await supabase.from('invoices').upsert({
          stripe_invoice_id: invoice.id,
          stripe_customer_id: invoice.customer,
          stripe_subscription_id: invoice.subscription,
          amount_paid: invoice.amount_paid,
          currency: invoice.currency,
          status: 'paid',
          paid_at: new Date().toISOString()
        }, { onConflict: 'stripe_invoice_id' });
        
        return { success: true, action: 'invoice_paid' };
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        await supabase.from('invoices').upsert({
          stripe_invoice_id: invoice.id,
          status: 'payment_failed',
          updated_at: new Date().toISOString()
        }, { onConflict: 'stripe_invoice_id' });
        
        // Notificar sobre falha no pagamento
        // TODO: Enviar email/notificação
        
        return { success: true, action: 'invoice_payment_failed' };
      }

      // ========== CLIENTES ==========
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        
        // Vincular cliente Stripe ao usuário do sistema
        if (customer.email) {
          await supabase.from('clients').update({
            stripe_customer_id: customer.id
          }).eq('email', customer.email);
        }
        
        return { success: true, action: 'customer_created' };
      }

      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        
        // Atualizar dados do cliente se necessário
        await supabase.from('clients').update({
          updated_at: new Date().toISOString()
        }).eq('stripe_customer_id', customer.id);
        
        return { success: true, action: 'customer_updated' };
      }

      // ========== DISPUTAS ==========
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        
        // Registrar disputa
        await supabase.from('payment_disputes').insert({
          stripe_dispute_id: dispute.id,
          stripe_charge_id: dispute.charge,
          amount: dispute.amount,
          currency: dispute.currency,
          reason: dispute.reason,
          status: dispute.status,
          created_at: new Date().toISOString()
        });
        
        // TODO: Notificar equipe financeira
        
        return { success: true, action: 'dispute_created' };
      }

      default:
        // Evento não tratado
        console.log(`Evento Stripe não tratado: ${event.type}`);
        return { success: true, action: 'ignored' };
    }
  } catch (error: any) {
    console.error(`Erro ao processar evento ${event.type}:`, error);
    return { success: false, error: error.message };
  }
}



