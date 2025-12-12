import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

// Função para criar cliente Supabase sob demanda (evita erro no build)
const getSupabase = async () => {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title,
      description,
      serviceType,
      priority,
      dueDate,
      observations,
      clientId,
      clientName
    } = body

    // Validação
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Tipo de serviço é obrigatório' },
        { status: 400 }
      )
    }

    // Mapear tipo de serviço para área responsável
    const serviceToArea: Record<string, string> = {
      'design': 'Designer',
      'web': 'Web Designer',
      'video': 'Motion Designer',
      'social': 'Social Media',
      'marketing': 'Marketing',
      'outro': 'Geral'
    }

    const responsibleArea = serviceToArea[serviceType] || 'Geral'

    // Mapear prioridade para temperatura
    const priorityToTemperature: Record<string, string> = {
      'urgent': 'hot',
      'high': 'hot',
      'normal': 'warm',
      'low': 'cold'
    }

    const temperature = priorityToTemperature[priority] || 'warm'

    // Criar card no banco
    const cardData = {
      title,
      description: description || '',
      observations: observations || '',
      service_type: serviceType,
      priority: priority || 'normal',
      temperature,
      due_date: dueDate || null,
      client_id: clientId || null,
      client_name: clientName || 'Cliente',
      responsible_area: responsibleArea,
      column: 'backlog',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Em produção, salvar no banco
    // const { data, error } = await supabase
    //   .from('kanban_cards')
    //   .insert(cardData)
    //   .select()
    //   .single()

    // if (error) throw error

    // Simular resposta de sucesso
    const mockResponse = {
      id: Date.now().toString(),
      ...cardData
    }

    // Criar notificação para a equipe responsável
    // await supabase.from('notifications').insert({
    //   type: 'new_request',
    //   title: `Nova solicitação: ${title}`,
    //   description: `${clientName || 'Cliente'} enviou uma nova solicitação de ${serviceType}`,
    //   target_area: responsibleArea,
    //   created_at: new Date().toISOString()
    // })

    return NextResponse.json({
      success: true,
      message: 'Solicitação criada com sucesso',
      card: mockResponse
    })

  } catch (error) {
    console.error('Erro ao criar card:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar solicitação' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const area = searchParams.get('area')
    const status = searchParams.get('status')

    // Em produção, buscar do banco
    // let query = supabase.from('kanban_cards').select('*')
    // if (area) query = query.eq('responsible_area', area)
    // if (status) query = query.eq('status', status)
    // const { data, error } = await query

    // Mock response
    const mockCards = [
      {
        id: '1',
        title: 'Landing Page - Tech Solutions',
        description: 'Criar landing page para campanha',
        service_type: 'web',
        priority: 'high',
        temperature: 'hot',
        column: 'backlog',
        client_name: 'Tech Solutions',
        created_at: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      cards: mockCards
    })

  } catch (error) {
    console.error('Erro ao buscar cards:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cards' },
      { status: 500 }
    )
  }
}

