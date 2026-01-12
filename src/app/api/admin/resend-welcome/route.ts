/**
 * API para reenviar email de boas-vindas para colaborador ou cliente
 * Usa sistema de fallback: SendGrid → Resend → Exibição Manual
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';
import { sendWelcomeEmail } from '@/lib/email/emailService';

export const dynamic = 'force-dynamic';

// Gerar senha aleatória segura
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
  let password = 'Valle@';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { 
      employeeId,      // ID do colaborador (user_id ou employee.id)
      clientId,        // ID do cliente (alternativo)
      emailPessoal,    // Email pessoal para enviar (opcional)
      novaSenha,       // Nova senha (opcional - gera automaticamente se não fornecida)
      tipo = 'colaborador' // 'colaborador' ou 'cliente'
    } = await request.json();

    if (!employeeId && !clientId) {
      return NextResponse.json({ 
        error: 'employeeId ou clientId é obrigatório' 
      }, { status: 400 });
    }

    const db = getSupabaseAdmin();
    let userId: string = '';
    let emailCorporativo: string = '';
    let nome: string = '';
    let areasTexto: string = '';

    // ============================================
    // BUSCAR DADOS DO COLABORADOR
    // ============================================
    if (employeeId || tipo === 'colaborador') {
      const id = employeeId || clientId;
      
      // Tentar buscar por user_id primeiro
      let employee: any = null;
      const { data: empByUserId } = await db
        .from('employees')
        .select('id, user_id, first_name, last_name, areas, whatsapp')
        .eq('user_id', id)
        .single();
      
      if (empByUserId) {
        employee = empByUserId;
        userId = empByUserId.user_id;
      } else {
        // Tentar por id do employee
        const { data: empById } = await db
          .from('employees')
          .select('id, user_id, first_name, last_name, areas, whatsapp')
          .eq('id', id)
          .single();
        
        if (empById) {
          employee = empById;
          userId = empById.user_id;
        }
      }

      if (!employee) {
        return NextResponse.json({ 
          error: 'Colaborador não encontrado' 
        }, { status: 404 });
      }

      // Buscar email do users
      const { data: user } = await db
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      emailCorporativo = user?.email || '';
      nome = employee.first_name || 'Colaborador';
      areasTexto = Array.isArray(employee.areas) ? employee.areas.join(', ') : '';
    }

    // ============================================
    // BUSCAR DADOS DO CLIENTE
    // ============================================
    if (clientId && tipo === 'cliente') {
      const { data: client, error: clientError } = await db
        .from('clients')
        .select('id, user_id, company_name, contact_name, contact_email')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        return NextResponse.json({ 
          error: 'Cliente não encontrado' 
        }, { status: 404 });
      }

      userId = client.user_id;
      
      // Buscar email do users
      const { data: user } = await db
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      emailCorporativo = user?.email || client.contact_email || '';
      nome = client.contact_name || client.company_name || 'Cliente';
    }

    if (!emailCorporativo) {
      return NextResponse.json({ 
        error: 'Email corporativo não encontrado' 
      }, { status: 400 });
    }

    // ============================================
    // GERAR/ATUALIZAR SENHA
    // ============================================
    const senhaFinal = novaSenha || generatePassword();

    // Atualizar senha no auth
    if (userId) {
      const { error: updateError } = await db.auth.admin.updateUserById(userId, {
        password: senhaFinal,
      });

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        // Não retorna erro - tenta enviar mesmo assim
      }
    }

    // ============================================
    // ENVIAR EMAIL COM FALLBACK
    // ============================================
    const emailDestino = emailPessoal || emailCorporativo;
    
    const result = await sendWelcomeEmail({
      emailDestino,
      emailCorporativo,
      senha: senhaFinal,
      nome,
      areasTexto: tipo === 'colaborador' ? areasTexto : undefined,
      tipo: tipo as 'colaborador' | 'cliente',
    });

    // ============================================
    // RETORNAR RESULTADO
    // ============================================
    const webmailUrl = process.env.WEBMAIL_URL || 'https://webmail.vallegroup.com.br/';
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.valle360.com.br/login';

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email enviado com sucesso para ${emailDestino}`,
        provider: result.provider,
        credentials: {
          email: emailCorporativo,
          senha: senhaFinal,
          webmailUrl,
          loginUrl,
        },
      });
    }

    // Fallback mode - retorna credenciais para envio manual
    return NextResponse.json({
      success: false,
      fallbackMode: true,
      message: result.message,
      error: result.error,
      credentials: {
        email: emailCorporativo,
        senha: senhaFinal,
        webmailUrl,
        loginUrl,
        emailDestino,
      },
      hint: 'Email não enviado automaticamente. Use as credenciais acima para enviar manualmente.',
    });

  } catch (error: any) {
    console.error('[ResendWelcome] Erro:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
