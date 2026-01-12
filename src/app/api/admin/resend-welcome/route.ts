/**
 * API para reenviar email de boas-vindas para colaborador
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';

export const dynamic = 'force-dynamic';

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

    const { employeeId, emailPessoal, novaSenha } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId é obrigatório' }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Buscar dados do colaborador
    const { data: employee, error: empError } = await db
      .from('employees')
      .select('id, user_id, full_name, email, phone')
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 });
    }

    const emailCorporativo = employee.email;
    const nome = employee.full_name?.split(' ')[0] || 'Colaborador';

    // Se foi fornecida nova senha, atualizar no auth
    let senhaFinal = novaSenha;
    if (novaSenha && employee.user_id) {
      const { error: updateError } = await db.auth.admin.updateUserById(employee.user_id, {
        password: novaSenha,
      });

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        return NextResponse.json({ 
          error: 'Erro ao atualizar senha: ' + updateError.message 
        }, { status: 500 });
      }
    } else if (!novaSenha) {
      // Gerar nova senha
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
      senhaFinal = 'Valle@';
      for (let i = 0; i < 6; i++) {
        senhaFinal += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Atualizar no auth
      if (employee.user_id) {
        const { error: updateError } = await db.auth.admin.updateUserById(employee.user_id, {
          password: senhaFinal,
        });

        if (updateError) {
          console.error('Erro ao atualizar senha:', updateError);
          return NextResponse.json({ 
            error: 'Erro ao atualizar senha: ' + updateError.message 
          }, { status: 500 });
        }
      }
    }

    // Determinar email de destino
    const emailDestino = emailPessoal || emailCorporativo;

    // Tentar enviar email via SendGrid
    const sendgridApiKey = (process.env.SENDGRID_API_KEY || '').trim();
    const fromEmail = (process.env.SENDGRID_FROM_EMAIL || 'noreply@valle360.com.br').trim();
    const fromName = (process.env.SENDGRID_FROM_NAME || 'Valle 360').trim();
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.valle360.com.br/login';
    const webmailUrl = process.env.WEBMAIL_URL || 'https://valle360.com.br/webmail';

    if (!sendgridApiKey) {
      return NextResponse.json({
        success: false,
        error: 'SendGrid não configurado',
        credentials: {
          email: emailCorporativo,
          senha: senhaFinal,
          loginUrl,
        },
        message: 'Credenciais geradas mas email não enviado. Envie manualmente.',
      });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Suas Credenciais - Valle 360</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1672d6 0%, #001533 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔐 Suas Credenciais de Acesso</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${nome}</strong>,
              </p>
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Aqui estão suas credenciais de acesso ao sistema Valle 360:
              </p>
              
              <div style="background-color: #f0f6ff; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px; font-weight: 600;">📧 Email:</td>
                    <td style="color: #1672d6; font-size: 16px; font-weight: 700;">${emailCorporativo}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; font-weight: 600;">🔑 Senha:</td>
                    <td style="color: #e74c3c; font-size: 18px; font-weight: 700; font-family: monospace;">${senhaFinal}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${loginUrl}" style="display: inline-block; background-color: #1672d6; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                  Acessar Sistema
                </a>
              </div>

              <p style="color: #e74c3c; font-size: 14px; text-align: center;">
                ⚠️ Altere sua senha no primeiro acesso!
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Valle 360
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Enviar via SendGrid
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: emailDestino }] }],
        from: { email: fromEmail, name: fromName },
        subject: '🔐 Suas Credenciais de Acesso - Valle 360',
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    });

    if (sgResponse.status === 202 || sgResponse.ok) {
      return NextResponse.json({
        success: true,
        message: `Email enviado com sucesso para ${emailDestino}`,
        credentials: {
          email: emailCorporativo,
          senha: senhaFinal,
          loginUrl,
        },
      });
    } else {
      const errorText = await sgResponse.text();
      console.error('SendGrid error:', errorText);
      return NextResponse.json({
        success: false,
        error: `SendGrid retornou status ${sgResponse.status}`,
        details: errorText,
        credentials: {
          email: emailCorporativo,
          senha: senhaFinal,
          loginUrl,
        },
        message: 'Credenciais geradas mas email não enviado. Envie manualmente.',
      });
    }

  } catch (error: any) {
    console.error('[ResendWelcome] Erro:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
