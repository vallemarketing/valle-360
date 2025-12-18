import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { userId, type, title, message, metadata, link } = await request.json()

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'userId, type, title e message são obrigatórios' },
        { status: 400 }
      )
    }

    // Inserir notificação no banco
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type, // ex: 'system', 'task_assigned', etc
        title,
        message,
        metadata: metadata || {},
        link: link || null,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar notificação:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // TODO: Implementar notificação em tempo real via WebSocket/Pusher/Socket.io
    // TODO: Implementar notificação push (Firebase Cloud Messaging)
    // TODO: Implementar notificação por email opcional

    return NextResponse.json({ 
      success: true, 
      notification 
    })
  } catch (error: any) {
    console.error('Erro ao enviar notificação:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



