import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Enviar proposta para cliente
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { proposal_id } = await request.json()

    if (!proposal_id) {
      return NextResponse.json(
        { error: 'ID da proposta é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar proposta
    const { data: proposal, error: fetchError } = await supabase
      .from('commercial_proposals')
      .select('*')
      .eq('id', proposal_id)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    if (!proposal.client_email) {
      return NextResponse.json(
        { error: 'Email do cliente não informado' },
        { status: 400 }
      )
    }

    // Gerar link da proposta
    const proposalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/proposta/${proposal.magic_link_token}`

    // Atualizar status para enviado
    const { error: updateError } = await supabase
      .from('commercial_proposals')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', proposal_id)

    if (updateError) throw updateError

    // Criar notificação
    await supabase.from('notifications').insert({
      user_id: proposal.created_by,
      title: 'Proposta Enviada',
      message: `Proposta para ${proposal.client_name} foi enviada com sucesso.`,
      type: 'proposal',
      link: `/colaborador/comercial`,
      metadata: { proposal_id }
    })

    // Criar workflow transition para Jurídico (se aceita)
    // Isso será feito quando o cliente aceitar

    // TODO: Integrar com SendGrid para enviar email real
    // Por enquanto, retornamos o link para cópia manual

    return NextResponse.json({
      success: true,
      proposal_link: proposalLink,
      message: 'Proposta enviada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao enviar proposta:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar proposta' },
      { status: 500 }
    )
  }
}



