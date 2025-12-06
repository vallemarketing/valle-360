/**
 * Valle 360 - API de Notificações
 * Gerencia notificações em tempo real
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// GET - Buscar notificações
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [notificationsList, unreadCount] = await Promise.all([
      notifications.getNotifications(user.id, { unreadOnly, limit, offset }),
      notifications.getUnreadCount(user.id)
    ]);

    return NextResponse.json({
      success: true,
      notifications: notificationsList,
      unreadCount
    });

  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar notificação ou marcar como lida
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationId, notification } = body;

    switch (action) {
      case 'mark_read':
        if (!notificationId) {
          return NextResponse.json({ error: 'notificationId obrigatório' }, { status: 400 });
        }
        const readSuccess = await notifications.markAsRead(notificationId, user.id);
        return NextResponse.json({ success: readSuccess });

      case 'mark_all_read':
        const allReadSuccess = await notifications.markAllAsRead(user.id);
        return NextResponse.json({ success: allReadSuccess });

      case 'send':
        // Verificar se é admin
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (!['super_admin', 'admin'].includes(profile?.user_type)) {
          return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }

        if (!notification) {
          return NextResponse.json({ error: 'notification obrigatório' }, { status: 400 });
        }

        const result = await notifications.send(notification);
        return NextResponse.json(result);

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Erro na API de notificações:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Atualizar preferências
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const preferences = await request.json();

    const success = await notifications.updatePreferences(user.id, preferences);
    return NextResponse.json({ success });

  } catch (error: any) {
    console.error('Erro ao atualizar preferências:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
