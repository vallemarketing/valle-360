import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createSendGridClient } from '@/lib/integrations/email/sendgrid'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Somente admin (esse endpoint envia senha)
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin')
    if (isAdminError || !isAdmin) {
      return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 })
    }

    const { emailPessoal, emailCorporativo, nome, senha, areasTexto, loginUrl } = await request.json()

    if (!emailPessoal || !emailCorporativo || !nome || !senha) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const webmailUrl =
      (process.env.WEBMAIL_URL || process.env.NEXT_PUBLIC_WEBMAIL_URL || process.env.CPANEL_WEBMAIL_URL || '').trim() ||
      'https://valle360.com.br/webmail'

    // HTML do email de boas-vindas
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Valle 360</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header com gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #4370d1 0%, #0f1b35 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Bem-vindo à Valle 360!</h1>
              <p style="color: #ffffff; opacity: 0.9; margin: 10px 0 0 0; font-size: 16px;">Estamos juntos nessa jornada de sucesso!</p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${nome}</strong>,
              </p>
              
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                É com o coração cheio de alegria que damos as <strong>BOAS-VINDAS</strong> à família Valle 360! 🎊
              </p>

              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hoje marca o início de uma parceria que promete ser repleta de conquistas, aprendizado e muito sucesso! 
                Acreditamos que juntos, vamos construir algo verdadeiramente extraordinário.
              </p>

              ${areasTexto ? `
              <div style="background-color: #f0f6ff; border-left: 4px solid #4370d1; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #2c3e50; font-size: 14px; margin: 0;">
                  <strong>💼 Você fará parte do time de:</strong><br>
                  <span style="color: #4370d1; font-weight: 600;">${areasTexto}</span>
                </p>
              </div>
              ` : ''}

              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Na Valle 360, não somos apenas colegas de trabalho - somos uma família que se apoia, 
                cresce junta e celebra cada vitória como se fosse a primeira! 🌟
              </p>

              <!-- Credenciais de Acesso -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
                  🔐 Seus Dados de Acesso
                </h2>
                
                <div style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 20px; margin: 15px 0;">
                  <table width="100%" cellpadding="8" cellspacing="0">
                    <tr>
                      <td style="color: #666; font-size: 14px; font-weight: 600; padding: 8px 0;">📧 Email Corporativo:</td>
                    </tr>
                    <tr>
                      <td style="color: #4370d1; font-size: 16px; font-weight: 700; padding: 0 0 15px 0;">${emailCorporativo}</td>
                    </tr>
                    <tr>
                      <td style="color: #666; font-size: 14px; font-weight: 600; padding: 8px 0;">🔑 Senha Provisória:</td>
                    </tr>
                    <tr>
                      <td style="color: #e74c3c; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace; padding: 0 0 15px 0;">${senha}</td>
                    </tr>
                  </table>
                </div>

                <div style="text-align: center; margin: 25px 0 10px 0;">
                  <a href="${loginUrl}" style="display: inline-block; background-color: #ffffff; color: #4370d1; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                    ➜ Acessar Sistema Valle 360
                  </a>
                </div>

                <div style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 18px; margin: 15px 0;">
                  <p style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px; font-weight: 700;">
                    📬 Acesso ao seu Email Corporativo (Webmail)
                  </p>
                  <p style="margin: 0 0 8px 0; color: #2c3e50; font-size: 14px;">
                    <strong>Link:</strong> <a href="${webmailUrl}" style="color: #4370d1; text-decoration: underline;">${webmailUrl}</a>
                  </p>
                  <p style="margin: 0 0 8px 0; color: #2c3e50; font-size: 14px;">
                    <strong>Login:</strong> ${emailCorporativo}
                  </p>
                  <p style="margin: 0; color: #2c3e50; font-size: 14px;">
                    <strong>Senha:</strong> ${senha}
                  </p>
                </div>
              </div>

              <!-- Aviso Importante -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #856404; font-size: 14px; margin: 0; font-weight: 600;">
                  ⚠️ IMPORTANTE: Altere sua senha no primeiro acesso para garantir a segurança da sua conta!
                </p>
              </div>

              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
                <strong>Bem-vindo à família Valle 360! 🚀</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 12px; margin: 0 0 10px 0;">
                Valle 360 - Sistema de Marketing Inteligente
              </p>
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Valle 360. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // SendGrid (db/env) — padrão único
    const { data: cfg } = await supabase
      .from('integration_configs')
      .select('status, api_key, config')
      .eq('integration_id', 'sendgrid')
      .maybeSingle()

    const envApiKey = (process.env.SENDGRID_API_KEY || '').trim()
    const dbApiKey = (cfg?.status === 'connected' ? String(cfg?.api_key || '') : '').trim()
    const apiKey = dbApiKey || envApiKey
    if (!apiKey) {
      return NextResponse.json({ error: 'SendGrid não está conectado (db/env)' }, { status: 400 })
    }

    const fromEmail = String(cfg?.config?.fromEmail || process.env.SENDGRID_FROM_EMAIL || 'noreply@valle360.com.br').trim()
    const fromName = String(cfg?.config?.fromName || process.env.SENDGRID_FROM_NAME || 'Valle 360').trim()

    const client = createSendGridClient({ apiKey, fromEmail, fromName })
    const sendRes = await client.sendEmail({
      to: { email: emailPessoal },
      subject: '🎉 Bem-vindo à Família Valle 360! Seus Dados de Acesso 🚀',
      html: htmlContent,
    })

    if (!(sendRes as any)?.success) {
      return NextResponse.json({ error: (sendRes as any)?.error || 'Falha ao enviar e-mail' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      emailPessoal,
      emailCorporativo,
      webmailUrl
    })

  } catch (error: any) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido'
    }, { status: 500 })
  }
}

