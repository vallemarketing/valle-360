import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Cliente aceita proposta
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { magic_link_token, action } = await request.json()

    if (!magic_link_token) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Buscar proposta pelo token
    const { data: proposal, error: fetchError } = await supabase
      .from('commercial_proposals')
      .select('*')
      .eq('magic_link_token', magic_link_token)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se proposta já foi processada
    if (['accepted', 'rejected', 'expired'].includes(proposal.status)) {
      return NextResponse.json(
        { error: `Proposta já foi ${proposal.status === 'accepted' ? 'aceita' : proposal.status === 'rejected' ? 'rejeitada' : 'expirada'}` },
        { status: 400 }
      )
    }

    // Verificar validade
    const validUntil = new Date(proposal.valid_until)
    if (validUntil < new Date()) {
      await supabase
        .from('commercial_proposals')
        .update({ status: 'expired' })
        .eq('id', proposal.id)

      return NextResponse.json(
        { error: 'Proposta expirada' },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Atualizar proposta como aceita
      const { error: updateError } = await supabase
        .from('commercial_proposals')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', proposal.id)

      if (updateError) throw updateError

      // Criar workflow transition para Jurídico
      await supabase.from('workflow_transitions').insert({
        from_area: 'comercial',
        to_area: 'juridico',
        trigger_event: 'proposal_accepted',
        data_payload: {
          proposal_id: proposal.id,
          client_id: proposal.client_id,
          client_name: proposal.client_name,
          client_email: proposal.client_email,
          total: proposal.total,
          services: proposal.services,
          payment_terms: proposal.payment_terms
        },
        status: 'pending'
      })

      // Criar notificação para comercial
      await supabase.from('notifications').insert({
        user_id: proposal.created_by,
        title: '🎉 Proposta Aceita!',
        message: `${proposal.client_name} aceitou a proposta de R$ ${proposal.total.toLocaleString('pt-BR')}.`,
        type: 'proposal_accepted',
        link: `/colaborador/comercial`,
        metadata: { proposal_id: proposal.id }
      })

      // Criar alerta inteligente
      await supabase.from('smart_alerts').insert({
        severity: 'info',
        type: 'opportunity',
        message: `Proposta aceita: ${proposal.client_name} - R$ ${proposal.total.toLocaleString('pt-BR')}. Contrato pendente no Jurídico.`,
        user_id: proposal.created_by
      })

      return NextResponse.json({
        success: true,
        message: 'Proposta aceita com sucesso! Em breve você receberá o contrato.',
        next_step: 'contract'
      })
    } else if (action === 'reject') {
      const { rejection_reason } = await request.json()

      // Atualizar proposta como rejeitada
      const { error: updateError } = await supabase
        .from('commercial_proposals')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejection_reason || 'Não informado'
        })
        .eq('id', proposal.id)

      if (updateError) throw updateError

      // Criar notificação para comercial
      await supabase.from('notifications').insert({
        user_id: proposal.created_by,
        title: 'Proposta Rejeitada',
        message: `${proposal.client_name} rejeitou a proposta. Motivo: ${rejection_reason || 'Não informado'}`,
        type: 'proposal_rejected',
        link: `/colaborador/comercial`,
        metadata: { proposal_id: proposal.id }
      })

      return NextResponse.json({
        success: true,
        message: 'Proposta rejeitada.'
      })
    } else if (action === 'view') {
      // Apenas registrar visualização
      if (!proposal.viewed_at) {
        await supabase
          .from('commercial_proposals')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', proposal.id)

        // Notificar comercial
        await supabase.from('notifications').insert({
          user_id: proposal.created_by,
          title: 'Proposta Visualizada',
          message: `${proposal.client_name} visualizou a proposta.`,
          type: 'proposal_viewed',
          link: `/colaborador/comercial`,
          metadata: { proposal_id: proposal.id }
        })
      }

      return NextResponse.json({
        success: true,
        proposal: {
          client_name: proposal.client_name,
          services: proposal.services,
          subtotal: proposal.subtotal,
          discount_percent: proposal.discount_percent,
          discount_value: proposal.discount_value,
          total: proposal.total,
          payment_terms: proposal.payment_terms,
          valid_until: proposal.valid_until,
          notes: proposal.notes,
          status: proposal.status
        }
      })
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao processar proposta:', error)
    return NextResponse.json(
      { error: 'Erro ao processar proposta' },
      { status: 500 }
    )
  }
}




